import { z } from "zod";
import { idSchema } from "./common.schema";

export const monthStringSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

export const markSalaryPaidSchema = z.object({
  salaryRecordId: idSchema,
});

export const getSalariesForMonthSchema = z.object({
  month: monthStringSchema.optional(),
});

export type MarkSalaryPaidInput = z.infer<typeof markSalaryPaidSchema>;
export type GetSalariesForMonthInput = z.infer<typeof getSalariesForMonthSchema>;

