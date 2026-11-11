import prisma from "@/db/client";
import { SalaryRecordItem, SalaryOverview } from "@/types/salary.types";
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
        include: {
          user: true,
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
 */
export async function listTrainerSalaryHistory(
  trainerId: string
): Promise<SalaryRecordItem[]> {
  const records = await prisma.salaryRecord.findMany({
    where: { trainerId },
    include: {
      trainer: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { month: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    trainerId: r.trainerId,
    trainerName: r.trainer.user.name,
    trainerEmail: r.trainer.user.email,
    trainerPhone: r.trainer.user.phone,
    month: r.month,
    amount: Number(r.amount),
    status: r.status,
    paidAt: r.paidAt,
    salaryDueDay: r.trainer.salaryDueDay,
  }));
}

