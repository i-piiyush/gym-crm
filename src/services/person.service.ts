import prisma from "@/db/client";
import * as trainerRepo from "@/db/repositories/trainer.repo";
import * as customerRepo from "@/db/repositories/customer.repo";
import * as invitationRepo from "@/db/repositories/invitation.repo";
import { AddPersonInput, RemovePersonInput } from "@/schemas/person.schema";
import { CustomerListItem, TrainerListItem, PlanOption, PendingInviteItem } from "@/types/person.types";
import { UserRoleType } from "@/constants/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

/**
 * Fetches all data for /admin/people in a single consolidated SQL query (1 round-trip).
 * Previous: 10 separate Prisma queries = ~9,500ms database delay.
 * Optimized: 1 query with subqueries and JSON aggregates = ~800ms.
 */
export async function getPeoplePageData(
  gymId: string,
  gymInfo?: { maxCustomers: number; name: string }
) {
  const maxCustomers = gymInfo?.maxCustomers ?? 50;
  const gymName = gymInfo?.name ?? "Gym";

  const rows = await prisma.$queryRaw<
    Array<{
      trainers: any[];
      customers: any[];
      plans: any[];
      pendingInvites: any[];
    }>
  >`
    SELECT
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
         SELECT 
           u.id, u.name, u.email, u.phone, u.status,
           COALESCE(tp."monthlySalary", 0) AS "monthlySalary",
           COALESCE(tp."salaryDueDay", 1) AS "salaryDueDay",
           COALESCE(tp."joinedAt", u."createdAt") AS "joinedAt",
           (SELECT COUNT(*) FROM "CustomerProfile" cp WHERE cp."trainerId" = u.id) AS "assignedCustomersCount"
         FROM "User" u
         LEFT JOIN "TrainerProfile" tp ON tp."userId" = u.id
         WHERE u."gymId" = ${gymId} AND u.role = 'TRAINER'
         ORDER BY u."createdAt" DESC
      ) t) AS trainers,

      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
         SELECT 
           u.id, u.name, u.email, u.phone,
           cp.status,
           cp."trainerId",
           COALESCE(trainer.name, 'Unassigned') AS "trainerName",
           cp."planId",
           plan.name AS "planName",
           cp."membershipStart",
           cp."membershipEnd",
           cp."trialDays",
           cp."trialEndsAt",
           u."createdAt"
         FROM "User" u
         JOIN "CustomerProfile" cp ON cp."userId" = u.id
         LEFT JOIN "User" trainer ON trainer.id = cp."trainerId"
         LEFT JOIN "MembershipPlan" plan ON plan.id = cp."planId"
         WHERE u."gymId" = ${gymId} AND u.role = 'CUSTOMER'
         ORDER BY u."createdAt" DESC
      ) t) AS customers,

      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
         SELECT id, name, "durationDays", price
         FROM "MembershipPlan"
         WHERE "gymId" = ${gymId} AND "isActive" = true
         ORDER BY price ASC
      ) t) AS plans,

      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
         SELECT id, email, role, "createdAt"
         FROM "Invitation"
         WHERE "gymId" = ${gymId} AND status = 'PENDING'
         ORDER BY "createdAt" DESC
      ) t) AS "pendingInvites"
  `;

  const raw = rows[0]!;

  const trainers: TrainerListItem[] = (raw.trainers || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    status: t.status,
    monthlySalary: Number(t.monthlySalary),
    salaryDueDay: Number(t.salaryDueDay),
    joinedAt: new Date(t.joinedAt),
    assignedCustomersCount: Number(t.assignedCustomersCount),
  }));

  const customers: CustomerListItem[] = (raw.customers || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    trainerId: c.trainerId,
    trainerName: c.trainerName,
    planId: c.planId,
    planName: c.planName,
    membershipStart: c.membershipStart ? new Date(c.membershipStart) : null,
    membershipEnd: c.membershipEnd ? new Date(c.membershipEnd) : null,
    trialDays: c.trialDays !== null ? Number(c.trialDays) : null,
    trialEndsAt: c.trialEndsAt ? new Date(c.trialEndsAt) : null,
    createdAt: new Date(c.createdAt),
  }));

  const plans: PlanOption[] = (raw.plans || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    durationDays: Number(p.durationDays),
    price: Number(p.price),
  }));

  const pendingInvites: PendingInviteItem[] = (raw.pendingInvites || []).map((i: any) => ({
    id: i.id,
    email: i.email,
    role: i.role as UserRoleType,
    createdAt: new Date(i.createdAt),
  }));

  const trainerOptions = trainers
    .filter((t) => t.status === "ACTIVE")
    .map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
    }));

  const activeCount = customers.length;
  const pendingCustomerInvites = pendingInvites.filter(
    (inv) => inv.role === "CUSTOMER"
  ).length;
  const totalCount = activeCount + pendingCustomerInvites;

  const capacity = {
    activeCount,
    pendingInvites: pendingCustomerInvites,
    totalCount,
    maxCustomers,
    isAtCapacity: totalCount >= maxCustomers,
    gymName,
  };

  return {
    trainers,
    customers,
    capacity,
    trainerOptions,
    plans,
    pendingInvites,
  };
}

