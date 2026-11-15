import prisma from "@/db/client";
import {
  SalaryRecordItem,
  SalaryOverview,
  SalaryStatusType,
} from "@/types/salary.types";
import { Prisma } from "@prisma/client";

/**
 * Ensures salary records exist for all active trainers in the gym for the given month (YYYY-MM).
 * Idempotent: uses createMany with skipDuplicates against the @@unique([trainerId, month]) constraint.
 * Snapshots trainerProfile.monthlySalary at creation time.
 */
export async function ensureSalaryRecordsForMonth(
  gymId: string,
  month: string
): Promise<void> {
  // 1. Fetch all active trainers with a profile in this gym
  const trainers = await prisma.trainerProfile.findMany({
    where: {
      user: {
        gymId,
        role: "TRAINER",
        status: "ACTIVE",
      },
    },
    select: {
      userId: true,
      monthlySalary: true,
    },
  });

  if (trainers.length === 0) return;

  // 2. Prepare records
  const records = trainers.map((t) => ({
    gymId,
    trainerId: t.userId,
    month,
    amount: t.monthlySalary,
    status: "PENDING" as const,
  }));

  // 3. Batch insert with skipDuplicates
  await prisma.salaryRecord.createMany({
    data: records,
    skipDuplicates: true,
  });
}

/**
 * Lists salary records for a gym for a specific month (YYYY-MM).
 */
