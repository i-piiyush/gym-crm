import { PaymentProvider } from "./payment.provider";
import { CreatePaymentInput, PaymentResult } from "@/types/payment.types";
import * as paymentRepo from "@/db/repositories/payment.repo";
import { generateReceiptPdfBuffer } from "@/services/receipt/receipt-pdf";
import { generateReceiptToken } from "@/services/receipt/receipt-token.service";
import { sendGymEmail } from "@/services/email/email.service";
import {
  renderReceiptEmailHtml,
  renderReceiptEmailText,
} from "@/services/email/templates/receipt.email";
import * as receiptDeliveryRepo from "@/db/repositories/receipt-delivery.repo";
import { format } from "date-fns";

export class DemoPaymentProvider implements PaymentProvider {
  name = "demo" as const;

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const demoTransactionId = `demo_txn_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    // 1. Create Payment record with atomic yearly-incremented receipt number
    const payment = await paymentRepo.createPaymentWithSequentialReceipt({
      gymId: input.gymId,
      customerId: input.customerId,
      planId: input.planId,
      amount: input.amount,
      provider: "DEMO",
      providerPaymentId: demoTransactionId,
    });

    // 2. Generate Receipt PDF Buffer
    const pdfBuffer = await generateReceiptPdfBuffer({
      receiptNumber: payment.receiptNumber,
      gymName: payment.gym.name,
      gymAddress: payment.gym.address,
      customerName: payment.customer.user.name,
      customerEmail: payment.customer.user.email,
      planName: payment.plan?.name || "Membership Plan",
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
      membershipStart: payment.customer.membershipStart,
      membershipEnd: payment.customer.membershipEnd,
    });

    let deliveryStatus: "PENDING" | "SENT" | "FAILED" = "PENDING";

    // 3. Handle Delivery Channel
    if (input.emailReceipt) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const signedToken = generateReceiptToken(payment.id);
      const signedDownloadUrl = `${appUrl}/api/receipts/${signedToken}`;

      const validityDates =
        payment.customer.membershipStart && payment.customer.membershipEnd
          ? `${format(new Date(payment.customer.membershipStart), "dd MMM yyyy")} to ${format(
              new Date(payment.customer.membershipEnd),
              "dd MMM yyyy"
            )}`
          : "Active Membership";

      const emailHtml = renderReceiptEmailHtml({
        customerName: payment.customer.user.name,
        gymName: payment.gym.name,
        receiptNumber: payment.receiptNumber,
        planName: payment.plan?.name || "Membership",
        amount: Number(payment.amount),
        validityDates,
        signedDownloadUrl,
      });

      const emailText = renderReceiptEmailText({
        customerName: payment.customer.user.name,
        gymName: payment.gym.name,
        receiptNumber: payment.receiptNumber,
        planName: payment.plan?.name || "Membership",
        amount: Number(payment.amount),
        validityDates,
        signedDownloadUrl,
      });

      const ownerEmail = payment.gym.users?.[0]?.email;

      const emailRes = await sendGymEmail({
        gymId: input.gymId,
        paymentId: payment.id,
        options: {
          to: input.customerEmail,
          subject: `Your receipt ${payment.receiptNumber} from ${payment.gym.name}`,
          html: emailHtml,
          text: emailText,
          fromName: payment.gym.name,
          replyTo: ownerEmail,
          attachments: [
            {
              filename: `receipt-${payment.receiptNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        },
      });

      deliveryStatus = emailRes.success ? "SENT" : "FAILED";
    } else {
      // Record download channel
      await receiptDeliveryRepo.createDeliveryRecord({
        gymId: input.gymId,
        paymentId: payment.id,
        channel: "DOWNLOAD",
        toEmail: null,
      });
      deliveryStatus = "SENT";
    }

    return {
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
      status: "PAID",
      providerPaymentId: demoTransactionId,
      paidAt: payment.paidAt,
      receiptDeliveryStatus: deliveryStatus,
      receiptPdfBuffer: pdfBuffer,
    };
  }

  async verifyPayment(): Promise<boolean> {
    return true;
  }

  async refund(): Promise<boolean> {
    return true;
  }
}

export const demoPaymentProvider = new DemoPaymentProvider();

