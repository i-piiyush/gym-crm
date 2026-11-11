import { z } from "zod";
import { idSchema } from "./common.schema";

export const updateTrainerProfileSchema = z.object({
  trainerId: idSchema,
  monthlySalary: z.number().min(0, "Salary cannot be negative"),
  salaryDueDay: z.number().int().min(1).max(28, "Salary due day must be between 1 and 28"),
});

export type UpdateTrainerProfileInput = z.infer<typeof updateTrainerProfileSchema>;

