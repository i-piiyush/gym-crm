import { z } from "zod";
import { emailSchema, phoneSchema, idSchema } from "./common.schema";

export const addPersonSchema = z
  .object({
    role: z.enum(["TRAINER", "CUSTOMER"]),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: emailSchema,
    phone: phoneSchema,

    // Trainer specific fields
    monthlySalary: z.number().min(0, "Salary cannot be negative").optional(),
    salaryDueDay: z.number().int().min(1).max(28).optional().default(1),

    // Customer specific fields
    trainerId: z.string().optional(),
    planId: z.string().optional().nullable(),
    isTrial: z.boolean().default(false),
    trialDays: z.number().int().min(1).max(30).default(7),
    emailReceipt: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.role === "TRAINER") {
      if (data.monthlySalary === undefined || data.monthlySalary === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Monthly salary is required for trainers",
          path: ["monthlySalary"],
        });
      }
    }

    if (data.role === "CUSTOMER") {
      if (!data.trainerId || data.trainerId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Every customer must be assigned to an active trainer",
          path: ["trainerId"],
        });
      }
    }
  });

export const removePersonSchema = z.object({
  userId: idSchema,
  reassignedTrainerId: z.string().optional(),
});

export type AddPersonInput = z.infer<typeof addPersonSchema>;
export type RemovePersonInput = z.infer<typeof removePersonSchema>;

