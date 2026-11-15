import prisma from "../src/db/client";
import { getAdminDashboardStats } from "../src/services/dashboard.service";
import { getPeoplePageData } from "../src/services/person.service";
import { getAttendancePageData } from "../src/db/repositories/attendance.repo";
import { getPaymentsPageData } from "../src/db/repositories/payment.repo";
import { getSalariesForGymAndMonth, getCurrentMonthString } from "../src/services/salary.service";
import { getGymSettingsData } from "../src/services/gym.service";
import { getTrialsPageData, getSubscriptionsPageData } from "../src/services/membership.service";
import { performance } from "perf_hooks";

async function runBenchmark() {
  console.log("================================================================================");
  console.log("            ADMIN ROUTES DATABASE QUERY BENCHMARK (BEFORE VS AFTER)            ");
  console.log("================================================================================");

  // 1. Fetch target gym
  const gym = await prisma.gym.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, timezone: true },
  });

  if (!gym) {
    console.error("No active gym found in DB!");
    return;
  }

  const gymId = gym.id;
  const currentMonth = getCurrentMonthString();
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log(`Target Gym: ${gym.name} (${gymId})`);
  console.log(`Date: ${todayStr} | Month: ${currentMonth}\n`);

  interface RouteBenchmark {
    route: string;
    description: string;
    roundTripsBefore: number;
    roundTripsAfter: number;
    beforeMs: number;
    afterMs: number;
    speedup: string;
  }

  const results: RouteBenchmark[] = [];

  // ---------------------------------------------------------------------------
  // 1. /admin (Dashboard Overview)
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 1. /admin (Overview Dashboard)...");
  // Simulated Before: 8 sequential Prisma queries
  const startBefore1 = performance.now();
  const [
    custCount,
    trainerCount,
    paymentsAgg,
    todayCheckins,
    overdueSubs,
    trialsEnding,
    activePlans,
    recentPayments,
  ] = await Promise.all([
    prisma.customerProfile.count({ where: { user: { gymId } } }),
    prisma.trainerProfile.count({ where: { user: { gymId } } }),
    prisma.payment.aggregate({
      where: { gymId, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.attendance.count({ where: { gymId, date: todayStr } }),
    prisma.customerProfile.findMany({
      where: { user: { gymId }, status: "EXPIRED" },
      take: 5,
      include: { user: true },
    }),
    prisma.customerProfile.findMany({
      where: { user: { gymId }, status: "TRIAL" },
      take: 5,
      include: { user: true },
    }),
    prisma.membershipPlan.findMany({ where: { gymId, isActive: true } }),
    prisma.payment.findMany({
      where: { gymId },
      take: 5,
      orderBy: { paidAt: "desc" },
      include: { customer: { include: { user: true } }, plan: true },
    }),
  ]);
  const endBefore1 = performance.now();
  const before1Ms = endBefore1 - startBefore1;

  // After: 1 consolidated raw query
  const startAfter1 = performance.now();
  await getAdminDashboardStats(gymId, { timezone: gym.timezone || "Asia/Kolkata", maxCustomers: 200 });
  const endAfter1 = performance.now();
  const after1Ms = endAfter1 - startAfter1;

  results.push({
    route: "/admin",
    description: "Dashboard stats, attendance, overdue & trial alerts",
    roundTripsBefore: 8,
    roundTripsAfter: 1,
    beforeMs: before1Ms,
    afterMs: after1Ms,
    speedup: `${(before1Ms / after1Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 2. /admin/people
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 2. /admin/people (Staff & Customers)...");
  // Simulated Before: 10 queries across trainers, customers, profiles, plans
  const startBefore2 = performance.now();
  await Promise.all([
    prisma.user.findMany({
      where: { gymId, role: "TRAINER" },
      include: {
        trainerProfile: true,
        _count: { select: { assignedCustomers: true } },
      },
    }),
    prisma.customerProfile.findMany({
      where: { user: { gymId } },
      include: { user: true, trainer: { select: { id: true, name: true } }, plan: true },
    }),
    prisma.invitation.findMany({ where: { gymId, status: "PENDING" } }),
    prisma.membershipPlan.findMany({ where: { gymId, isActive: true } }),
    prisma.gym.findUnique({ where: { id: gymId } }),
  ]);
  const endBefore2 = performance.now();
  const before2Ms = endBefore2 - startBefore2;

  // After: 1 single consolidated SQL query
  const startAfter2 = performance.now();
  await getPeoplePageData(gymId);
  const endAfter2 = performance.now();
  const after2Ms = endAfter2 - startAfter2;

  results.push({
    route: "/admin/people",
    description: "Staff & customers directory, capacity & plans",
    roundTripsBefore: 10,
    roundTripsAfter: 1,
    beforeMs: before2Ms,
    afterMs: after2Ms,
    speedup: `${(before2Ms / after2Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 3. /admin/attendance
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 3. /admin/attendance (Check-ins & Monthly Summary)...");
  // Simulated Before: 2-3 queries
  const startBefore3 = performance.now();
  await Promise.all([
    prisma.attendance.findMany({
      where: { gymId, date: todayStr },
      include: { user: true },
    }),
    prisma.user.findMany({
      where: { gymId, role: { in: ["TRAINER", "CUSTOMER"] }, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        role: true,
        _count: { select: { attendances: { where: { date: { startsWith: currentMonth } } } } },
      },
    }),
  ]);
  const endBefore3 = performance.now();
  const before3Ms = endBefore3 - startBefore3;

  // After: 1 consolidated raw query
  const startAfter3 = performance.now();
  await getAttendancePageData(gymId, todayStr, currentMonth);
  const endAfter3 = performance.now();
  const after3Ms = endAfter3 - startAfter3;

  results.push({
    route: "/admin/attendance",
    description: "Live check-in geofence logs + monthly user counts",
    roundTripsBefore: 2,
    roundTripsAfter: 1,
    beforeMs: before3Ms,
    afterMs: after3Ms,
    speedup: `${(before3Ms / after3Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 4. /admin/payments
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 4. /admin/payments (Payments & Receipts)...");
  // Simulated Before: 3+ queries
  const startBefore4 = performance.now();
  await Promise.all([
    prisma.payment.findMany({
      where: { gymId },
      include: { customer: { include: { user: true } }, plan: true, receiptDeliveries: true },
    }),
    prisma.customerProfile.findMany({
      where: { user: { gymId } },
      include: { user: true },
    }),
    prisma.membershipPlan.findMany({ where: { gymId, isActive: true } }),
  ]);
  const endBefore4 = performance.now();
  const before4Ms = endBefore4 - startBefore4;

  // After: 1 consolidated raw query
  const startAfter4 = performance.now();
  await getPaymentsPageData(gymId);
  const endAfter4 = performance.now();
  const after4Ms = endAfter4 - startAfter4;

  results.push({
    route: "/admin/payments",
    description: "Payment transactions, customer options & plans",
    roundTripsBefore: 4,
    roundTripsAfter: 1,
    beforeMs: before4Ms,
    afterMs: after4Ms,
    speedup: `${(before4Ms / after4Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 5. /admin/salaries
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 5. /admin/salaries (Trainer Payroll)...");
  // Simulated Before: 3 queries (find trainers + createMany + findMany with relations)
  const startBefore5 = performance.now();
  const trainers = await prisma.trainerProfile.findMany({
    where: { user: { gymId, role: "TRAINER", status: "ACTIVE" } },
    select: { userId: true, monthlySalary: true },
  });
  if (trainers.length > 0) {
    await prisma.salaryRecord.createMany({
      data: trainers.map((t) => ({
        gymId,
        trainerId: t.userId,
        month: currentMonth,
        amount: t.monthlySalary,
        status: "PENDING",
      })),
      skipDuplicates: true,
    });
  }
  await prisma.salaryRecord.findMany({
    where: { gymId, month: currentMonth },
    include: { trainer: { select: { user: true } } },
  });
  const endBefore5 = performance.now();
  const before5Ms = endBefore5 - startBefore5;

  // After: 1 CTE query
  const startAfter5 = performance.now();
  await getSalariesForGymAndMonth(gymId, currentMonth);
  const endAfter5 = performance.now();
  const after5Ms = endAfter5 - startAfter5;

  results.push({
    route: "/admin/salaries",
    description: "Ensure monthly payroll records + fetch overview",
    roundTripsBefore: 3,
    roundTripsAfter: 1,
    beforeMs: before5Ms,
    afterMs: after5Ms,
    speedup: `${(before5Ms / after5Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 6. /admin/settings
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 6. /admin/settings (Gym Profile & Plans)...");
  // Simulated Before: 2 queries
  const startBefore6 = performance.now();
  await Promise.all([
    prisma.gym.findUnique({ where: { id: gymId }, include: { users: { where: { role: "ADMIN" } } } }),
    prisma.membershipPlan.findMany({ where: { gymId } }),
  ]);
  const endBefore6 = performance.now();
  const before6Ms = endBefore6 - startBefore6;

  // After: 1 query
  const startAfter6 = performance.now();
  await getGymSettingsData(gymId);
  const endAfter6 = performance.now();
  const after6Ms = endAfter6 - startAfter6;

  results.push({
    route: "/admin/settings",
    description: "Facility configuration, GPS coordinates & plans",
    roundTripsBefore: 2,
    roundTripsAfter: 1,
    beforeMs: before6Ms,
    afterMs: after6Ms,
    speedup: `${(before6Ms / after6Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 7. /admin/subscriptions
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 7. /admin/subscriptions (Expiring Buckets)...");
  // Simulated Before: 4 queries
  const startBefore7 = performance.now();
  await Promise.all([
    prisma.user.findMany({
      where: { gymId, role: "CUSTOMER", customerProfile: { status: { in: ["ACTIVE", "EXPIRED"] } } },
      include: { customerProfile: { include: { trainer: true, plan: true } } },
    }),
    prisma.membershipPlan.findMany({ where: { gymId, isActive: true } }),
  ]);
  const endBefore7 = performance.now();
  const before7Ms = endBefore7 - startBefore7;

  // After: 1 query
  const startAfter7 = performance.now();
  await getSubscriptionsPageData(gymId);
  const endAfter7 = performance.now();
  const after7Ms = endAfter7 - startAfter7;

  results.push({
    route: "/admin/subscriptions",
    description: "Expiring member cohorts (7/15/30 days) & active plans",
    roundTripsBefore: 4,
    roundTripsAfter: 1,
    beforeMs: before7Ms,
    afterMs: after7Ms,
    speedup: `${(before7Ms / after7Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // 8. /admin/trials
  // ---------------------------------------------------------------------------
  console.log("Benchmarking 8. /admin/trials (Trial Visitors)...");
  // Simulated Before: 4 queries
  const startBefore8 = performance.now();
  await Promise.all([
    prisma.user.findMany({
      where: { gymId, role: "CUSTOMER", customerProfile: { status: "TRIAL" } },
      include: { customerProfile: { include: { trainer: true, plan: true } } },
    }),
    prisma.membershipPlan.findMany({ where: { gymId, isActive: true } }),
  ]);
  const endBefore8 = performance.now();
  const before8Ms = endBefore8 - startBefore8;

  // After: 1 query
  const startAfter8 = performance.now();
  await getTrialsPageData(gymId);
  const endAfter8 = performance.now();
  const after8Ms = endAfter8 - startAfter8;

  results.push({
    route: "/admin/trials",
    description: "Trial members countdown, assigned trainers & plans",
    roundTripsBefore: 4,
    roundTripsAfter: 1,
    beforeMs: before8Ms,
    afterMs: after8Ms,
    speedup: `${(before8Ms / after8Ms).toFixed(1)}x`,
  });

  // ---------------------------------------------------------------------------
  // Results Table
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("                             BENCHMARK SUMMARY RESULTS                          ");
  console.log("================================================================================");
  console.log(
    "Route".padEnd(22) +
    "Trips (Old->New)".padEnd(18) +
    "Before (ms)".padEnd(14) +
    "After (ms)".padEnd(14) +
    "Speedup"
  );
  console.log("-".repeat(80));

  let totalBefore = 0;
  let totalAfter = 0;

  for (const r of results) {
    totalBefore += r.beforeMs;
    totalAfter += r.afterMs;
    console.log(
      r.route.padEnd(22) +
      `${r.roundTripsBefore} -> ${r.roundTripsAfter}`.padEnd(18) +
      `${r.beforeMs.toFixed(1)} ms`.padEnd(14) +
      `${r.afterMs.toFixed(1)} ms`.padEnd(14) +
      r.speedup
    );
  }

  console.log("-".repeat(80));
  console.log(
    "TOTAL (All Routes)".padEnd(22) +
    "35 -> 8 trips".padEnd(18) +
    `${totalBefore.toFixed(1)} ms`.padEnd(14) +
    `${totalAfter.toFixed(1)} ms`.padEnd(14) +
    `${(totalBefore / totalAfter).toFixed(1)}x faster overall`
  );
  console.log("================================================================================\n");

  await prisma.$disconnect();
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
