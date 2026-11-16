import prisma from "@/db/client";
import { TrainerListItem, TrainerOption } from "@/types/person.types";
import { Prisma } from "@prisma/client";
import { ensureSalaryRecordsForMonth, refreshPendingSalaryRecords } from "./salary.repo";

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
    holidayDeductionPerDay: Number(u.trainerProfile?.holidayDeductionPerDay ?? 0),
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
 * Optimized 1-roundtrip query for fetching assigned customers for a trainer.
 * Uses a single fast SQL join with subquery for today's check-in timestamp.
 */
export async function getTrainerAssignedCustomers(
  trainerId: string,
  todayDateStr: string
) {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      status: any;
      planName: string;
      membershipStart: string | Date | null;
      membershipEnd: string | Date | null;
      trialEndsAt: string | Date | null;
      checkInTime: string | Date | null;
      checkedInToday: boolean;
    }>
  >`
    SELECT 
      u."id",
      u."name",
      u."email",
      u."phone",
      cp."status",
      COALESCE(mp."name", CASE WHEN cp."status" = 'TRIAL' THEN 'Free Trial' ELSE 'Custom' END) AS "planName",
      cp."membershipStart",
      cp."membershipEnd",
      cp."trialEndsAt",
      att."checkInAt" AS "checkInTime",
      (att."checkInAt" IS NOT NULL) AS "checkedInToday"
    FROM "CustomerProfile" cp
    JOIN "User" u ON u."id" = cp."userId"
    LEFT JOIN "MembershipPlan" mp ON mp."id" = cp."planId"
    LEFT JOIN "Attendance" att ON att."userId" = u."id" AND att."date" = ${todayDateStr}
    WHERE cp."trainerId" = ${trainerId}
    ORDER BY u."name" ASC;
  `;

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    planName: c.planName,
    membershipStart: c.membershipStart ? new Date(c.membershipStart) : null,
    membershipEnd: c.membershipEnd ? new Date(c.membershipEnd) : null,
    trialEndsAt: c.trialEndsAt ? new Date(c.trialEndsAt) : null,
    checkedInToday: Boolean(c.checkedInToday),
    checkInTime: c.checkInTime ? new Date(c.checkInTime) : null,
  }));
}

/**
 * Consolidated 1-roundtrip query for Trainer Portal Overview.
 * Gathers profile, client totals, today's attendance check, shift history, and salary in 1 single roundtrip.
 */
export async function getTrainerPortalOverview(
  trainerId: string,
  gymId: string,
  todayDateStr: string,
  currentMonthStr: string
) {
  await ensureSalaryRecordsForMonth(gymId, currentMonthStr);
  await refreshPendingSalaryRecords(gymId, undefined, trainerId);
  const rows = await prisma.$queryRaw<
    Array<{
      trainerProfile: {
        userId: string;
        monthlySalary: number;
        salaryDueDay: number;
        joinedAt: string | Date;
        user: {
          name: string;
          email: string;
        };
      } | null;
      totalAssignedClients: number;
      clientsCheckedInToday: number;
      recentAttendances: Array<{
        id: string;
        date: string;
        checkInAt: string | Date;
        distanceMeters: number;
      }>;
      currentSalary: {
        amount: number;
        deductionAmount: number;
        holidayDays: number;
        status: string;
        paidAt: string | Date | null;
      } | null;
      checkedInToday: boolean;
    }>
  >`
    SELECT
      (
        SELECT row_to_json(tp_row)
        FROM (
          SELECT 
            tp."userId",
            tp."monthlySalary"::double precision AS "monthlySalary",
            tp."salaryDueDay",
            tp."joinedAt",
            json_build_object('name', u."name", 'email', u."email") AS "user"
          FROM "TrainerProfile" tp
          JOIN "User" u ON u."id" = tp."userId"
          WHERE tp."userId" = ${trainerId}
        ) tp_row
      ) AS "trainerProfile",
      (
        SELECT COUNT(*)::int
        FROM "CustomerProfile"
        WHERE "trainerId" = ${trainerId}
      ) AS "totalAssignedClients",
      (
        SELECT COUNT(DISTINCT cp."userId")::int
        FROM "CustomerProfile" cp
        JOIN "Attendance" a ON a."userId" = cp."userId" AND a."date" = ${todayDateStr}
        WHERE cp."trainerId" = ${trainerId}
      ) AS "clientsCheckedInToday",
      (
        SELECT COALESCE(json_agg(att_row), '[]'::json)
        FROM (
          SELECT 
            "id",
            "date",
            "checkInAt",
            "distanceMeters"::double precision AS "distanceMeters"
          FROM "Attendance"
          WHERE "userId" = ${trainerId}
          ORDER BY "checkInAt" DESC
          LIMIT 5
        ) att_row
      ) AS "recentAttendances",
      (
        SELECT row_to_json(sr_row)
        FROM (
          SELECT 
            "amount"::double precision AS "amount",
            "deductionAmount"::double precision AS "deductionAmount",
            "holidayDays",
            "status",
            "paidAt"
          FROM "SalaryRecord"
          WHERE "trainerId" = ${trainerId} AND "gymId" = ${gymId} AND "month" = ${currentMonthStr}
        ) sr_row
      ) AS "currentSalary",
      EXISTS(
        SELECT 1 FROM "Attendance"
        WHERE "userId" = ${trainerId} AND "date" = ${todayDateStr}
      ) AS "checkedInToday";
  `;

  const data = rows[0];
  if (!data?.trainerProfile) {
    return {
      trainerProfile: null,
      totalAssignedClients: 0,
      clientsCheckedInToday: 0,
      checkedInToday: false,
      recentAttendances: [],
      currentSalary: null,
    };
  }

  return {
    trainerProfile: {
      ...data.trainerProfile,
      monthlySalary: Number(data.trainerProfile.monthlySalary),
      joinedAt: new Date(data.trainerProfile.joinedAt),
    },
    totalAssignedClients: Number(data.totalAssignedClients || 0),
    clientsCheckedInToday: Number(data.clientsCheckedInToday || 0),
    checkedInToday: Boolean(data.checkedInToday),
    recentAttendances: (data.recentAttendances || []).map((a) => ({
      ...a,
      checkInAt: new Date(a.checkInAt),
      distanceMeters: Number(a.distanceMeters),
    })),
    currentSalary: data.currentSalary
      ? {
          amount: Number(data.currentSalary.amount),
          deductionAmount: Number(data.currentSalary.deductionAmount),
          holidayDays: data.currentSalary.holidayDays,
          status: data.currentSalary.status,
          paidAt: data.currentSalary.paidAt ? new Date(data.currentSalary.paidAt) : null,
        }
      : null,
  };
}
