import { getDaysInSalaryMonth } from "@/lib/salary-calculation";

export function isValidLeaveDate(date: string): boolean {
  if (!/^(?!0000)\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(date)) return false;
  const day = Number(date.slice(8));
  return day >= 1 && day <= getDaysInSalaryMonth(date.slice(0, 7));
}

export function getLeaveDates(startDate: string, endDate: string): string[] {
  if (!isValidLeaveDate(startDate) || !isValidLeaveDate(endDate) || endDate < startDate) {
    throw new Error("Choose a valid leave date range with the end on or after the start.");
  }
  const days: string[] = [];
  const date = new Date(`${startDate}T00:00:00.000Z`);
  while (date.toISOString().slice(0, 10) <= endDate) {
    if (days.length >= 366) throw new Error("Mark at most 366 leave days at a time.");
    days.push(date.toISOString().slice(0, 10));
    if (days[days.length - 1] === endDate) break;
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}
