import prisma from "@/db/client";
import { Prisma } from "@prisma/client";
import { format, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export interface DashboardStats {
  customers: {
    active: number;
    pendingInvites: number;
    total: number;
    max: number;
    percentage: number;
  };
  trainersCount: number;
  presentTodayCount: number;
  monthlyRevenue: number;
  feesOverdueCount: number;
  expiringIn7DaysCount: number;
  needsAttention: {
    trialsEndingSoon: Array<{
      id: string;
      name: string;
      email: string;
      trialEndsAt: Date | null;
      daysLeft: number;
    }>;
    overdueMembers: Array<{
      id: string;
      name: string;
      email: string;
      membershipEnd: Date | null;
    }>;
    pendingSalaries: {
      count: number;
      totalAmount: number;
    };
  };
}

/**
 * Fetches ALL dashboard stats in a single SQL round-trip using raw SQL.
 *
 * Previous approach: 12 sequential Prisma queries through PgBouncer
 *   = 12 × ~300ms network round-trips = ~4,000–7,000ms from India to US-East-2.
 *
 * Current approach: the aggregate query and both small detail queries run in
 * parallel, so remote database latency is paid once instead of serially.
 */
export async function getAdminDashboardStats(
  gymId: string,
  gymInfo?: { timezone: string; maxCustomers: number }
): Promise<DashboardStats> {
  const gym =
    gymInfo ??
    (await prisma.gym.findUniqueOrThrow({
      where: { id: gymId },
      select: { timezone: true, maxCustomers: true },
    }));

  const now = new Date();
  const gymNow = toZonedTime(now, gym.timezone);
  const todayDateStr = format(gymNow, "yyyy-MM-dd");
  const currentMonthStr = format(gymNow, "yyyy-MM");
  const monthStart = new Date(gymNow.getFullYear(), gymNow.getMonth(), 1);
  const sevenDaysFromNow = addDays(now, 7);
  const twoDaysFromNow = addDays(now, 2);

  // ---------- Single SQL query using CTEs for all dashboard aggregates ----------
  // Start the aggregates and the two attention lists together. These calls are
  // independent, and serializing them adds another full DB round-trip to the
  // dashboard's critical path (especially noticeable with a remote DB).
  const [statsRows, overdueMembers, trialsEndingSoon] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        active_customers: bigint;
        pending_invites: bigint;
        trainers_count: bigint;
        present_today: bigint;
        monthly_revenue: Prisma.Decimal | null;
        expiring_7d: bigint;
        overdue_count: bigint;
        pending_salary_count: bigint;
        pending_salary_total: Prisma.Decimal | null;
      }>
    >`
    SELECT
      (SELECT COUNT(*)
         FROM "CustomerProfile" cp
         JOIN "User" u ON u.id = cp."userId"
        WHERE u."gymId" = ${gymId}
      ) AS active_customers,

      (SELECT COUNT(*)
         FROM "Invitation"
        WHERE "gymId" = ${gymId} AND role = 'CUSTOMER' AND status = 'PENDING'
      ) AS pending_invites,

      (SELECT COUNT(*)
         FROM "TrainerProfile" tp
         JOIN "User" u ON u.id = tp."userId"
        WHERE u."gymId" = ${gymId} AND u.status = 'ACTIVE'
      ) AS trainers_count,

      (SELECT COUNT(*)
         FROM "Attendance"
        WHERE "gymId" = ${gymId} AND date = ${todayDateStr}
      ) AS present_today,

      (SELECT COALESCE(SUM(amount), 0)
         FROM "Payment"
        WHERE "gymId" = ${gymId} AND status = 'PAID' AND "paidAt" >= ${monthStart}
      ) AS monthly_revenue,

      (SELECT COUNT(*)
         FROM "CustomerProfile" cp
         JOIN "User" u ON u.id = cp."userId"
        WHERE u."gymId" = ${gymId}
          AND cp.status = 'ACTIVE'
          AND cp."membershipEnd" >= ${now}
          AND cp."membershipEnd" <= ${sevenDaysFromNow}
      ) AS expiring_7d,

      (SELECT COUNT(*)
         FROM "CustomerProfile" cp
         JOIN "User" u ON u.id = cp."userId"
        WHERE u."gymId" = ${gymId} AND cp.status = 'EXPIRED'
      ) AS overdue_count,

      (SELECT COUNT(*)
         FROM "SalaryRecord"
        WHERE "gymId" = ${gymId} AND month = ${currentMonthStr} AND status = 'PENDING'
      ) AS pending_salary_count,

      (SELECT COALESCE(SUM(amount), 0)
         FROM "SalaryRecord"
        WHERE "gymId" = ${gymId} AND month = ${currentMonthStr} AND status = 'PENDING'
      ) AS pending_salary_total
    `,
    prisma.customerProfile.findMany({
      where: { user: { gymId }, status: "EXPIRED" },
      include: { user: { select: { id: true, name: true, email: true } } },
      take: 5,
    }),
    prisma.customerProfile.findMany({
      where: {
        user: { gymId },
        status: "TRIAL",
        trialEndsAt: { gte: now, lte: twoDaysFromNow },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      take: 5,
    }),
  ]);

  const s = statsRows[0]!;
  const activeCustomersCount = Number(s.active_customers);
  const pendingInvitesCount = Number(s.pending_invites);
  const totalCustomerLoad = activeCustomersCount + pendingInvitesCount;
  const capacityPercentage = Math.min(
    100,
    Math.round((totalCustomerLoad / gym.maxCustomers) * 100)
  );

  return {
    customers: {
      active: activeCustomersCount,
      pendingInvites: pendingInvitesCount,
      total: totalCustomerLoad,
      max: gym.maxCustomers,
      percentage: capacityPercentage,
    },
    trainersCount: Number(s.trainers_count),
    presentTodayCount: Number(s.present_today),
    monthlyRevenue: Number(s.monthly_revenue ?? 0),
    feesOverdueCount: Number(s.overdue_count),
    expiringIn7DaysCount: Number(s.expiring_7d),
    needsAttention: {
      trialsEndingSoon: trialsEndingSoon.map((t) => {
        const msLeft = t.trialEndsAt ? t.trialEndsAt.getTime() - now.getTime() : 0;
        const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        return {
          id: t.userId,
          name: t.user.name,
          email: t.user.email,
          trialEndsAt: t.trialEndsAt,
          daysLeft,
        };
      }),
      overdueMembers: overdueMembers.map((c) => ({
        id: c.userId,
        name: c.user.name,
        email: c.user.email,
        membershipEnd: c.membershipEnd,
      })),
      pendingSalaries: {
        count: Number(s.pending_salary_count),
        totalAmount: Number(s.pending_salary_total ?? 0),
      },
    },
  };
}

