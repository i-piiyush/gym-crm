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
 */
export async function getCustomerPortalData(userId: string) {
  const [profile, rawAttendances] = await Promise.all([
    prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            gym: true,
          },
        },
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        plan: true,
      },
    }),
    prisma.attendance.findMany({
      where: { userId },
      orderBy: { checkInAt: "desc" },
      take: 60,
    }),
  ]);

  if (!profile) return null;

  const attendances = rawAttendances.map((a) => ({
    ...a,
    latitude: Number(a.latitude),
    longitude: Number(a.longitude),
    accuracyMeters: Number(a.accuracyMeters),
    distanceMeters: Number(a.distanceMeters),
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

    let checkDate = uniqueDates[0] === todayStr ? now : yesterday;
    let checkDateStr = uniqueDates[0] === todayStr ? todayStr : yesterdayStr;

    if (uniqueDates.includes(checkDateStr)) {
      for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(checkDate.getTime() - i * 86400000);
        const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;
        if (uniqueDates.includes(expectedStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  const serializedProfile = {
    ...profile,
    plan: profile.plan
      ? {
          ...profile.plan,
          price: Number(profile.plan.price),
        }
      : null,
    user: {
      ...profile.user,
      gym: profile.user.gym
        ? {
            ...profile.user.gym,
            latitude: Number(profile.user.gym.latitude),
            longitude: Number(profile.user.gym.longitude),
          }
        : null,
    },
  };

  return {
    profile: serializedProfile,
    attendances,
    thisMonthCount: thisMonthAttendances.length,
    streak,
  };
}

/**
 * Fetches all completed payments for a specific customer.
 */
export async function getCustomerPayments(customerId: string) {
  const payments = await prisma.payment.findMany({
    where: { customerId },
    include: {
      plan: true,
      gym: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  return payments.map((p) => ({
    ...p,
    amount: Number(p.amount),
    plan: p.plan
      ? {
          ...p.plan,
          price: Number(p.plan.price),
        }
      : null,
  }));
}

