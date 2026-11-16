import prisma from "@/db/client";
import { Prisma } from "@prisma/client";
import { SalaryOverview, SalaryRecordItem } from "@/types/salary.types";
import { monthStringSchema, salaryAmountSchema } from "@/schemas/salary.schema";

type Database = Prisma.TransactionClient;
type SalaryRow = Omit<SalaryRecordItem, "paidAt"> & { paidAt: Date | string | null };

export async function lockTrainerPayroll(db: Database, gymId: string, trainerId: string) {
  await db.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${gymId}:${trainerId}`}, 0))::text`;
}

export async function ensureSalaryRecordsForMonth(gymId: string, month: string, db?: Database): Promise<void> {
  monthStringSchema.parse(month);
  if (!db) return prisma.$transaction((tx) => ensureSalaryRecordsForMonth(gymId, month, tx), { timeout: 20000 });
  const candidates = await db.$queryRaw<Array<{ userId: string; lock: string }>>`
    SELECT eligible."userId", pg_advisory_xact_lock(hashtextextended(${gymId} || ':' || eligible."userId", 0))::text AS lock
    FROM (
      SELECT tp."userId" FROM "TrainerProfile" tp
      JOIN "User" u ON u."id" = tp."userId"
      JOIN "Gym" g ON g."id" = u."gymId"
      WHERE u."gymId" = ${gymId} AND u."role" = 'TRAINER' AND u."status" = 'ACTIVE'
        AND to_char(((tp."joinedAt" AT TIME ZONE 'UTC') AT TIME ZONE g."timezone"), 'YYYY-MM') <= ${month}
        AND NOT EXISTS (SELECT 1 FROM "SalaryRecord" sr WHERE sr."trainerId" = tp."userId" AND sr."month" = ${month})
      ORDER BY tp."userId"
    ) eligible
  `;
  if (!candidates.length) return;
  const trainers = await db.trainerProfile.findMany({
    where: {
      userId: { in: candidates.map((t) => t.userId) },
      user: { gymId, role: "TRAINER", status: "ACTIVE" },
      salaryRecords: { none: { month } },
    },
    select: { userId: true, monthlySalary: true, holidayDeductionPerDay: true },
  });
  if (!trainers.length) return;
  await db.salaryRecord.createMany({
    data: trainers.map((trainer) => ({
      gymId,
      trainerId: trainer.userId,
      month,
      baseAmount: trainer.monthlySalary,
      amount: trainer.monthlySalary,
      holidayDeductionPerDay: trainer.holidayDeductionPerDay,
      status: "PENDING" as const,
    })),
    skipDuplicates: true,
  });
}

