import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import prisma from "../src/db/client";
import { ensureSalaryRecordsForMonth, refreshPendingSalaryRecords, setTrainerHolidayDeduction, markSalaryPaid, listSalariesByGymAndMonth, listTrainerSalaryHistory } from "../src/db/repositories/salary.repo";
import { markTrainerLeave, removeTrainerLeave, listTrainerLeaves } from "../src/db/repositories/trainer-leave.repo";

// All fixtures and mutations are rolled back, including the simulated paid record.
const rollback = new Error("ROLLBACK_PAYROLL_FIXTURES");
const fixtureId = `payroll-check-${randomUUID()}`;

async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({ data: { id: fixtureId, name: "Payroll verification", address: "Test", latitude: 0, longitude: 0, timezone: "Asia/Kolkata" } });
      const otherGym = await tx.gym.create({ data: { name: "Other verification gym", address: "Test", latitude: 0, longitude: 0, timezone: "America/Los_Angeles" } });
      const admin = await tx.user.create({ data: { clerkId: randomUUID(), email: `${randomUUID()}@example.test`, name: "Test admin", role: "ADMIN", status: "ACTIVE", gymId: gym.id } });
      const makeTrainer = async (gymId: string, joinedAt: string, rate = 10) => tx.user.create({ data: {
        clerkId: randomUUID(), email: `${randomUUID()}@example.test`, name: "Test trainer", role: "TRAINER", status: "ACTIVE", gymId,
        trainerProfile: { create: { monthlySalary: 1000.25, holidayDeductionPerDay: rate, joinedAt: new Date(joinedAt) } },
      }, include: { trainerProfile: true } });
      const trainer = await makeTrainer(gym.id, "2024-02-09T20:00:00.000Z"); // Feb 10 in Kolkata
      assert.equal(Number(trainer.trainerProfile!.holidayDeductionPerDay), 10);
      await ensureSalaryRecordsForMonth(gym.id, "2024-02", tx);
      await ensureSalaryRecordsForMonth(gym.id, "2024-01", tx);
      assert.equal(await tx.salaryRecord.count({ where: { gymId: gym.id, month: "2024-01" } }), 0);
      const laterTrainer = await makeTrainer(gym.id, "2024-02-14T20:00:00.000Z"); // Feb 15
      await ensureSalaryRecordsForMonth(gym.id, "2024-02", tx);
      await ensureSalaryRecordsForMonth(gym.id, "2024-02", tx);
      assert.equal(await tx.salaryRecord.count({ where: { gymId: gym.id, month: "2024-02" } }), 2);
      const salary = () => tx.salaryRecord.findUniqueOrThrow({ where: { trainerId_month: { trainerId: trainer.id, month: "2024-02" } } });
      const now = new Date("2024-02-14T20:00:00.000Z"); // Feb 15 in Kolkata
      await refreshPendingSalaryRecords(gym.id, "2024-02", undefined, tx, now);
      assert.equal((await salary()).holidayDays, 5);
      assert.equal(Number((await salary()).amount), 950.25);
      assert.equal((await tx.salaryRecord.findUniqueOrThrow({ where: { trainerId_month: { trainerId: laterTrainer.id, month: "2024-02" } } })).holidayDays, 0);
      const mark = (startDate: string, endDate: string, type: "PAID" | "UNPAID") => markTrainerLeave(gym.id, admin.id, { trainerId: trainer.id, startDate, endDate, type, reason: "Verification" }, tx);
      await mark("2024-02-11", "2024-02-11", "PAID");
      await mark("2024-02-12", "2024-02-12", "UNPAID");
      await mark("2024-02-16", "2024-02-16", "PAID");
      await tx.attendance.createMany({ data: ["2024-02-10", "2024-02-12"].map((date) => ({ gymId: gym.id, userId: trainer.id, date, latitude: 0, longitude: 0, accuracyMeters: 0, distanceMeters: 0 })) });
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx, now);
      assert.equal((await salary()).holidayDays, 2); // Paid leave and both check-ins win; future leave excluded
      assert.equal(Number((await salary()).amount), 980.25);
      await mark("2024-02-11", "2024-02-11", "UNPAID"); // Overlap replaces, without duplicate
      assert.equal(await tx.trainerLeave.count({ where: { gymId: gym.id, trainerId: trainer.id } }), 3);
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx, now);
      assert.equal((await salary()).holidayDays, 3);
      await mark("2024-02-11", "2024-02-11", "PAID");
      const paidLeave = (await listTrainerLeaves(gym.id, trainer.id, "2024-02", tx)).records.find((l) => l.date === "2024-02-11")!;
      await removeTrainerLeave(gym.id, paidLeave.id, tx);
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx, now);
      assert.equal((await salary()).holidayDays, 3);
      await mark("2024-02-11", "2024-02-11", "PAID");
      await mark("2024-02-12", "2024-02-12", "PAID"); // Checked-in paid leave also does not double-count
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx, now);
      assert.equal((await salary()).holidayDays, 2);
      await assert.rejects(() => mark("2024-02-09", "2024-02-10", "PAID"), /joining date/);
      await assert.rejects(() => setTrainerHolidayDeduction(otherGym.id, trainer.id, 99, tx), /not found/);
      await assert.rejects(() => markTrainerLeave(otherGym.id, admin.id, { trainerId: trainer.id, startDate: "2024-02-11", endDate: "2024-02-11", type: "PAID" }, tx), /not found/);
      await assert.rejects(() => listTrainerLeaves(otherGym.id, trainer.id, "2024-02", tx), /not found/);
      const leave = (await listTrainerLeaves(gym.id, trainer.id, "2024-02", tx)).records[0]!;
      await assert.rejects(() => removeTrainerLeave(otherGym.id, leave.id, tx), /not found/);
      await setTrainerHolidayDeduction(gym.id, trainer.id, 0, tx);
      assert.equal(Number((await salary()).amount), 1000.25);
      await setTrainerHolidayDeduction(gym.id, trainer.id, 1000, tx);
      assert.equal(Number((await salary()).amount), 0);
      assert.equal(Number((await salary()).deductionAmount), 1000.25);
      await setTrainerHolidayDeduction(gym.id, trainer.id, 0.1, tx);
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx, now);
      assert.equal(Number((await salary()).amount), 1000.05);
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx, new Date("2024-03-01T00:00:00Z"));
      assert.equal((await salary()).holidayDays, 16); // Feb10–29: 20 days minus 2 check-ins and 2 paid leaves
      const pending = await salary();
      await assert.rejects(() => markSalaryPaid(pending.id, otherGym.id, Number(pending.amount), tx), /not found/);
      await assert.rejects(() => markSalaryPaid(pending.id, gym.id, Number(pending.amount) + 1, tx), /calculation changed/);
      const paid = await markSalaryPaid(pending.id, gym.id, Number(pending.amount), tx);
      const signature = JSON.stringify(paid);
      await assert.rejects(() => markSalaryPaid(pending.id, gym.id, Number(paid.amount), tx), /already marked paid/);
      await setTrainerHolidayDeduction(gym.id, trainer.id, 20, tx);
      await refreshPendingSalaryRecords(gym.id, "2024-02", trainer.id, tx);
      assert.equal(JSON.stringify(await salary()), signature);
      await assert.rejects(() => mark("2024-02-28", "2024-03-02", "UNPAID"), /locked/);
      await assert.rejects(() => removeTrainerLeave(gym.id, leave.id, tx), /locked/);
      assert.equal((await listTrainerLeaves(gym.id, trainer.id, "2024-02", tx)).records.every((l) => l.locked), true);
      const overview = await listSalariesByGymAndMonth(gym.id, "2024-02", tx);
      assert.equal(overview.totalPaid, Number(paid.amount));
      assert.equal(overview.totalDeductions, overview.records.reduce((sum, r) => sum + r.deductionAmount, 0));
      assert.equal((await listTrainerSalaryHistory(trainer.id, tx))[0]!.amount, Number(paid.amount));
      const west = await makeTrainer(otherGym.id, "2024-03-01T07:30:00Z"); // Feb29 in Los Angeles
      await ensureSalaryRecordsForMonth(otherGym.id, "2024-02", tx);
      await ensureSalaryRecordsForMonth(otherGym.id, "2024-03", tx);
      await refreshPendingSalaryRecords(otherGym.id, undefined, west.id, tx, new Date("2024-03-01T07:59:00Z"));
      assert.equal((await tx.salaryRecord.findUniqueOrThrow({ where: { trainerId_month: { trainerId: west.id, month: "2024-02" } } })).holidayDays, 0);
      await refreshPendingSalaryRecords(otherGym.id, undefined, west.id, tx, new Date("2024-03-01T08:01:00Z"));
      assert.equal((await tx.salaryRecord.findUniqueOrThrow({ where: { trainerId_month: { trainerId: west.id, month: "2024-02" } } })).holidayDays, 1);
      assert.equal((await tx.salaryRecord.findUniqueOrThrow({ where: { trainerId_month: { trainerId: west.id, month: "2024-03" } } })).holidayDays, 0);
      throw rollback;
    }, { maxWait: 10000, timeout: 180000 });
  } catch (error) { if (error !== rollback) throw error; }
  assert.equal(await prisma.gym.count({ where: { id: fixtureId } }), 0);
  console.log("Database payroll and leave checks passed; all test data and simulated payments rolled back.");
}
main().catch((error) => { console.error(error instanceof assert.AssertionError ? error.message : `Payroll database verification failed: ${error instanceof Error ? error.name : "unknown error"}`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
