"use server";

import { createSafeAction } from "@/lib/safe-action";
import {
  recordPaymentSchema,
  resendReceiptEmailSchema,
} from "@/schemas/payment.schema";
import * as paymentService from "@/services/payment/payment.service";
import * as paymentRepo from "@/db/repositories/payment.repo";
import { generateReceiptToken } from "@/services/receipt/receipt-token.service";
import { revalidatePath } from "next/cache";

export const recordPaymentAction = createSafeAction({
  schema: recordPaymentSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const result = await paymentService.processCustomerPayment(ctx.gymId!, input);
    revalidatePath("/admin/payments");
    revalidatePath("/admin/people");
    revalidatePath("/admin");
    return {
      paymentId: result.paymentId,
      receiptNumber: result.receiptNumber,
      deliveryStatus: result.receiptDeliveryStatus,
    };
  },
});

export const resendReceiptEmailAction = createSafeAction({
  schema: resendReceiptEmailSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input) => {
    const result = await paymentService.resendReceiptEmail(input.paymentId);
    revalidatePath("/admin/payments");
    return result;
  },
});

export const getReceiptDownloadUrlAction = createSafeAction({
  schema: resendReceiptEmailSchema,
  allowedRoles: ["ADMIN", "CUSTOMER"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const payment = await paymentRepo.getPaymentWithFullDetails(input.paymentId);
    if (!payment || payment.gymId !== ctx.gymId) {
      throw new Error("Receipt not found or unauthorized.");
    }
    const token = generateReceiptToken(payment.id);
    return { url: `/api/receipts/${token}` };
  },
});
