import prisma from "@/db/client";
import { format, startOfMonth, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import * as salaryRepo from "@/db/repositories/salary.repo";

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

export async function getAdminDashboardStats(
  gymId: string
): Promise<DashboardStats> {
  const gym = await prisma.gym.findUniqueOrThrow({
    where: { id: gymId },
    select: { timezone: true, maxCustomers: true },
  });

  const now = new Date();
  const gymNow = toZonedTime(now, gym.timezone);
  const todayDateStr = format(gymNow, "yyyy-MM-dd");
  const currentMonthStr = format(gymNow, "yyyy-MM");
  const monthStart = startOfMonth(now);
  const sevenDaysFromNow = addDays(now, 7);
  const twoDaysFromNow = addDays(now, 2);

  // Run ensure salary records as safety net
  await salaryRepo.ensureSalaryRecordsForMonth(gymId, currentMonthStr);

  const [
    activeCustomersCount,
    pendingInvitesCount,
    trainersCount,
    presentTodayCount,
    paymentsThisMonth,
    expiringIn7Days,
    expiredCustomers,
    trialsEndingSoon,
    salaryRecords,
  ] = await Promise.all([
    // Active customers
    prisma.customerProfile.count({
      where: { user: { gymId } },
    }),
    // Pending invites
    prisma.invitation.count({
      where: { gymId, role: "CUSTOMER", status: "PENDING" },
    }),
    // Trainers
    prisma.trainerProfile.count({
      where: { user: { gymId, status: "ACTIVE" } },
    }),
    // Present today
    prisma.attendance.count({
      where: { gymId, date: todayDateStr },
    }),
    // Payments this month
    prisma.payment.findMany({
      where: {
        gymId,
        status: "PAID",
        paidAt: { gte: monthStart },
      },
      select: { amount: true },
    }),
    // Expiring within 7 days
    prisma.customerProfile.count({
      where: {
        user: { gymId },
        status: "ACTIVE",
        membershipEnd: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    }),
    // Overdue/Expired members
    prisma.customerProfile.findMany({
      where: {
        user: { gymId },
        status: "EXPIRED",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      take: 5,
    }),
    // Trials ending within 48h
    prisma.customerProfile.findMany({
      where: {
        user: { gymId },
        status: "TRIAL",
        trialEndsAt: {
          gte: now,
          lte: twoDaysFromNow,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      take: 5,
    }),
    // Salaries this month
    prisma.salaryRecord.findMany({
      where: {
        gymId,
        month: currentMonthStr,
        status: "PENDING",
      },
      select: { amount: true },
    }),
  ]);

  const totalRevenue = paymentsThisMonth.reduce(
    (acc, p) => acc + Number(p.amount),
    0
  );

  const pendingSalariesAmount = salaryRecords.reduce(
    (acc, s) => acc + Number(s.amount),
    0
  );

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
    trainersCount,
    presentTodayCount,
    monthlyRevenue: totalRevenue,
    feesOverdueCount: expiredCustomers.length,
    expiringIn7DaysCount: expiringIn7Days,
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
      overdueMembers: expiredCustomers.map((c) => ({
        id: c.userId,
        name: c.user.name,
        email: c.user.email,
        membershipEnd: c.membershipEnd,
      })),
      pendingSalaries: {
        count: salaryRecords.length,
        totalAmount: pendingSalariesAmount,
      },
    },
  };
}

