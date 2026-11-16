export const MAX_SALARY_AMOUNT = 99_999_999.99;

export function getDaysInSalaryMonth(month: string): number {
  if (!/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Month must be in YYYY-MM format.");
  }
  const [year, monthNumber] = month.split("-").map(Number);
  const leapYear = year! % 4 === 0 && (year! % 100 !== 0 || year! % 400 === 0);
  return [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthNumber! - 1]!;
}

function toPaise(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > MAX_SALARY_AMOUNT) {
    throw new Error("Salary amounts must be nonnegative and within the supported limit.");
  }
  const paise = Math.round(value * 100);
  if (Math.abs(value * 100 - paise) > 0.00001) {
    throw new Error("Salary amounts can have at most two decimal places.");
  }
  return paise;
}

export function calculateHolidaySalary(
  baseAmount: number,
  holidayDeductionPerDay: number,
  holidayDays: number,
  month: string,
) {
  const daysInMonth = getDaysInSalaryMonth(month);
  if (!Number.isInteger(holidayDays) || holidayDays < 0 || holidayDays > daysInMonth) {
    throw new Error(`Unpaid holidays must be a whole number between 0 and ${daysInMonth}.`);
  }
  const basePaise = toPaise(baseAmount);
  const ratePaise = toPaise(holidayDeductionPerDay);
  const deductionPaise = Math.min(basePaise, holidayDays * ratePaise);
  return {
    baseAmount: basePaise / 100,
    holidayDeductionPerDay: ratePaise / 100,
    holidayDays,
    deductionAmount: deductionPaise / 100,
    amount: (basePaise - deductionPaise) / 100,
  };
}
