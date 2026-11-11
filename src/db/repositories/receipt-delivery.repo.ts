import prisma from "@/db/client";
import { DeliveryChannel, DeliveryStatus } from "@prisma/client";

export async function createDeliveryRecord(data: {
  gymId: string;
  paymentId: string;
  channel: DeliveryChannel;
  toEmail?: string | null;
}) {
  return prisma.receiptDelivery.create({
    data: {
      gymId: data.gymId,
      paymentId: data.paymentId,
      channel: data.channel,
      status: DeliveryStatus.PENDING,
      toEmail: data.toEmail ?? null,
      attempts: 1,
    },
  });
}

export async function markDeliverySent(deliveryId: string) {
  return prisma.receiptDelivery.update({
    where: { id: deliveryId },
    data: {
      status: DeliveryStatus.SENT,
      sentAt: new Date(),
      errorMessage: null,
    },
  });
}

export async function markDeliveryFailed(deliveryId: string, errorMsg: string) {
  return prisma.receiptDelivery.update({
    where: { id: deliveryId },
    data: {
      status: DeliveryStatus.FAILED,
      errorMessage: errorMsg.slice(0, 500),
    },
  });
}

export async function incrementDeliveryAttempts(deliveryId: string) {
  return prisma.receiptDelivery.update({
    where: { id: deliveryId },
    data: {
      attempts: { increment: 1 },
      status: DeliveryStatus.PENDING,
    },
  });
}

/**
 * Counts outbound emails sent today by gym to enforce 100 emails/day guardrail
 */
export async function getGymTodayEmailCount(gymId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.receiptDelivery.count({
    where: {
      gymId,
      channel: "EMAIL",
      createdAt: { gte: startOfDay },
    },
  });
}