/** Completed gym-local days only. Paid leave excuses absence; check-ins always win. */
export async function refreshPendingSalaryRecords(
  gymId: string,
  month?: string,
  trainerId?: string,
  db?: Database,
  now: Date = new Date(),
): Promise<number> {
  if (month) monthStringSchema.parse(month);
  if (!db) return prisma.$transaction((tx) => refreshPendingSalaryRecords(gymId, month, trainerId, tx, now), { timeout: 20000 });
  // Serialize recalculation with leave/rate edits and payment for each trainer.
  await db.$queryRaw`
    SELECT pg_advisory_xact_lock(hashtextextended(${gymId} || ':' || pending."trainerId", 0))::text
    FROM (SELECT DISTINCT "trainerId" FROM "SalaryRecord"
      WHERE "gymId" = ${gymId} AND "status" = 'PENDING'
        ${month ? Prisma.sql`AND "month" = ${month}` : Prisma.empty}
        ${trainerId ? Prisma.sql`AND "trainerId" = ${trainerId}` : Prisma.empty}
      ORDER BY "trainerId") pending
  `;
  return db.$executeRaw`
    WITH absences AS (
      SELECT sr."id",
        COUNT(calendar.day) FILTER (
          WHERE a."id" IS NULL AND (l."type" IS NULL OR l."type" = 'UNPAID')
        )::integer AS days
      FROM "SalaryRecord" sr
      JOIN "TrainerProfile" tp ON tp."userId" = sr."trainerId"
      JOIN "User" u ON u."id" = tp."userId" AND u."gymId" = sr."gymId" AND u."role" = 'TRAINER'
      JOIN "Gym" g ON g."id" = sr."gymId"
      LEFT JOIN LATERAL generate_series(
        GREATEST(to_date(sr."month" || '-01', 'YYYY-MM-DD'), ((tp."joinedAt" AT TIME ZONE 'UTC') AT TIME ZONE g."timezone")::date)::timestamp,
        LEAST(
          (to_date(sr."month" || '-01', 'YYYY-MM-DD') + INTERVAL '1 month - 1 day')::date,
          (${now}::timestamptz AT TIME ZONE g."timezone")::date - 1
        )::timestamp,
        INTERVAL '1 day'
      ) calendar(day) ON true
      LEFT JOIN "Attendance" a ON a."userId" = sr."trainerId" AND a."gymId" = sr."gymId"
        AND a."date" = to_char(calendar.day, 'YYYY-MM-DD')
      LEFT JOIN "TrainerLeave" l ON l."trainerId" = sr."trainerId" AND l."gymId" = sr."gymId"
        AND l."date" = to_char(calendar.day, 'YYYY-MM-DD')
      WHERE sr."gymId" = ${gymId} AND sr."status" = 'PENDING'
        ${month ? Prisma.sql`AND sr."month" = ${month}` : Prisma.empty}
        ${trainerId ? Prisma.sql`AND sr."trainerId" = ${trainerId}` : Prisma.empty}
      GROUP BY sr."id"
    ), calculated AS (
      SELECT sr."id", COALESCE(sr."baseAmount", sr."amount") AS base, absences.days,
        LEAST(COALESCE(sr."baseAmount", sr."amount"), sr."holidayDeductionPerDay" * absences.days) AS deduction
      FROM "SalaryRecord" sr JOIN absences ON absences."id" = sr."id"
    )
    UPDATE "SalaryRecord" sr
    SET "baseAmount" = calculated.base, "holidayDays" = calculated.days,
        "deductionAmount" = calculated.deduction, "amount" = calculated.base - calculated.deduction
    FROM calculated
    WHERE sr."id" = calculated."id" AND sr."gymId" = ${gymId} AND sr."status" = 'PENDING'
      AND (sr."baseAmount", sr."holidayDays", sr."deductionAmount", sr."amount")
        IS DISTINCT FROM (calculated.base, calculated.days, calculated.deduction, calculated.base - calculated.deduction)
  `;
}

async function readSalaryRows(db: Database, condition: Prisma.Sql, order: Prisma.Sql) {
  const rows = await db.$queryRaw<SalaryRow[]>`
    SELECT sr."id", sr."trainerId", u."name" AS "trainerName", u."email" AS "trainerEmail",
      u."phone" AS "trainerPhone", sr."month", sr."amount"::double precision AS "amount",
      COALESCE(sr."baseAmount", sr."amount")::double precision AS "baseAmount",
      sr."holidayDeductionPerDay"::double precision AS "holidayDeductionPerDay",
      sr."holidayDays", sr."deductionAmount"::double precision AS "deductionAmount",
      sr."status", sr."paidAt", tp."salaryDueDay"
    FROM "SalaryRecord" sr
    JOIN "TrainerProfile" tp ON tp."userId" = sr."trainerId"
    JOIN "User" u ON u."id" = tp."userId" AND u."gymId" = sr."gymId" AND u."role" = 'TRAINER'
    WHERE ${condition} ORDER BY ${order}
  `;
  return rows.map((row): SalaryRecordItem => ({ ...row, paidAt: row.paidAt ? new Date(row.paidAt) : null }));
}

