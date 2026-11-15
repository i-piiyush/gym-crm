import prisma from "@/db/client";
import { CustomerListItem, PlanOption } from "@/types/person.types";
import { Prisma } from "@prisma/client";

export async function listCustomers(gymId: string): Promise<CustomerListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      gymId,
      role: "CUSTOMER",
    },
    include: {
      customerProfile: {
        include: {
          trainer: {
            select: { id: true, name: true },
          },
          plan: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users
    .filter((u) => u.customerProfile !== null)
    .map((u) => {
      const profile = u.customerProfile!;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: profile.status,
        trainerId: profile.trainerId,
        trainerName: profile.trainer?.name || "Unassigned",
        planId: profile.planId,
        planName: profile.plan?.name || null,
        membershipStart: profile.membershipStart,
        membershipEnd: profile.membershipEnd,
        trialDays: profile.trialDays,
        trialEndsAt: profile.trialEndsAt,
        createdAt: u.createdAt,
      };
    });
}

/**
 * Lightweight customer dropdown selector for recording payments.
 * Avoids loading full customer profiles, trainers, and unneeded fields.
 */
export async function getCustomerOptionsForPayment(gymId: string) {
  const users = await prisma.user.findMany({
    where: {
      gymId,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      customerProfile: {
        select: {
          membershipEnd: true,
          plan: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return users
    .filter((u) => u.customerProfile !== null)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      currentPlanName: u.customerProfile?.plan?.name || null,
      membershipEnd: u.customerProfile?.membershipEnd || null,
    }));
}

/**
 * Returns active customer count, pending customer invite count, and max capacity.
 * Supports running inside an existing transaction.
 */
export async function getCustomerCapacity(
  gymId: string,
  tx?: Prisma.TransactionClient
) {
  const db = tx ?? prisma;

  const [activeCount, pendingInvites, gym] = await Promise.all([
    db.customerProfile.count({
      where: { user: { gymId } },
    }),
    db.invitation.count({
      where: { gymId, role: "CUSTOMER", status: "PENDING" },
    }),
    db.gym.findUniqueOrThrow({
      where: { id: gymId },
      select: { maxCustomers: true, name: true },
    }),
  ]);

  return {
    activeCount,
    pendingInvites,
    totalCount: activeCount + pendingInvites,
    maxCustomers: gym.maxCustomers,
    isAtCapacity: activeCount + pendingInvites >= gym.maxCustomers,
    gymName: gym.name,
  };
}

export async function reassignTrainer(customerId: string, newTrainerId: string) {
  return prisma.customerProfile.update({
    where: { userId: customerId },
    data: { trainerId: newTrainerId },
  });
}

export async function getActivePlans(gymId: string): Promise<PlanOption[]> {
  const plans = await prisma.membershipPlan.findMany({
    where: { gymId, isActive: true },
    select: {
      id: true,
      name: true,
      durationDays: true,
      price: true,
    },
    orderBy: { price: "asc" },
  });

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    durationDays: p.durationDays,
    price: Number(p.price),
  }));
}

export async function deleteCustomer(customerId: string) {
  return prisma.user.delete({
    where: { id: customerId },
  });
}

/**
 * Consolidated 1-roundtrip query for the Admin Trials page.
 * Fetches all trial customers and active membership plans in a single query.
 */
