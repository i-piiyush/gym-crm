import * as salaryRepo from "@/db/repositories/salary.repo";
import { format } from "date-fns";

export function getCurrentMonthString(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

export async function getSalariesForGymAndMonth(
  gymId: string,
  month?: string
) {
  const targetMonth = month || getCurrentMonthString();

  // Safety net: ensure records exist for the month whenever accessed
  await salaryRepo.ensureSalaryRecordsForMonth(gymId, targetMonth);

  return salaryRepo.listSalariesByGymAndMonth(gymId, targetMonth);
}

export async function markSalaryPaid(gymId: string, salaryRecordId: string) {
  return salaryRepo.markSalaryPaid(salaryRecordId, gymId);
}

export async function getTrainerSalaries(trainerId: string) {
  return salaryRepo.listTrainerSalaryHistory(trainerId);
}

