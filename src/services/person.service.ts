import prisma from "@/db/client";
import * as trainerRepo from "@/db/repositories/trainer.repo";
import * as customerRepo from "@/db/repositories/customer.repo";
import * as invitationRepo from "@/db/repositories/invitation.repo";
import { AddPersonInput, RemovePersonInput } from "@/schemas/person.schema";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function getPeoplePageData(gymId: string) {
  // Parallel fetch: exactly 5 targeted queries instead of 8 redundant roundtrips
  const [trainers, customers, plans, pendingInvites, gym] =
    await Promise.all([
      trainerRepo.listTrainers(gymId),
      customerRepo.listCustomers(gymId),
      customerRepo.getActivePlans(gymId),
      invitationRepo.listPendingInvitations(gymId),
      prisma.gym.findUnique({
        where: { id: gymId },
        select: { maxCustomers: true, name: true },
      }),
    ]);

  // Derive trainer options directly in memory from already-fetched trainers (0 extra queries)
  const trainerOptions = trainers
    .filter((t) => t.status === "ACTIVE")
    .map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
    }));

  // Derive capacity directly from already-fetched customers and invitations (0 extra queries)
  const activeCount = customers.length;
  const pendingCustomerInvites = pendingInvites.filter(
    (inv) => inv.role === "CUSTOMER"
  ).length;
  const totalCount = activeCount + pendingCustomerInvites;
  const maxCustomers = gym?.maxCustomers ?? 50;

  const capacity = {
    activeCount,
    pendingInvites: pendingCustomerInvites,
    totalCount,
    maxCustomers,
    isAtCapacity: totalCount >= maxCustomers,
    gymName: gym?.name ?? "Gym",
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

