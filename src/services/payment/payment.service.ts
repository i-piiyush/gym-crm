import { demoPaymentProvider } from "./demo.provider";
import { razorpayProvider } from "./razorpay.provider";
import { PaymentProvider } from "./payment.provider";
import { RecordPaymentInput } from "@/schemas/payment.schema";
import * as paymentRepo from "@/db/repositories/payment.repo";
import * as customerRepo from "@/db/repositories/customer.repo";
import prisma from "@/db/client";
import { generateReceiptPdfBuffer } from "@/services/receipt/receipt-pdf";
import { generateReceiptToken } from "@/services/receipt/receipt-token.service";
import { sendGymEmail } from "@/services/email/email.service";
import {
  renderReceiptEmailHtml,
  renderReceiptEmailText,
} from "@/services/email/templates/receipt.email";
import { format } from "date-fns";

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || "demo";
  if (provider === "razorpay") {
    return razorpayProvider;
  }
  return demoPaymentProvider;
}

export async function processCustomerPayment(gymId: string, input: RecordPaymentInput) {
  // Fetch customer and plan
  const [customer, plan] = await Promise.all([
    prisma.customerProfile.findUnique({
      where: { userId: input.customerId },
      include: { user: true },
    }),
    prisma.membershipPlan.findUnique({
      where: { id: input.planId },
    }),
  ]);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  if (!plan) {
    throw new Error("Membership plan not found.");
  }

  const provider = getPaymentProvider();

  const result = await provider.createPayment({
    gymId,
    customerId: customer.userId,
    planId: plan.id,
    amount: Number(plan.price),
    currency: "INR",
    customerName: customer.user.name,
    customerEmail: customer.user.email,
    emailReceipt: input.emailReceipt,
  });

  return result;
}

export async function resendReceiptEmail(paymentId: string) {
  const payment = await paymentRepo.getPaymentWithFullDetails(paymentId);

  if (!payment) {
    throw new Error("Payment record not found.");
  }

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
    gymId: payment.gymId,
    paymentId: payment.id,
    options: {
      to: payment.customer.user.email,
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

  return {
    deliveryStatus: emailRes.success ? ("SENT" as const) : ("FAILED" as const),
    errorMessage: emailRes.error || null,
  };
}

export async function getPaymentPdfBuffer(paymentId: string): Promise<{
  filename: string;
  buffer: Buffer;
}> {
  const payment = await paymentRepo.getPaymentWithFullDetails(paymentId);

  if (!payment) {
    throw new Error("Payment record not found.");
  }

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

  return {
    filename: `receipt-${payment.receiptNumber}.pdf`,
    buffer: pdfBuffer,
  };
}

