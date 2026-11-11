import * as customerRepo from "@/db/repositories/customer.repo";
import * as salaryRepo from "@/db/repositories/salary.repo";
import prisma from "@/db/client";
import { CustomerListItem } from "@/types/person.types";
import { format } from "date-fns";

export interface SubscriptionBuckets {
  expiringIn7Days: CustomerListItem[];
  expiringIn15Days: CustomerListItem[];
  expiringIn30Days: CustomerListItem[];
  expired: CustomerListItem[];
}

export async function getGymTrials(gymId: string): Promise<CustomerListItem[]> {
  return customerRepo.listTrialsByGym(gymId);
}

export async function getGymSubscriptionsGrouped(
  gymId: string
): Promise<SubscriptionBuckets> {
  const subscriptions = await customerRepo.listSubscriptionsByGym(gymId);
  const now = new Date();
  const nowMs = now.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const buckets: SubscriptionBuckets = {
    expiringIn7Days: [],
    expiringIn15Days: [],
    expiringIn30Days: [],
    expired: [],
  };

  for (const sub of subscriptions) {
    if (sub.status === "EXPIRED") {
      buckets.expired.push(sub);
      continue;
    }

    if (!sub.membershipEnd) {
      continue;
    }

    const endMs = new Date(sub.membershipEnd).getTime();
    const diffMs = endMs - nowMs;

    if (diffMs <= 0) {
      buckets.expired.push(sub);
    } else if (diffMs <= sevenDaysMs) {
      buckets.expiringIn7Days.push(sub);
    } else if (diffMs <= fifteenDaysMs) {
      buckets.expiringIn15Days.push(sub);
    } else if (diffMs <= thirtyDaysMs) {
      buckets.expiringIn30Days.push(sub);
    }
  }

  return buckets;
}

/**
 * Daily cron execution logic:
 * 1. Flips overdue trials and active memberships to EXPIRED
 * 2. Idempotently ensures payroll records for the current month for all active gyms
 */
export async function runDailyCron() {
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");

  // 1. Expire memberships
  const expirationResult = await customerRepo.expireOverdueMemberships(now);

  // 2. Fetch active gyms and ensure salary records
  const activeGyms = await prisma.gym.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  const payrollProcessedGyms: string[] = [];
  for (const gym of activeGyms) {
    await salaryRepo.ensureSalaryRecordsForMonth(gym.id, currentMonth);
    payrollProcessedGyms.push(gym.name);
  }

  return {
    timestamp: now.toISOString(),
    month: currentMonth,
    expiredTrials: expirationResult.expiredTrialsCount,
    expiredMemberships: expirationResult.expiredMembershipsCount,
    totalExpired: expirationResult.totalExpired,
    activeGymsCount: activeGyms.length,
    payrollProcessedGyms,
  };
}

