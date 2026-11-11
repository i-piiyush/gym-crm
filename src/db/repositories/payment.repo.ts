import prisma from "@/db/client";
import { Prisma, PaymentProviderType, PaymentStatus } from "@prisma/client";
import { PaymentListItem } from "@/types/payment.types";

export async function createPaymentWithSequentialReceipt(data: {
  gymId: string;
  customerId: string;
  planId: string;
  amount: number;
  provider: PaymentProviderType;
  providerPaymentId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch gym and plan
    const [gym, plan, customer] = await Promise.all([
      tx.gym.findUniqueOrThrow({ where: { id: data.gymId } }),
      tx.membershipPlan.findUniqueOrThrow({ where: { id: data.planId } }),
      tx.customerProfile.findUniqueOrThrow({ where: { userId: data.customerId } }),
    ]);

    // 2. Atomic yearly counter increment
    const currentYear = new Date().getFullYear();
    const counter = await tx.receiptCounter.upsert({
      where: {
        gymId_year: {
          gymId: data.gymId,
          year: currentYear,
        },
      },
      update: {
        lastNumber: { increment: 1 },
      },
      create: {
        gymId: data.gymId,
        year: currentYear,
        lastNumber: 1,
      },
    });

    const formattedSequence = String(counter.lastNumber).padStart(5, "0");
    const receiptNumber = `${gym.receiptPrefix}-${currentYear}-${formattedSequence}`;

    // 3. Compute membership extension
    const now = new Date();
    let newStart = customer.membershipStart || now;
    let newEnd: Date;

    if (customer.membershipEnd && customer.membershipEnd > now) {
      // Extend from current expiration date
      newEnd = new Date(customer.membershipEnd.getTime() + plan.durationDays * 86400000);
    } else {
      // Start from today
      newStart = now;
      newEnd = new Date(now.getTime() + plan.durationDays * 86400000);
    }

    // 4. Update customer profile to ACTIVE with extended dates
    await tx.customerProfile.update({
      where: { userId: data.customerId },
      data: {
        planId: plan.id,
        status: "ACTIVE",
        membershipStart: newStart,
        membershipEnd: newEnd,
      },
    });

    // 5. Create Payment record
    const payment = await tx.payment.create({
      data: {
        gymId: data.gymId,
        customerId: data.customerId,
        planId: data.planId,
        amount: new Prisma.Decimal(data.amount),
        provider: data.provider,
        status: PaymentStatus.PAID,
        providerPaymentId: data.providerPaymentId ?? null,
        receiptNumber,
      },
      include: {
        gym: {
          include: {
            users: {
              where: { role: "ADMIN" },
              select: { email: true, name: true },
              take: 1,
            },
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        plan: true,
      },
    });

    return payment;
  });
}

export async function listPaymentsByGym(gymId: string): Promise<PaymentListItem[]> {
  const payments = await prisma.payment.findMany({
    where: { gymId },
    include: {
      customer: {
        include: {
          user: true,
        },
      },
      plan: true,
      receiptDeliveries: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { paidAt: "desc" },
  });

  return payments.map((p) => {
    const delivery = p.receiptDeliveries[0];
    return {
      id: p.id,
      receiptNumber: p.receiptNumber,
      customerId: p.customerId,
      customerName: p.customer.user.name,
      customerEmail: p.customer.user.email,
      planId: p.planId,
      planName: p.plan?.name || "Custom Plan",
      amount: Number(p.amount),
      provider: p.provider,
      status: p.status,
      paidAt: p.paidAt,
      deliveryStatus: delivery ? delivery.status : "PENDING",
      deliveryChannel: delivery ? delivery.channel : "EMAIL",
      deliveryError: delivery?.errorMessage || null,
    };
  });
}

export async function getPaymentWithFullDetails(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      gym: {
        include: {
          users: {
            where: { role: "ADMIN" },
            select: { email: true, name: true },
            take: 1,
          },
        },
      },
      customer: {
        include: {
          user: true,
        },
      },
      plan: true,
      receiptDeliveries: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

