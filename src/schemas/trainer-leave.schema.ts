import { z } from "zod";
import { idSchema } from "./common.schema";
import { monthStringSchema } from "./salary.schema";
import { getLeaveDates, isValidLeaveDate } from "@/lib/trainer-leave";

const leaveDateSchema = z.string().refine(isValidLeaveDate, "Enter a valid calendar date");

export const listTrainerLeavesSchema = z.object({
  trainerId: idSchema,
  month: monthStringSchema.optional(),
});

export const markTrainerLeaveSchema = z.object({
  trainerId: idSchema,
  startDate: leaveDateSchema,
  endDate: leaveDateSchema,
  type: z.enum(["PAID", "UNPAID"]),
  reason: z.string().trim().max(500).optional(),
}).superRefine((input, ctx) => {
  try {
    getLeaveDates(input.startDate, input.endDate);
  } catch (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: (error as Error).message });
  }
});

export const removeTrainerLeaveSchema = z.object({ leaveId: idSchema });
export type MarkTrainerLeaveInput = z.infer<typeof markTrainerLeaveSchema>;
