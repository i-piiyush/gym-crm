import prisma from "@/db/client";
import { Prisma } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { getLeaveDates } from "@/lib/trainer-leave";
import { markTrainerLeaveSchema, MarkTrainerLeaveInput } from "@/schemas/trainer-leave.schema";
import { monthStringSchema } from "@/schemas/salary.schema";
import { TrainerLeavesOverview } from "@/types/trainer-leave.types";
import { lockTrainerPayroll, refreshPendingSalaryRecords } from "./salary.repo";

type Database = Prisma.TransactionClient;

async function getTrainer(db: Database, gymId: string, trainerId: string) {
  const trainer = await db.trainerProfile.findFirst({
    where: { userId: trainerId, user: { gymId, role: "TRAINER" } },
    include: { user: { select: { gym: { select: { timezone: true } } } } },
  });
  if (!trainer?.user.gym) throw new Error("Trainer not found in this gym.");
  return { joinedAt: trainer.joinedAt, timezone: trainer.user.gym.timezone };
}

async function assertUnpaidMonths(db: Database, gymId: string, trainerId: string, dates: string[]) {
  const months = [...new Set(dates.map((date) => date.slice(0, 7)))];
  const paid = await db.salaryRecord.findFirst({ where: { gymId, trainerId, month: { in: months }, status: "PAID" } });
  if (paid) throw new Error(`Leave for ${paid.month} is locked because its salary has already been paid.`);
}

export async function listTrainerLeaves(gymId: string, trainerId: string, month?: string, db: Database = prisma): Promise<TrainerLeavesOverview> {
  const trainer = await getTrainer(db, gymId, trainerId);
  const today = formatInTimeZone(new Date(), trainer.timezone, "yyyy-MM-dd");
  const targetMonth = monthStringSchema.parse(month ?? today.slice(0, 7));
  const [records, paid] = await Promise.all([
    db.trainerLeave.findMany({ where: { gymId, trainerId, date: { startsWith: `${targetMonth}-` } }, orderBy: { date: "asc" } }),
    db.salaryRecord.findFirst({ where: { gymId, trainerId, month: targetMonth, status: "PAID" }, select: { id: true } }),
  ]);
  return {
    month: targetMonth, today, joinedDate: formatInTimeZone(trainer.joinedAt, trainer.timezone, "yyyy-MM-dd"),
    records: records.map(({ id, date, type, reason }) => ({ id, date, type, reason, locked: !!paid })),
  };
}

export async function markTrainerLeave(gymId: string, markedById: string, input: MarkTrainerLeaveInput, db?: Database) {
  const data = markTrainerLeaveSchema.parse(input);
  const dates = getLeaveDates(data.startDate, data.endDate);
  const save = async (tx: Database) => {
    await lockTrainerPayroll(tx, gymId, data.trainerId);
    const trainer = await getTrainer(tx, gymId, data.trainerId);
    const admin = await tx.user.findFirst({ where: { id: markedById, gymId, role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
    if (!admin) throw new Error("Only this gym's admin can mark trainer leave.");
    if (data.startDate < formatInTimeZone(trainer.joinedAt, trainer.timezone, "yyyy-MM-dd")) {
      throw new Error("Leave cannot start before the trainer's joining date.");
    }
    await assertUnpaidMonths(tx, gymId, data.trainerId, dates);
    const details = { type: data.type, reason: data.reason || null, markedById };
    await tx.trainerLeave.createMany({
      data: dates.map((date) => ({ gymId, trainerId: data.trainerId, date, ...details })), skipDuplicates: true,
    });
    await tx.trainerLeave.updateMany({ where: { gymId, trainerId: data.trainerId, date: { in: dates } }, data: details });
    await refreshPendingSalaryRecords(gymId, undefined, data.trainerId, tx);
    return { trainerId: data.trainerId, days: dates.length };
  };
  return db ? save(db) : prisma.$transaction(save, { timeout: 20000 });
}

export async function removeTrainerLeave(gymId: string, leaveId: string, db?: Database) {
  const remove = async (tx: Database) => {
    const leave = await tx.trainerLeave.findFirst({ where: { id: leaveId, gymId } });
    if (!leave) throw new Error("Leave not found in this gym.");
    await lockTrainerPayroll(tx, gymId, leave.trainerId);
    await getTrainer(tx, gymId, leave.trainerId);
    await assertUnpaidMonths(tx, gymId, leave.trainerId, [leave.date]);
    const deleted = await tx.trainerLeave.deleteMany({ where: { id: leaveId, gymId, trainerId: leave.trainerId } });
    if (!deleted.count) throw new Error("This leave was already removed. Refresh the list.");
    await refreshPendingSalaryRecords(gymId, undefined, leave.trainerId, tx);
    return { id: leaveId, trainerId: leave.trainerId };
  };
  return db ? remove(db) : prisma.$transaction(remove, { timeout: 20000 });
}
