import { gmailSmtpProvider } from "./gmail-smtp.provider";
import { gmailOAuthProvider } from "./gmail-oauth.provider";
import { EmailProvider } from "./email.provider";
import { SendEmailOptions, SendEmailResult } from "@/types/email.types";
import * as receiptDeliveryRepo from "@/db/repositories/receipt-delivery.repo";

const GYM_DAILY_EMAIL_LIMIT = 100;

function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || "gmail-smtp";
  if (provider === "gmail-oauth") {
    return gmailOAuthProvider;
  }
  return gmailSmtpProvider;
}

export async function sendGymEmail({
  gymId,
  paymentId,
  options,
}: {
  gymId: string;
  paymentId: string;
  options: SendEmailOptions;
}): Promise<SendEmailResult> {
  // 1. Enforce gym daily quota (100 emails/day)
  const todayCount = await receiptDeliveryRepo.getGymTodayEmailCount(gymId);
  if (todayCount >= GYM_DAILY_EMAIL_LIMIT) {
    const errorMsg = `Daily outbound email limit (${GYM_DAILY_EMAIL_LIMIT}/day) reached for this gym. Please download receipt directly.`;
    await receiptDeliveryRepo.createDeliveryRecord({
      gymId,
      paymentId,
      channel: "EMAIL",
      toEmail: options.to,
    });
    return {
      success: false,
      error: errorMsg,
    };
  }

  // 2. Create pending ReceiptDelivery record
  const delivery = await receiptDeliveryRepo.createDeliveryRecord({
    gymId,
    paymentId,
    channel: "EMAIL",
    toEmail: options.to,
  });

  // 3. Dispatch through provider
  const provider = getEmailProvider();
  const result = await provider.sendEmail(options);

  // 4. Update status in DB
  if (result.success) {
    await receiptDeliveryRepo.markDeliverySent(delivery.id);
  } else {
    await receiptDeliveryRepo.markDeliveryFailed(
      delivery.id,
      result.error || "Failed to deliver email"
    );
  }

  return result;
}

