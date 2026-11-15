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
    select: {
      id: true,
      receiptNumber: true,
      customerId: true,
      planId: true,
      amount: true,
      provider: true,
      status: true,
      paidAt: true,
      customer: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      plan: {
        select: {
          name: true,
        },
      },
      receiptDeliveries: {
        select: {
          status: true,
          channel: true,
          errorMessage: true,
        },
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

/**
 * Consolidated 1-roundtrip query for the Admin Payments page.
 * Fetches payments, customer options, and active plans in a single query.
 */
export async function getPaymentsPageData(gymId: string): Promise<{
  payments: PaymentListItem[];
  customerOptions: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    planId: string | null;
  }>;
  activePlans: Array<{
    id: string;
    name: string;
    durationDays: number;
    price: number;
  }>;
}> {
  const rows = await prisma.$queryRaw<
    {
      payments: Array<{
        id: string;
        receiptNumber: string;
        customerId: string;
        planId: string | null;
        amount: number;
        provider: string;
        status: string;
        paidAt: string | Date;
        customerName: string;
        customerEmail: string;
        planName: string;
        latestDelivery: {
          status: string;
          channel: string;
          errorMessage: string | null;
        } | null;
      }>;
      customers: Array<{
        id: string;
        name: string;
        email: string;
        status: string;
        planId: string | null;
      }>;
      plans: Array<{
        id: string;
        name: string;
        durationDays: number;
        price: number;
      }>;
    }[]
  >`
    SELECT
      (
        SELECT COALESCE(json_agg(p), '[]'::json)
        FROM (
          SELECT 
            pm."id",
            pm."receiptNumber",
            pm."customerId",
            pm."planId",
            pm."amount"::double precision AS "amount",
            pm."provider",
            pm."status",
            pm."paidAt",
            u."name" AS "customerName",
            u."email" AS "customerEmail",
            mp."name" AS "planName",
            (
              SELECT json_build_object(
                'status', rd."status",
                'channel', rd."channel",
                'errorMessage', rd."errorMessage"
              )
              FROM "ReceiptDelivery" rd
              WHERE rd."paymentId" = pm."id"
              ORDER BY rd."createdAt" DESC
              LIMIT 1
            ) AS "latestDelivery"
          FROM "Payment" pm
          JOIN "CustomerProfile" cp ON cp."userId" = pm."customerId"
          JOIN "User" u ON u."id" = cp."userId"
          JOIN "MembershipPlan" mp ON mp."id" = pm."planId"
          WHERE pm."gymId" = ${gymId}
          ORDER BY pm."paidAt" DESC
        ) p
      ) AS "payments",
      (
        SELECT COALESCE(json_agg(c), '[]'::json)
        FROM (
          SELECT 
            u."id",
            u."name",
            u."email",
            cp."status",
            cp."planId"
          FROM "User" u
          JOIN "CustomerProfile" cp ON cp."userId" = u."id"
          WHERE u."gymId" = ${gymId} AND u."role" = 'CUSTOMER'
          ORDER BY u."name" ASC
        ) c
      ) AS "customers",
      (
        SELECT COALESCE(json_agg(pl), '[]'::json)
        FROM (
          SELECT 
            "id",
            "name",
            "durationDays",
            "price"::double precision AS "price"
          FROM "MembershipPlan"
          WHERE "gymId" = ${gymId} AND "isActive" = true
          ORDER BY "price" ASC
        ) pl
      ) AS "plans";
  `;

  const row = rows[0];

  const payments: PaymentListItem[] = (row?.payments || []).map((p) => {
    const delivery = p.latestDelivery;
    return {
      id: p.id,
      receiptNumber: p.receiptNumber,
      customerId: p.customerId,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      planId: p.planId,
      planName: p.planName,
      amount: Number(p.amount),
      provider: p.provider as PaymentListItem["provider"],
      status: p.status as PaymentListItem["status"],
      paidAt: new Date(p.paidAt),
      deliveryStatus: (delivery?.status || "PENDING") as PaymentListItem["deliveryStatus"],
      deliveryChannel: (delivery?.channel || "EMAIL") as PaymentListItem["deliveryChannel"],
      deliveryError: delivery?.errorMessage || null,
    };
  });

  const customerOptions = (row?.customers || []).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.status,
    planId: c.planId,
  }));

  const activePlans = (row?.plans || []).map((pl) => ({
    id: pl.id,
    name: pl.name,
    durationDays: Number(pl.durationDays),
    price: Number(pl.price),
  }));

  return { payments, customerOptions, activePlans };
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

