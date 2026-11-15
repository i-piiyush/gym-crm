import "server-only";
import prisma from "@/db/client";
import { addDays, subMonths, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
export interface DashboardInsights {
  attendance: { label: string; date: string; value: number }[];
  revenue: { label: string; month: string; value: number; members: number }[];
  memberships: {
    active: number;
    trial: number;
    expired: number;
    cancelled: number;
  };
  pendingPayments: { amount: number; count: number };
  expirations: { id: string; name: string; plan: string; date: string }[];
  activity: {
    id: string;
    type: "payment" | "member" | "attendance";
    name: string;
    detail: string;
    time: string;
  }[];
  revenueChange: number | null;
}
export async function getDashboardInsights(
  gymId: string,
  timezone: string,
): Promise<DashboardInsights> {
  const now = new Date();
  const local = toZonedTime(now, timezone);
  const startDate = format(addDays(local, -29), "yyyy-MM-dd");
  const monthStart = fromZonedTime(
    new Date(local.getFullYear(), local.getMonth() - 5, 1),
    timezone,
  );
  const rows = await prisma.$queryRaw<
    {
      attendance: { date: string; value: number }[];
      revenue: { month: string; value: number }[];
      growth: { month: string; value: number }[];
      memberships: { status: string; value: number }[];
      pending: { amount: number; count: number };
      expirations: DashboardInsights["expirations"];
      activity: DashboardInsights["activity"];
    }[]
  >`
    SELECT
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT date, COUNT(*)::int AS value FROM "Attendance" WHERE "gymId" = ${gymId} AND date >= ${startDate} GROUP BY date) t) AS attendance,
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT to_char("paidAt" AT TIME ZONE ${timezone}, 'YYYY-MM') AS month, SUM(amount)::float AS value FROM "Payment" WHERE "gymId" = ${gymId} AND status = 'PAID' AND "paidAt" >= ${monthStart} GROUP BY month) t) AS revenue,
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT to_char("createdAt" AT TIME ZONE ${timezone}, 'YYYY-MM') AS month, COUNT(*)::int AS value FROM "User" WHERE "gymId" = ${gymId} AND role = 'CUSTOMER' AND "createdAt" >= ${monthStart} GROUP BY month) t) AS growth,
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT cp.status, COUNT(*)::int AS value FROM "CustomerProfile" cp JOIN "User" u ON u.id = cp."userId" WHERE u."gymId" = ${gymId} GROUP BY cp.status) t) AS memberships,
      (SELECT json_build_object('amount', COALESCE(SUM(amount),0)::float, 'count', COUNT(*)::int) FROM "Payment" WHERE "gymId" = ${gymId} AND status = 'PENDING') AS pending,
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT u.id, u.name, COALESCE(p.name, 'Membership') AS plan, cp."membershipEnd"::text AS date FROM "CustomerProfile" cp JOIN "User" u ON u.id = cp."userId" LEFT JOIN "MembershipPlan" p ON p.id = cp."planId" WHERE u."gymId" = ${gymId} AND cp.status = 'ACTIVE' AND cp."membershipEnd" >= ${now} AND cp."membershipEnd" <= ${addDays(now, 7)} ORDER BY cp."membershipEnd" LIMIT 5) t) AS expirations,
      (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT * FROM (
          (SELECT p.id, 'payment' AS type, u.name, '₹' || p.amount::text || ' received' AS detail, p."paidAt" AS time FROM "Payment" p JOIN "User" u ON u.id = p."customerId" WHERE p."gymId" = ${gymId} AND p.status = 'PAID' ORDER BY p."paidAt" DESC LIMIT 5)
          UNION ALL
          (SELECT id, 'member' AS type, name, 'Joined your gym' AS detail, "createdAt" AS time FROM "User" WHERE "gymId" = ${gymId} AND role = 'CUSTOMER' ORDER BY "createdAt" DESC LIMIT 5)
          UNION ALL
          (SELECT a.id, 'attendance' AS type, u.name, 'Checked in' AS detail, a."checkInAt" AS time FROM "Attendance" a JOIN "User" u ON u.id = a."userId" WHERE a."gymId" = ${gymId} ORDER BY a."checkInAt" DESC LIMIT 5)
        ) recent ORDER BY time DESC LIMIT 5
      ) t) AS activity
  `;
  const data = rows[0];
  if (!data) throw new Error("Could not load gym insights.");
  const attendance = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(local, i - 29);
    const date = format(d, "yyyy-MM-dd");
    return {
      date,
      label: format(d, "EEE"),
      value: data.attendance.find((a) => a.date === date)?.value || 0,
    };
  });
  const revenue = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(local, 5 - i);
    const month = format(d, "yyyy-MM");
    return {
      month,
      label: format(d, "MMM"),
      value: data.revenue.find((r) => r.month === month)?.value || 0,
      members: data.growth.find((g) => g.month === month)?.value || 0,
    };
  });
  const counts = Object.fromEntries(
    data.memberships.map((m) => [m.status, m.value]),
  );
  const previous = revenue[4]!.value;
  const current = revenue[5]!.value;
  return {
    attendance,
    revenue,
    memberships: {
      active: counts.ACTIVE || 0,
      trial: counts.TRIAL || 0,
      expired: counts.EXPIRED || 0,
      cancelled: counts.CANCELLED || 0,
    },
    pendingPayments: data.pending,
    expirations: data.expirations,
    activity: data.activity,
    revenueChange:
      previous > 0
        ? Math.round(((current - previous) / previous) * 1000) / 10
        : null,
  };
}
