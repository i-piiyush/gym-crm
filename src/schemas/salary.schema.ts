import { z } from "zod";
import { idSchema } from "./common.schema";
import { MAX_SALARY_AMOUNT } from "@/lib/salary-calculation";

export const salaryAmountSchema = z.number().finite()
  .min(0, "Amount cannot be negative")
  .max(MAX_SALARY_AMOUNT, "Amount exceeds the supported salary limit")
  .multipleOf(0.01, "Use at most two decimal places");

export const monthStringSchema = z
  .string()
  .regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

export const markSalaryPaidSchema = z.object({
  salaryRecordId: idSchema,
  expectedAmount: salaryAmountSchema,
});

export const updateTrainerHolidayRateSchema = z.object({
  trainerId: idSchema,
  holidayDeductionPerDay: salaryAmountSchema,
});

export const getSalariesForMonthSchema = z.object({
  month: monthStringSchema.optional(),
});

export type MarkSalaryPaidInput = z.infer<typeof markSalaryPaidSchema>;
export type GetSalariesForMonthInput = z.infer<typeof getSalariesForMonthSchema>;
export type UpdateTrainerHolidayRateInput = z.infer<typeof updateTrainerHolidayRateSchema>;