export async function getTrialsPageData(gymId: string): Promise<{
  trials: CustomerListItem[];
  plans: PlanOption[];
}> {
  const rows = await prisma.$queryRaw<
    {
      trials: Array<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        status: any;
        trainerId: string;
        trainerName: string;
        planId: string | null;
        planName: string | null;
        membershipStart: string | Date | null;
        membershipEnd: string | Date | null;
        trialDays: number | null;
        trialEndsAt: string | Date | null;
        createdAt: string | Date;
      }>;
      plans: Array<{
        id: string;
        name: string;
        durationDays: number;
        price: number;
      }>;
    }[]
  >`
    SELECT
      (
        SELECT COALESCE(json_agg(tr), '[]'::json)
        FROM (
          SELECT 
            u."id",
            u."name",
            u."email",
            u."phone",
            cp."status",
            cp."trainerId",
            COALESCE(tu."name", 'Unassigned') AS "trainerName",
            cp."planId",
            mp."name" AS "planName",
            cp."membershipStart",
            cp."membershipEnd",
            cp."trialDays",
            cp."trialEndsAt",
            u."createdAt"
          FROM "User" u
          JOIN "CustomerProfile" cp ON cp."userId" = u."id"
          LEFT JOIN "User" tu ON tu."id" = cp."trainerId"
          LEFT JOIN "MembershipPlan" mp ON mp."id" = cp."planId"
          WHERE u."gymId" = ${gymId} AND u."role" = 'CUSTOMER' AND cp."status" = 'TRIAL'
          ORDER BY cp."trialEndsAt" ASC
        ) tr
      ) AS "trials",
      (
        SELECT COALESCE(json_agg(pl), '[]'::json)
        FROM (
          SELECT 
            "id",
            "name",
            "durationDays",
            "price"::double precision AS "price"
          FROM "MembershipPlan"
          WHERE "gymId" = ${gymId} AND "isActive" = true
          ORDER BY "price" ASC
        ) pl
      ) AS "plans";
  `;

  const row = rows[0];

  const trials: CustomerListItem[] = (row?.trials || []).map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    status: t.status,
    trainerId: t.trainerId,
    trainerName: t.trainerName,
    planId: t.planId,
    planName: t.planName,
    membershipStart: t.membershipStart ? new Date(t.membershipStart) : null,
    membershipEnd: t.membershipEnd ? new Date(t.membershipEnd) : null,
    trialDays: t.trialDays ? Number(t.trialDays) : null,
    trialEndsAt: t.trialEndsAt ? new Date(t.trialEndsAt) : null,
    createdAt: new Date(t.createdAt),
  }));

  const plans: PlanOption[] = (row?.plans || []).map((p) => ({
    id: p.id,
    name: p.name,
    durationDays: Number(p.durationDays),
    price: Number(p.price),
  }));

  return { trials, plans };
}

/**
 * Consolidated 1-roundtrip query for the Admin Subscriptions page.
 * Fetches all active/expired customers and active membership plans in a single query.
 */
export async function getSubscriptionsPageData(gymId: string): Promise<{
  subscriptions: CustomerListItem[];
  plans: PlanOption[];
}> {
  const rows = await prisma.$queryRaw<
    {
      subscriptions: Array<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        status: any;
        trainerId: string;
        trainerName: string;
        planId: string | null;
        planName: string | null;
        membershipStart: string | Date | null;
        membershipEnd: string | Date | null;
        trialDays: number | null;
        trialEndsAt: string | Date | null;
        createdAt: string | Date;
      }>;
      plans: Array<{
        id: string;
        name: string;
        durationDays: number;
        price: number;
      }>;
    }[]
  >`
    SELECT
      (
        SELECT COALESCE(json_agg(sub), '[]'::json)
        FROM (
          SELECT 
            u."id",
            u."name",
            u."email",
            u."phone",
            cp."status",
            cp."trainerId",
            COALESCE(tu."name", 'Unassigned') AS "trainerName",
            cp."planId",
            mp."name" AS "planName",
            cp."membershipStart",
            cp."membershipEnd",
            cp."trialDays",
            cp."trialEndsAt",
            u."createdAt"
          FROM "User" u
          JOIN "CustomerProfile" cp ON cp."userId" = u."id"
          LEFT JOIN "User" tu ON tu."id" = cp."trainerId"
          LEFT JOIN "MembershipPlan" mp ON mp."id" = cp."planId"
          WHERE u."gymId" = ${gymId} AND u."role" = 'CUSTOMER' AND cp."status" IN ('ACTIVE', 'EXPIRED')
          ORDER BY cp."membershipEnd" ASC
        ) sub
      ) AS "subscriptions",
      (
        SELECT COALESCE(json_agg(pl), '[]'::json)
        FROM (
          SELECT 
            "id",
            "name",
            "durationDays",
            "price"::double precision AS "price"
          FROM "MembershipPlan"
          WHERE "gymId" = ${gymId} AND "isActive" = true
          ORDER BY "price" ASC
        ) pl
      ) AS "plans";
  `;

  const row = rows[0];

  const subscriptions: CustomerListItem[] = (row?.subscriptions || []).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    status: s.status,
    trainerId: s.trainerId,
    trainerName: s.trainerName,
    planId: s.planId,
    planName: s.planName,
    membershipStart: s.membershipStart ? new Date(s.membershipStart) : null,
    membershipEnd: s.membershipEnd ? new Date(s.membershipEnd) : null,
    trialDays: s.trialDays ? Number(s.trialDays) : null,
    trialEndsAt: s.trialEndsAt ? new Date(s.trialEndsAt) : null,
    createdAt: new Date(s.createdAt),
  }));

  const plans: PlanOption[] = (row?.plans || []).map((p) => ({
    id: p.id,
    name: p.name,
    durationDays: Number(p.durationDays),
    price: Number(p.price),
  }));

  return { subscriptions, plans };
}

