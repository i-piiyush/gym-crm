import { z } from "zod";
import { idSchema } from "./common.schema";

export const createPlanSchema = z.object({
  name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(50),
  durationDays: z
    .number({ invalid_type_error: "Duration must be a number" })
    .int("Duration must be an integer number of days")
    .min(1, "Duration must be at least 1 day")
    .max(730, "Duration cannot exceed 730 days (2 years)"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative"),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(50),
  durationDays: z
    .number({ invalid_type_error: "Duration must be a number" })
    .int("Duration must be an integer number of days")
    .min(1, "Duration must be at least 1 day")
    .max(730, "Duration cannot exceed 730 days"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative"),
  isActive: z.boolean(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