function salaryOverview(month: string, records: SalaryRecordItem[]): SalaryOverview {
  const paidPaise = records.filter((r) => r.status === "PAID").reduce((sum, r) => sum + Math.round(r.amount * 100), 0);
  const pendingPaise = records.filter((r) => r.status === "PENDING").reduce((sum, r) => sum + Math.round(r.amount * 100), 0);
  return {
    month,
    records,
    totalSalaries: (paidPaise + pendingPaise) / 100,
    totalPaid: paidPaise / 100,
    totalPending: pendingPaise / 100,
    totalDeductions: records.reduce((sum, r) => sum + Math.round(r.deductionAmount * 100), 0) / 100,
  };
}

export async function listSalariesByGymAndMonth(gymId: string, month: string, db?: Database) {
  await refreshPendingSalaryRecords(gymId, month, undefined, db);
  return salaryOverview(month, await readSalaryRows(db ?? prisma, Prisma.sql`sr."gymId" = ${gymId} AND sr."month" = ${month}`, Prisma.sql`u."name" ASC`));
}

export async function getSalariesOverviewOptimized(gymId: string, month: string, db?: Database) {
  // Include newly activated trainers even when other trainers already have records.
  await ensureSalaryRecordsForMonth(gymId, month, db);
  return listSalariesByGymAndMonth(gymId, month, db);
}

export async function setTrainerHolidayDeduction(
  gymId: string, trainerId: string, holidayDeductionPerDay: number, db?: Database,
) {
  salaryAmountSchema.parse(holidayDeductionPerDay);
  const save = async (tx: Database) => {
    await lockTrainerPayroll(tx, gymId, trainerId);
    const trainer = await tx.trainerProfile.findFirst({ where: { userId: trainerId, user: { gymId, role: "TRAINER" } } });
    if (!trainer) throw new Error("Trainer not found in this gym.");
    const rate = new Prisma.Decimal(holidayDeductionPerDay);
    await tx.trainerProfile.update({ where: { userId: trainerId }, data: { holidayDeductionPerDay: rate } });
    await tx.salaryRecord.updateMany({ where: { gymId, trainerId, status: "PENDING" }, data: { holidayDeductionPerDay: rate } });
    await refreshPendingSalaryRecords(gymId, undefined, trainerId, tx);
    return { trainerId, holidayDeductionPerDay };
  };
  return db ? save(db) : prisma.$transaction(save, { timeout: 20000 });
}

export async function markSalaryPaid(salaryRecordId: string, gymId: string, expectedAmount: number, db?: Database) {
  salaryAmountSchema.parse(expectedAmount);
  const pay = async (tx: Database) => {
    const initial = await tx.salaryRecord.findFirst({ where: { id: salaryRecordId, gymId, trainer: { user: { gymId, role: "TRAINER" } } } });
    if (!initial) throw new Error("Salary record not found in this gym.");
    await lockTrainerPayroll(tx, gymId, initial.trainerId);
    await tx.$queryRaw`SELECT "id" FROM "SalaryRecord" WHERE "id" = ${salaryRecordId} AND "gymId" = ${gymId} FOR UPDATE`;
    await refreshPendingSalaryRecords(gymId, initial.month, initial.trainerId, tx);
    const record = await tx.salaryRecord.findUniqueOrThrow({ where: { id: salaryRecordId, gymId } });
    if (record.status === "PAID") throw new Error("This salary is already marked paid. Refresh to see the recorded payout.");
    if (!record.amount.equals(expectedAmount)) throw new Error("The salary calculation changed. Refresh and review the payable amount before marking it paid.");
    return tx.salaryRecord.update({ where: { id: salaryRecordId, gymId, status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
  };
  return db ? pay(db) : prisma.$transaction(pay, { timeout: 20000 });
}

export async function listTrainerSalaryHistory(trainerId: string, db?: Database): Promise<SalaryRecordItem[]> {
  const trainer = await (db ?? prisma).user.findFirst({ where: { id: trainerId, role: "TRAINER" }, select: { gymId: true } });
  if (!trainer?.gymId) return [];
  await refreshPendingSalaryRecords(trainer.gymId, undefined, trainerId, db);
  return readSalaryRows(db ?? prisma, Prisma.sql`sr."trainerId" = ${trainerId} AND sr."gymId" = ${trainer.gymId}`, Prisma.sql`sr."month" DESC`);
}