/**
 * Lists all customers currently on trial in the gym.
 */
export async function listTrialsByGym(gymId: string): Promise<CustomerListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      gymId,
      role: "CUSTOMER",
      customerProfile: {
        status: "TRIAL",
      },
    },
    include: {
      customerProfile: {
        include: {
          trainer: {
            select: { id: true, name: true },
          },
          plan: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: {
      customerProfile: {
        trialEndsAt: "asc",
      },
    },
  });

  return users
    .filter((u) => u.customerProfile !== null)
    .map((u) => {
      const profile = u.customerProfile!;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: profile.status,
        trainerId: profile.trainerId,
        trainerName: profile.trainer?.name || "Unassigned",
        planId: profile.planId,
        planName: profile.plan?.name || null,
        membershipStart: profile.membershipStart,
        membershipEnd: profile.membershipEnd,
        trialDays: profile.trialDays,
        trialEndsAt: profile.trialEndsAt,
        createdAt: u.createdAt,
      };
    });
}

/**
 * Lists all active and expired customers to evaluate renewal timelines (7, 15, 30 days & expired).
 */
export async function listSubscriptionsByGym(gymId: string): Promise<CustomerListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      gymId,
      role: "CUSTOMER",
      customerProfile: {
        status: { in: ["ACTIVE", "EXPIRED"] },
      },
    },
    include: {
      customerProfile: {
        include: {
          trainer: {
            select: { id: true, name: true },
          },
          plan: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: {
      customerProfile: {
        membershipEnd: "asc",
      },
    },
  });

  return users
    .filter((u) => u.customerProfile !== null)
    .map((u) => {
      const profile = u.customerProfile!;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: profile.status,
        trainerId: profile.trainerId,
        trainerName: profile.trainer?.name || "Unassigned",
        planId: profile.planId,
        planName: profile.plan?.name || null,
        membershipStart: profile.membershipStart,
        membershipEnd: profile.membershipEnd,
        trialDays: profile.trialDays,
        trialEndsAt: profile.trialEndsAt,
        createdAt: u.createdAt,
      };
    });
}

/**
 * Flips overdue trials and active memberships to EXPIRED.
 */
