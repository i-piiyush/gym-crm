import { z } from "zod";
import { idSchema } from "./common.schema";

export const recordPaymentSchema = z.object({
  customerId: idSchema,
  planId: idSchema,
  emailReceipt: z.boolean().default(true),
});

export const resendReceiptEmailSchema = z.object({
  paymentId: idSchema,
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type ResendReceiptEmailInput = z.infer<typeof resendReceiptEmailSchema>;

