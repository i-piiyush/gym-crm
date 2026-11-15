"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/shared/PageLoader";
import { AttendanceChart, RevenueChart, MembershipChart } from "@/features/dashboard/components/OverviewCharts";
import { cn } from "@/lib/utils";
import type { ReportInsights } from "@/services/reports.service";
import type { ReportPeriod, ReportRange } from "@/lib/report-range";

export function ReportsView({ data, range }: { data: ReportInsights; range: ReportRange }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [period, setPeriod] = useState<ReportPeriod>(range.period);
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.end);
  const [error, setError] = useState(range.error || "");
  const navigate = (next: ReportPeriod) => {
    const params = new URLSearchParams({ period: next });
    if (next === "custom") { params.set("start", start); params.set("end", end); }
    startTransition(() => router.replace(`/admin/reports?${params}`, { scroll: false }));
  };
  const selectPeriod = (next: ReportPeriod) => {
    setPeriod(next); setError("");
    if (next !== "custom") navigate(next);
  };
  const totals = [
    ["Paid revenue", `₹${data.revenue.reduce((n, d) => n + d.value, 0).toLocaleString("en-IN")}`],
    ["New members", data.revenue.reduce((n, d) => n + d.members, 0).toLocaleString()],
    ["Check-ins", data.attendance.reduce((n, d) => n + d.value, 0).toLocaleString()],
  ];
  return <div className="space-y-6">
    <section aria-label="Report date filters" className="apple-card space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Report period" className="inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1">
          {(["week", "month", "year", "custom"] as const).map((value) => <Button key={value} variant="ghost" size="sm" aria-pressed={period === value} disabled={pending} onClick={() => selectPeriod(value)} className={cn("capitalize", period === value && "bg-card text-foreground shadow-sm hover:bg-card")}>
            {value === "custom" && <CalendarDays />} {value === "custom" ? "Custom dates" : value}
          </Button>)}
        </div>
        <p className="text-xs text-muted-foreground">{range.label}</p>
      </div>
      {period === "custom" && <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => {
        event.preventDefault();
        if (!start || !end || start > end || end > range.today) { setError("Choose valid dates, with the end date between the start date and today."); return; }
        setError(""); navigate("custom");
      }}>
        <div><label htmlFor="report-start" className="mb-1.5 block text-xs font-medium">From</label><Input id="report-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} max={end || range.today} required disabled={pending} /></div>
        <div><label htmlFor="report-end" className="mb-1.5 block text-xs font-medium">To</label><Input id="report-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} min={start} max={range.today} required disabled={pending} /></div>
        <Button type="submit" disabled={pending}>Apply dates</Button>
      </form>}
      {error && <p role="alert" className="text-xs text-status-danger-fg">{error}</p>}
      <p className="text-xs text-muted-foreground">Week shows the last 7 days, month the last 30 days, and year the last 12 months. Dates follow your gym’s timezone.</p>
    </section>
    {pending ? <PageLoader label="Updating reports…" /> : <>
      <div className="grid gap-4 sm:grid-cols-3">{totals.map(([label, value]) => <div key={label} className="apple-card p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p></div>)}</div>
      <div className="grid gap-5 lg:grid-cols-2">
        <RevenueChart data={data.revenue} periodLabel="Selected period" />
        <RevenueChart data={data.revenue} growth title="Member growth" periodLabel="Selected period" />
        <AttendanceChart data={data.attendance} periodLabel="Selected period" />
        <MembershipChart data={data.memberships} />
      </div>
    </>}
  </div>;
}
