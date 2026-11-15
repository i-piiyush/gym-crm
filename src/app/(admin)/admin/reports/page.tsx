import { getPortalSession } from "@/lib/session";
import { getReportInsights } from "@/services/reports.service";
import { resolveReportRange } from "@/lib/report-range";
import { ReportsView } from "@/features/reports/components/ReportsView";
import { PageHeader } from "@/components/layout/PageHeader";
export const dynamic = "force-dynamic";
export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getPortalSession("ADMIN");
  const timezone = session.timezone || "Asia/Kolkata";
  const range = resolveReportRange(await searchParams, timezone);
  const insights = await getReportInsights(session.gymId!, timezone, range);
  return (
    <div className="space-y-7">
      <PageHeader
        title="Reports"
        description="A clearer picture of your gym, built from your real records."
      />
      <ReportsView key={`${range.period}-${range.start}-${range.end}-${range.error || ""}`} data={insights} range={range} />
      <p className="text-xs leading-relaxed text-dim">
        Revenue includes paid transactions. Growth counts new registrations.
        Attendance includes member and staff check-ins. Membership status is a
        current snapshot; historical retention is not yet tracked.
      </p>
    </div>
  );
}
