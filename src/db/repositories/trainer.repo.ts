import prisma from "@/db/client";
import { TrainerListItem, TrainerOption } from "@/types/person.types";
import { Prisma } from "@prisma/client";

export async function listTrainers(gymId: string): Promise<TrainerListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      gymId,
      role: "TRAINER",
    },
    include: {
      trainerProfile: true,
      _count: {
        select: {
          assignedCustomers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    status: u.status,
    monthlySalary: u.trainerProfile ? Number(u.trainerProfile.monthlySalary) : 0,
    salaryDueDay: u.trainerProfile?.salaryDueDay ?? 1,
    joinedAt: u.trainerProfile?.joinedAt ?? u.createdAt,
    assignedCustomersCount: u._count.assignedCustomers,
  }));
}

export async function getTrainerOptions(gymId: string): Promise<TrainerOption[]> {
  const trainers = await prisma.user.findMany({
    where: {
      gymId,
      role: "TRAINER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return trainers;
}

export async function getTrainerWithAssignedCustomersCount(trainerId: string) {
  return prisma.customerProfile.count({
    where: { trainerId },
  });
}

export async function updateTrainerProfile(
  trainerId: string,
  data: { monthlySalary: number; salaryDueDay: number }
) {
  return prisma.trainerProfile.update({
    where: { userId: trainerId },
    data: {
      monthlySalary: new Prisma.Decimal(data.monthlySalary),
      salaryDueDay: data.salaryDueDay,
    },
  });
}

export async function deleteTrainer(trainerId: string) {
  return prisma.user.delete({
    where: { id: trainerId },
  });
}

/**
 * Fetches assigned customers for a trainer with their check-in status for today.
 */
export async function getTrainerAssignedCustomers(
  trainerId: string,
  todayDateStr: string
) {
  const customers = await prisma.customerProfile.findMany({
    where: { trainerId },
    include: {
      user: {
        include: {
          attendances: {
            where: { date: todayDateStr },
            take: 1,
          },
        },
      },
      plan: true,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return customers.map((c) => ({
    id: c.userId,
    name: c.user.name,
    email: c.user.email,
    phone: c.user.phone,
    status: c.status,
    planName: c.plan?.name || (c.status === "TRIAL" ? "Free Trial" : "Custom"),
    membershipStart: c.membershipStart,
    membershipEnd: c.membershipEnd,
    trialEndsAt: c.trialEndsAt,
    checkedInToday: c.user.attendances.length > 0,
    checkInTime: c.user.attendances[0]?.checkInAt || null,
  }));
}

/**
 * Fetches dashboard overview statistics for a trainer.
 */
export async function getTrainerPortalOverview(
  trainerId: string,
  gymId: string,
  todayDateStr: string,
  currentMonthStr: string
) {
  const [trainerProfile, customers, personalAttendances, currentSalary] =
    await Promise.all([
      prisma.trainerProfile.findUnique({
        where: { userId: trainerId },
        include: { user: true },
      }),
      prisma.customerProfile.findMany({
        where: { trainerId },
        include: {
          user: {
            include: {
              attendances: {
                where: { date: todayDateStr },
              },
            },
          },
        },
      }),
      prisma.attendance.findMany({
        where: { userId: trainerId },
        orderBy: { checkInAt: "desc" },
        take: 30,
      }),
      prisma.salaryRecord.findUnique({
        where: {
          trainerId_month: {
            trainerId,
            month: currentMonthStr,
          },
        },
      }),
    ]);

  const clientsCheckedInToday = customers.filter(
    (c) => c.user.attendances.length > 0
  ).length;

  const checkedInToday = personalAttendances.some((a) => a.date === todayDateStr);

  const serializedProfile = trainerProfile
    ? {
        ...trainerProfile,
        monthlySalary: Number(trainerProfile.monthlySalary),
      }
    : null;

  const serializedAttendances = personalAttendances.map((a) => ({
    ...a,
    latitude: Number(a.latitude),
    longitude: Number(a.longitude),
    accuracyMeters: Number(a.accuracyMeters),
    distanceMeters: Number(a.distanceMeters),
  }));

  return {
    trainerProfile: serializedProfile,
    totalAssignedClients: customers.length,
    clientsCheckedInToday,
    checkedInToday,
    recentAttendances: serializedAttendances.slice(0, 5),
    currentSalary: currentSalary
      ? {
          amount: Number(currentSalary.amount),
          status: currentSalary.status,
          paidAt: currentSalary.paidAt,
        }
      : null,
  };
}

