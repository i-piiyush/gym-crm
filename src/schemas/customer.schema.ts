import { z } from "zod";
import { idSchema } from "./common.schema";

export const reassignCustomerTrainerSchema = z.object({
  customerId: idSchema,
  newTrainerId: idSchema,
});

export const updateCustomerMembershipSchema = z.object({
  customerId: idSchema,
  status: z.enum(["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"]),
  planId: z.string().optional().nullable(),
  membershipEnd: z.string().datetime().optional().nullable(),
});

export type ReassignCustomerTrainerInput = z.infer<typeof reassignCustomerTrainerSchema>;
export type UpdateCustomerMembershipInput = z.infer<typeof updateCustomerMembershipSchema>;

