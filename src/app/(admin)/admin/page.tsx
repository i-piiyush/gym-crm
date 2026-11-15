import { getPortalSession } from "@/lib/session";
import { getDashboardInsights } from "@/services/insights.service";
import { getAdminDashboardStats } from "@/services/dashboard.service";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { FadeIn } from "@/components/motion/FadeIn";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;
  const gymName = session.gymName || "Gym";
  const timezone = session.timezone || "Asia/Kolkata";

  const [stats, insights] = await Promise.all([
    getAdminDashboardStats(gymId, {
      timezone,
      maxCustomers: session.maxCustomers || 100,
    }),
    getDashboardInsights(gymId, timezone),
  ]);

  // Compute Apple-style greeting based on local time
  const now = new Date();
  const localHourStr = formatInTimeZone(now, timezone, "H");
  const localHour = parseInt(localHourStr, 10);
  const greeting =
    localHour < 12
      ? "Good morning."
      : localHour < 17
        ? "Good afternoon."
        : "Good evening.";

  const dateStr = formatInTimeZone(now, timezone, "EEEE, MMMM d, yyyy");

  return (
    <FadeIn>
      <DashboardOverview
        stats={stats}
        insights={insights}
        gymName={gymName}
        greeting={greeting}
        dateStr={dateStr}
      />
    </FadeIn>
  );
}
