import "server-only";
import prisma from "@/db/client";
import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";
import { reportDateBounds, type ReportRange } from "@/lib/report-range";
import type { DashboardInsights } from "./insights.service";

export interface ReportInsights {
  attendance: DashboardInsights["attendance"];
  revenue: DashboardInsights["revenue"];
  memberships: DashboardInsights["memberships"];
}

export async function getReportInsights(gymId: string, timezone: string, range: ReportRange): Promise<ReportInsights> {
  const { start, endExclusive } = reportDateBounds(range, timezone);
  const [attendance, payments, members, membershipCounts] = await Promise.all([
    prisma.attendance.groupBy({ by: ["date"], where: { gymId, date: { gte: range.start, lte: range.end } }, _count: { _all: true } }),
    prisma.$queryRaw<{ date: string; value: number }[]>`
      SELECT to_char(("paidAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timezone}, 'YYYY-MM-DD') AS date, SUM(amount)::float AS value
      FROM "Payment" WHERE "gymId" = ${gymId} AND status = 'PAID' AND "paidAt" >= ${start} AND "paidAt" < ${endExclusive} GROUP BY date`,
    prisma.$queryRaw<{ date: string; value: number }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timezone}, 'YYYY-MM-DD') AS date, COUNT(*)::int AS value
      FROM "User" WHERE "gymId" = ${gymId} AND role = 'CUSTOMER' AND "createdAt" >= ${start} AND "createdAt" < ${endExclusive} GROUP BY date`,
    prisma.customerProfile.groupBy({ by: ["status"], where: { user: { gymId } }, _count: { _all: true } }),
  ]);
  const days = differenceInCalendarDays(parseISO(range.end), parseISO(range.start)) + 1;
  const bucket = (date: string) => days <= 31 ? date : days <= 180
    ? format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), "yyyy-MM-dd")
    : date.slice(0, 7);
  const buckets = new Map<string, { date: string; label: string; attendance: number; value: number; members: number }>();
  for (let i = 0; i < days; i++) {
    const d = addDays(parseISO(range.start), i);
    const key = bucket(format(d, "yyyy-MM-dd"));
    if (!buckets.has(key)) buckets.set(key, {
      date: key,
      label: format(d, days <= 7 ? "EEE" : days <= 180 ? "d MMM" : "MMM yy"),
      attendance: 0, value: 0, members: 0,
    });
  }
  for (const row of attendance) { const b = buckets.get(bucket(row.date)); if (b) b.attendance += row._count._all; }
  for (const row of payments) { const b = buckets.get(bucket(row.date)); if (b) b.value += row.value; }
  for (const row of members) { const b = buckets.get(bucket(row.date)); if (b) b.members += row.value; }
  const counts = Object.fromEntries(membershipCounts.map((row) => [row.status, row._count._all]));
  return {
    attendance: [...buckets.values()].map((b) => ({ date: b.date, label: b.label, value: b.attendance })),
    revenue: [...buckets.values()].map((b) => ({ month: b.date, label: b.label, value: b.value, members: b.members })),
    memberships: { active: counts.ACTIVE || 0, trial: counts.TRIAL || 0, expired: counts.EXPIRED || 0, cancelled: counts.CANCELLED || 0 },
  };
}
