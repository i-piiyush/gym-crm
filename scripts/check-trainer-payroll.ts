import assert from "node:assert/strict";
import { calculateHolidaySalary, getDaysInSalaryMonth, MAX_SALARY_AMOUNT } from "../src/lib/salary-calculation";
import { getLeaveDates, isValidLeaveDate } from "../src/lib/trainer-leave";
import { addPersonSchema } from "../src/schemas/person.schema";
import { markTrainerLeaveSchema } from "../src/schemas/trainer-leave.schema";
import { salaryAmountSchema, monthStringSchema, markSalaryPaidSchema } from "../src/schemas/salary.schema";

assert.equal(getDaysInSalaryMonth("2024-02"), 29);
assert.equal(getDaysInSalaryMonth("2100-02"), 28);
assert.equal(getDaysInSalaryMonth("2000-02"), 29);
assert.equal(getDaysInSalaryMonth("2026-11"), 30);
assert.throws(() => getDaysInSalaryMonth("0000-01"));
assert.deepEqual(calculateHolidaySalary(30000, 250, 3, "2026-11"), { baseAmount: 30000, holidayDeductionPerDay: 250, holidayDays: 3, deductionAmount: 750, amount: 29250 });
assert.equal(calculateHolidaySalary(100, 0, 30, "2026-11").amount, 100);
assert.equal(calculateHolidaySalary(100, 50, 3, "2026-11").amount, 0);
assert.equal(calculateHolidaySalary(100.25, 0.1, 3, "2026-11").amount, 99.95);
assert.equal(calculateHolidaySalary(MAX_SALARY_AMOUNT, MAX_SALARY_AMOUNT, 31, "2026-12").amount, 0);
for (const days of [-1, 1.5, 31, NaN]) assert.throws(() => calculateHolidaySalary(100, 10, days, "2026-11"));
for (const money of [-1, Infinity, NaN, 0.001, MAX_SALARY_AMOUNT + 1]) {
  assert.equal(salaryAmountSchema.safeParse(money).success, false);
  assert.throws(() => calculateHolidaySalary(money, 0, 0, "2026-11"));
}
for (const money of [0, 0.1, 0.29, 10.01, 100.25, MAX_SALARY_AMOUNT]) assert.equal(salaryAmountSchema.safeParse(money).success, true);
for (const date of ["0000-01-01", "2026-02-29", "2024-02-30", "2026-11-31", "2026-1-01"]) assert.equal(isValidLeaveDate(date), false);
assert.deepEqual(getLeaveDates("2024-02-28", "2024-03-01"), ["2024-02-28", "2024-02-29", "2024-03-01"]);
assert.deepEqual(getLeaveDates("9999-12-31", "9999-12-31"), ["9999-12-31"]);
assert.equal(getLeaveDates("2024-01-01", "2024-12-31").length, 366);
assert.throws(() => getLeaveDates("2024-01-01", "2025-01-01"));
assert.throws(() => getLeaveDates("2026-11-02", "2026-11-01"));
assert.equal(monthStringSchema.safeParse("0000-01").success, false);
assert.equal(markSalaryPaidSchema.safeParse({ salaryRecordId: "record" }).success, false);
assert.equal(markTrainerLeaveSchema.safeParse({ trainerId: "trainer", startDate: "2026-11-01", endDate: "2026-10-30", type: "PAID" }).success, false);
const trainer = { role: "TRAINER", name: "Payroll Test", email: "payroll@example.test", monthlySalary: 1000, salaryDueDay: 1 };
assert.equal(addPersonSchema.parse(trainer).holidayDeductionPerDay, 0);
assert.equal(addPersonSchema.parse({ ...trainer, holidayDeductionPerDay: 123.45 }).holidayDeductionPerDay, 123.45);
assert.equal(addPersonSchema.safeParse({ ...trainer, holidayDeductionPerDay: -1 }).success, false);
console.log("Trainer payroll calculation, money validation, and leave date checks passed.");
