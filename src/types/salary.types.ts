export type SalaryStatusType = "PENDING" | "PAID";

export interface SalaryRecordItem {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  trainerPhone: string | null;
  month: string;
  amount: number;
  status: SalaryStatusType;
  paidAt: Date | null;
  salaryDueDay: number;
}

export interface SalaryOverview {
  month: string;
  totalSalaries: number;
  totalPending: number;
  totalPaid: number;
  records: SalaryRecordItem[];
}