export async function expireOverdueMemberships(now: Date = new Date()) {
  const [expiredTrials, expiredActive] = await Promise.all([
    prisma.customerProfile.updateMany({
      where: {
        status: "TRIAL",
        trialEndsAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    }),
    prisma.customerProfile.updateMany({
      where: {
        status: "ACTIVE",
        membershipEnd: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    }),
  ]);

  return {
    expiredTrialsCount: expiredTrials.count,
    expiredMembershipsCount: expiredActive.count,
    totalExpired: expiredTrials.count + expiredActive.count,
  };
}

/**
 * Fetches complete profile and workout records for the logged-in customer.
 * Consolidated into a single 1-roundtrip query for maximum performance.
 */
export async function getCustomerPortalData(userId: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      profile: {
        userId: string;
        status: string;
        membershipStart: string | Date | null;
        membershipEnd: string | Date | null;
        trialEndsAt: string | Date | null;
        user: {
          name: string;
          email: string;
          gym: {
            name: string;
            address: string;
          } | null;
        };
        trainer: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
        } | null;
        plan: {
          name: string;
          durationDays: number;
          price: number;
        } | null;
      } | null;
      attendances: Array<{
        id: string;
        date: string;
        checkInAt: string | Date;
        distanceMeters: number;
        accuracyMeters: number;
      }>;
    }>
  >`
    SELECT
      (
        SELECT row_to_json(p_row)
        FROM (
          SELECT 
            cp."userId",
            cp."status",
            cp."membershipStart",
            cp."membershipEnd",
            cp."trialEndsAt",
            json_build_object(
              'name', u."name",
              'email', u."email",
              'gym', CASE WHEN g."id" IS NOT NULL THEN json_build_object('name', g."name", 'address', g."address") ELSE NULL END
            ) AS "user",
            (
              SELECT json_build_object(
                'id', tu."id",
                'name', tu."name",
                'email', tu."email",
                'phone', tu."phone"
              )
              FROM "User" tu
              WHERE tu."id" = cp."trainerId"
            ) AS "trainer",
            (
              SELECT json_build_object(
                'name', mp."name",
                'durationDays', mp."durationDays",
                'price', mp."price"::double precision
              )
              FROM "MembershipPlan" mp
              WHERE mp."id" = cp."planId"
            ) AS "plan"
          FROM "CustomerProfile" cp
          JOIN "User" u ON u."id" = cp."userId"
          LEFT JOIN "Gym" g ON g."id" = u."gymId"
          WHERE cp."userId" = ${userId}
        ) p_row
      ) AS "profile",
      (
        SELECT COALESCE(json_agg(att_row), '[]'::json)
        FROM (
          SELECT 
            "id",
            "date",
            "checkInAt",
            "distanceMeters"::double precision AS "distanceMeters",
            "accuracyMeters"::double precision AS "accuracyMeters"
          FROM "Attendance"
          WHERE "userId" = ${userId}
          ORDER BY "checkInAt" DESC
          LIMIT 30
        ) att_row
      ) AS "attendances";
  `;

  const data = rows[0];
  if (!data?.profile) return null;

  const attendances = (data.attendances || []).map((a) => ({
    id: a.id,
    date: a.date,
    checkInAt: new Date(a.checkInAt),
    distanceMeters: Number(a.distanceMeters),
    accuracyMeters: Number(a.accuracyMeters),
  }));

  // Calculate current month check-ins
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthAttendances = attendances.filter((a) => a.date.startsWith(currentMonthPrefix));

  // Calculate consecutive streak
  const uniqueDates = Array.from(new Set(attendances.map((a) => a.date))).sort().reverse();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const checkDateStr = uniqueDates[0] === todayStr ? todayStr : yesterdayStr;

    if (uniqueDates.includes(checkDateStr)) {
      const baseDate = uniqueDates[0] === todayStr ? now : yesterday;
      for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(baseDate.getTime() - i * 86400000);
        const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;
        if (uniqueDates.includes(expectedStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    profile: {
      ...data.profile,
      membershipStart: data.profile.membershipStart ? new Date(data.profile.membershipStart) : null,
      membershipEnd: data.profile.membershipEnd ? new Date(data.profile.membershipEnd) : null,
      trialEndsAt: data.profile.trialEndsAt ? new Date(data.profile.trialEndsAt) : null,
      plan: data.profile.plan
        ? {
            ...data.profile.plan,
            price: Number(data.profile.plan.price),
          }
        : null,
    },
    attendances,
    thisMonthCount: thisMonthAttendances.length,
    streak,
  };
}

/**
 * Fetches all completed payments for a specific customer.
 * Optimized with a single SQL query joining Plan and Gym in 1 roundtrip.
 */
export async function getCustomerPayments(customerId: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      receiptNumber: string;
      amount: number;
      paidAt: string | Date;
      status: string;
      plan: {
        name: string;
        durationDays: number;
        price: number;
      } | null;
      gym: {
        name: string;
      };
    }>
  >`
    SELECT 
      p."id",
      p."receiptNumber",
      p."amount"::double precision AS "amount",
      p."paidAt",
      p."status",
      CASE WHEN mp."name" IS NOT NULL THEN
        json_build_object('name', mp."name", 'durationDays', mp."durationDays", 'price', mp."price"::double precision)
      ELSE NULL END AS "plan",
      json_build_object('name', g."name") AS "gym"
    FROM "Payment" p
    LEFT JOIN "MembershipPlan" mp ON mp."id" = p."planId"
    JOIN "Gym" g ON g."id" = p."gymId"
    WHERE p."customerId" = ${customerId}
    ORDER BY p."paidAt" DESC;
  `;

  return rows.map((p) => ({
    id: p.id,
    receiptNumber: p.receiptNumber,
    amount: Number(p.amount),
    paidAt: new Date(p.paidAt),
    status: p.status,
    plan: p.plan,
    gym: p.gym,
  }));
}

