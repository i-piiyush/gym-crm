import * as salaryRepo from "@/db/repositories/salary.repo";
import { formatInTimeZone } from "date-fns-tz";

export function getCurrentMonthString(date: Date = new Date(), timezone = "Asia/Kolkata"): string {
  return formatInTimeZone(date, timezone, "yyyy-MM");
}

export async function getSalariesForGymAndMonth(
  gymId: string,
  month?: string
) {
  const targetMonth = month || getCurrentMonthString();
  return salaryRepo.getSalariesOverviewOptimized(gymId, targetMonth);
}

export async function markSalaryPaid(gymId: string, salaryRecordId: string, expectedAmount: number) {
  return salaryRepo.markSalaryPaid(salaryRecordId, gymId, expectedAmount);
}

export async function getTrainerSalaries(trainerId: string) {
  return salaryRepo.listTrainerSalaryHistory(trainerId);
}

