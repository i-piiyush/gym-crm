import { z } from "zod";
import { idSchema } from "./common.schema";

export const receiptDownloadTokenSchema = z.object({
  paymentId: idSchema,
  expiresAt: z.number().int().positive(),
  signature: z.string().min(32),
});

export type ReceiptDownloadTokenPayload = z.infer<typeof receiptDownloadTokenSchema>;