export async function listSalariesByGymAndMonth(
  gymId: string,
  month: string
): Promise<SalaryOverview> {
  const records = await prisma.salaryRecord.findMany({
    where: {
      gymId,
      month,
    },
    include: {
      trainer: {
        select: {
          monthlySalary: true,
          salaryDueDay: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      trainer: {
        user: {
          name: "asc",
        },
      },
    },
  });

  let totalPending = 0;
  let totalPaid = 0;

  const items: SalaryRecordItem[] = records.map((r) => {
    const amountNum = Number(r.amount);
    if (r.status === "PAID") {
      totalPaid += amountNum;
    } else {
      totalPending += amountNum;
    }

    return {
      id: r.id,
      trainerId: r.trainerId,
      trainerName: r.trainer.user.name,
      trainerEmail: r.trainer.user.email,
      trainerPhone: r.trainer.user.phone,
      month: r.month,
      amount: amountNum,
      status: r.status,
      paidAt: r.paidAt,
      salaryDueDay: r.trainer.salaryDueDay,
    };
  });

  return {
    month,
    totalSalaries: totalPending + totalPaid,
    totalPending,
    totalPaid,
    records: items,
  };
}

/**
 * Consolidated 1-roundtrip query for trainer salaries.
 * Reads existing monthly records in ~500ms using a pure indexed join.
 * Only if no records exist yet for this month does it lazily snapshot and initialize them.
 */
export async function getSalariesOverviewOptimized(
  gymId: string,
  month: string
): Promise<SalaryOverview> {
  let records = await prisma.$queryRaw<
    Array<{
      id: string;
      trainerId: string;
      trainerName: string;
      trainerEmail: string;
      trainerPhone: string | null;
      month: string;
      amount: number;
      status: "PENDING" | "PAID";
      paidAt: string | Date | null;
      salaryDueDay: number;
    }>
  >`
    SELECT 
      sr."id",
      sr."trainerId",
      u."name" AS "trainerName",
      u."email" AS "trainerEmail",
      u."phone" AS "trainerPhone",
      sr."month",
      sr."amount"::double precision AS "amount",
      sr."status",
      sr."paidAt",
      tp."salaryDueDay"
    FROM "SalaryRecord" sr
    JOIN "TrainerProfile" tp ON tp."userId" = sr."trainerId"
    JOIN "User" u ON u."id" = tp."userId"
    WHERE sr."gymId" = ${gymId} AND sr."month" = ${month}
    ORDER BY u."name" ASC;
  `;

  // If no records exist yet for the month, ensure them and re-query
  if (records.length === 0) {
    await ensureSalaryRecordsForMonth(gymId, month);
    records = await prisma.$queryRaw<
      Array<{
        id: string;
        trainerId: string;
        trainerName: string;
        trainerEmail: string;
        trainerPhone: string | null;
        month: string;
        amount: number;
        status: "PENDING" | "PAID";
        paidAt: string | Date | null;
        salaryDueDay: number;
      }>
    >`
      SELECT 
        sr."id",
        sr."trainerId",
        u."name" AS "trainerName",
        u."email" AS "trainerEmail",
        u."phone" AS "trainerPhone",
        sr."month",
        sr."amount"::double precision AS "amount",
        sr."status",
        sr."paidAt",
        tp."salaryDueDay"
      FROM "SalaryRecord" sr
      JOIN "TrainerProfile" tp ON tp."userId" = sr."trainerId"
      JOIN "User" u ON u."id" = tp."userId"
      WHERE sr."gymId" = ${gymId} AND sr."month" = ${month}
      ORDER BY u."name" ASC;
    `;
  }

  let totalPending = 0;
  let totalPaid = 0;

  const items: SalaryRecordItem[] = records.map((r) => {
    const amountNum = Number(r.amount);
    if (r.status === "PAID") {
      totalPaid += amountNum;
    } else {
      totalPending += amountNum;
    }

    return {
      id: r.id,
      trainerId: r.trainerId,
      trainerName: r.trainerName,
      trainerEmail: r.trainerEmail,
      trainerPhone: r.trainerPhone,
      month: r.month,
      amount: amountNum,
      status: r.status as SalaryStatusType,
      paidAt: r.paidAt ? new Date(r.paidAt) : null,
      salaryDueDay: r.salaryDueDay,
    };
  });

  return {
    month,
    totalSalaries: totalPending + totalPaid,
    totalPending,
    totalPaid,
    records: items,
  };
}

/**
 * Marks a specific salary record as PAID.
 * Strictly verifies gymId boundary.
 */
export async function markSalaryPaid(salaryRecordId: string, gymId: string) {
  return prisma.salaryRecord.update({
    where: {
      id: salaryRecordId,
      gymId,
    },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });
}

/**
 * Lists salary records for an individual trainer (used in trainer portal).
 * Optimized with a single SQL query joining TrainerProfile and User once.
 */
export async function listTrainerSalaryHistory(
  trainerId: string
): Promise<SalaryRecordItem[]> {
  const records = await prisma.$queryRaw<
    Array<{
      id: string;
      trainerId: string;
      trainerName: string;
      trainerEmail: string;
      trainerPhone: string | null;
      month: string;
      amount: number;
      status: "PENDING" | "PAID";
      paidAt: string | Date | null;
      salaryDueDay: number;
    }>
  >`
    SELECT 
      sr."id",
      sr."trainerId",
      u."name" AS "trainerName",
      u."email" AS "trainerEmail",
      u."phone" AS "trainerPhone",
      sr."month",
      sr."amount"::double precision AS "amount",
      sr."status",
      sr."paidAt",
      tp."salaryDueDay"
    FROM "SalaryRecord" sr
    JOIN "TrainerProfile" tp ON tp."userId" = sr."trainerId"
    JOIN "User" u ON u."id" = tp."userId"
    WHERE sr."trainerId" = ${trainerId}
    ORDER BY sr."month" DESC;
  `;

  return records.map((r) => ({
    id: r.id,
    trainerId: r.trainerId,
    trainerName: r.trainerName,
    trainerEmail: r.trainerEmail,
    trainerPhone: r.trainerPhone,
    month: r.month,
    amount: Number(r.amount),
    status: r.status,
    paidAt: r.paidAt ? new Date(r.paidAt) : null,
    salaryDueDay: Number(r.salaryDueDay),
  }));
}