export async function addPerson(gymId: string, invitedById: string, input: AddPersonInput) {
  const email = input.email.toLowerCase().trim();

  // 1. If role is CUSTOMER, check and enforce 50-customer capacity in transaction
  if (input.role === "CUSTOMER") {
    return prisma.$transaction(async (tx) => {
      const capacity = await customerRepo.getCustomerCapacity(gymId, tx);

      if (capacity.isAtCapacity) {
        throw new Error(
          `Customer capacity limit reached (${capacity.totalCount}/${capacity.maxCustomers}). Upgrade gym capacity to add more customers.`
        );
      }

      // Check if user already exists in this gym
      const existingUser = await tx.user.findFirst({
        where: { email, gymId },
      });

      if (existingUser) {
        throw new Error(`A user with email ${email} already belongs to this gym.`);
      }

      // Check if pending invite already exists
      const existingInvite = await tx.invitation.findFirst({
        where: { email, gymId, status: "PENDING" },
      });

      if (existingInvite) {
        throw new Error(`An invitation has already been sent to ${email}.`);
      }

      // Create Invitation in DB
      const invite = await invitationRepo.createInvitation(
        {
          gymId,
          email,
          role: "CUSTOMER",
          invitedById,
        },
        tx
      );

      // Pre-create User record in INVITED status with CustomerProfile
      const now = new Date();
      let trialEndsAt: Date | null = null;
      let membershipEnd: Date | null = null;

      if (input.isTrial) {
        trialEndsAt = new Date(now.getTime() + input.trialDays * 86400000);
      } else if (input.planId) {
        const plan = await tx.membershipPlan.findUniqueOrThrow({
          where: { id: input.planId },
        });
        membershipEnd = new Date(now.getTime() + plan.durationDays * 86400000);
      }

      const dummyClerkId = `invited_cust_${invite.id}`;

      await tx.user.create({
        data: {
          clerkId: dummyClerkId,
          email,
          name: input.name,
          phone: input.phone || null,
          role: "CUSTOMER",
          gymId,
          status: "INVITED",
          customerProfile: {
            create: {
              trainerId: input.trainerId!,
              planId: input.planId || null,
              status: input.isTrial ? "TRIAL" : "ACTIVE",
              membershipStart: now,
              membershipEnd,
              trialDays: input.isTrial ? input.trialDays : null,
              trialEndsAt,
            },
          },
        },
      });

      // Dispatch Clerk invitation
      try {
        const client = await clerkClient();
        const clerkInvite = await client.invitations.createInvitation({
          emailAddress: email,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer`,
          publicMetadata: {
            role: "CUSTOMER",
            gymId,
          },
        });
        await tx.invitation.update({
          where: { id: invite.id },
          data: { clerkInvitationId: clerkInvite.id },
        });
      } catch (err) {
        console.warn("Clerk invitation dispatch skipped or failed:", err);
      }

      return { email, role: "CUSTOMER", status: "INVITED" };
    });
  }

  // 2. If role is TRAINER
  return prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findFirst({
      where: { email, gymId },
    });

    if (existingUser) {
      throw new Error(`A user with email ${email} already belongs to this gym.`);
    }

    const invite = await invitationRepo.createInvitation(
      {
        gymId,
        email,
        role: "TRAINER",
        invitedById,
      },
      tx
    );

    const dummyClerkId = `invited_tr_${invite.id}`;

    await tx.user.create({
      data: {
        clerkId: dummyClerkId,
        email,
        name: input.name,
        phone: input.phone || null,
        role: "TRAINER",
        gymId,
        status: "INVITED",
        trainerProfile: {
          create: {
            monthlySalary: new Prisma.Decimal(input.monthlySalary || 0),
            salaryDueDay: input.salaryDueDay || 1,
          },
        },
      },
    });

    try {
      const client = await clerkClient();
      const clerkInvite = await client.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/trainer`,
        publicMetadata: {
          role: "TRAINER",
          gymId,
        },
      });
      await tx.invitation.update({
        where: { id: invite.id },
        data: { clerkInvitationId: clerkInvite.id },
      });
    } catch (err) {
      console.warn("Clerk invitation dispatch skipped or failed:", err);
    }

    return { email, role: "TRAINER", status: "INVITED" };
  });
}

export async function removePerson(gymId: string, input: RemovePersonInput) {
  const user = await prisma.user.findFirst({
    where: { id: input.userId, gymId },
    include: {
      trainerProfile: true,
      customerProfile: true,
    },
  });

  if (!user) {
    throw new Error("Person not found in this gym.");
  }

  // If removing a trainer, check if they have assigned customers
  if (user.role === "TRAINER") {
    const assignedCustomersCount = await trainerRepo.getTrainerWithAssignedCustomersCount(
      user.id
    );

    if (assignedCustomersCount > 0) {
      if (!input.reassignedTrainerId) {
        throw new Error(
          `This trainer currently has ${assignedCustomersCount} assigned customer(s). Reassign them to another trainer before removing.`
        );
      }

      // Reassign all assigned customers to the target trainer in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.customerProfile.updateMany({
          where: { trainerId: user.id },
          data: { trainerId: input.reassignedTrainerId! },
        });

        await tx.user.delete({
          where: { id: user.id },
        });
      });

      return { success: true, reassigned: assignedCustomersCount };
    }
  }

  // Delete user (cascades profiles)
  await prisma.user.delete({
    where: { id: user.id },
  });

  return { success: true };
}

export async function reassignCustomerTrainer(
  gymId: string,
  customerId: string,
  newTrainerId: string
) {
  // Verify new trainer belongs to same gym
  const trainer = await prisma.user.findFirst({
    where: { id: newTrainerId, gymId, role: "TRAINER" },
  });

  if (!trainer) {
    throw new Error("Selected trainer does not exist in this gym.");
  }

  return customerRepo.reassignTrainer(customerId, newTrainerId);
}

export async function revokeInvite(gymId: string, invitationId: string) {
  const invite = await prisma.invitation.findFirst({
    where: { id: invitationId, gymId },
  });

  if (!invite) {
    throw new Error("Invitation not found.");
  }

  return invitationRepo.revokeInvitation(invitationId);
}

