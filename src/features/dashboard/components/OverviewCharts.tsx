"use client";
import { useId, useState } from "react";
import type { DashboardInsights } from "@/services/insights.service";
import { cn } from "@/lib/utils";
export function AttendanceChart({
  data,
  title = "Attendance overview",
  periodLabel,
}: {
  data: DashboardInsights["attendance"];
  title?: string;
  periodLabel?: string;
}) {
  const [range, setRange] = useState(7);
  const days = periodLabel ? data : data.slice(-range);
  const max = Math.max(5, ...days.map((d) => d.value));
  const total = days.reduce((n, d) => n + d.value, 0);
  return (
    <section className="apple-card min-w-0 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-dim">
            {total.toLocaleString()} check-ins {periodLabel ? "over this period" : `in the last ${range} days`}
          </p>
        </div>
        {!periodLabel && <select
          aria-label="Attendance date range"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="max-w-28 rounded-lg border border-border bg-card px-2 text-xs"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>}
      </div>
      <div className="relative mt-7">
        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
          {[1, 0.75, 0.5, 0.25, 0].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-6 text-right text-[10px] text-dim/80">
                {Math.round(max * n)}
              </span>
              <span className="flex-1 border-t border-dashed border-border" />
            </div>
          ))}
        </div>
        <div
          className={cn(
            "relative ml-10 flex h-[180px] items-end pb-6",
            days.length <= 7 ? "gap-[7%]" : "gap-[1%]",
          )}
        >
          {days.map((d, i) => (
            <div
              key={d.date}
              className="group relative flex h-full min-w-0 flex-1 items-end"
            >
              <div
                tabIndex={0}
                aria-label={`${d.date}: ${d.value} check-ins`}
                className={cn(
                  "chart-bar w-full rounded-t-[5px] outline-none hover:bg-[#a4c0ab] focus-visible:ring-2 focus-visible:ring-dimgrey",
                  i === days.length - 1 ? "bg-[#718b75]" : "bg-honeydew",
                )}
                style={{ height: `${(d.value / max) * 100}%`, minHeight: 2 }}
              >
                <span className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-[10px] text-primary-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                  {d.value}
                </span>
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-dim">
                {i % Math.max(1, Math.ceil(days.length / 7)) === 0 ? (periodLabel || range === 7 ? d.label : d.date.slice(8)) : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
      {total === 0 && (
        <p className="mt-3 text-xs text-dim">
          Your attendance trend will appear as members check in.
        </p>
      )}
    </section>
  );
}
export function RevenueChart({
  data,
  title = "Revenue overview",
  growth = false,
  periodLabel = "Last 6 months",
}: {
  data: DashboardInsights["revenue"];
  title?: string;
  growth?: boolean;
  periodLabel?: string;
}) {
  const id = useId().replaceAll(":", "");
  const vals = data.map((d) => (growth ? d.members : d.value));
  const max = Math.max(1, ...vals);
  const x = (i: number) => vals.length <= 1 ? 200 : 20 + i * (360 / (vals.length - 1));
  const pts = vals
    .map((v, i) => `${x(i)},${150 - (v / max) * 125}`)
    .join(" ");
  const total = vals.reduce((n, v) => n + v, 0);
  return (
    <section className="apple-card min-w-0 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <span className="text-[11px] text-dim">{periodLabel}</span>
      </div>
      <p className="mt-1 text-xs text-dim">
        {growth
          ? `${total} new members`
          : `₹${total.toLocaleString("en-IN")} collected`}{" "}
        over this period
      </p>
      <svg
        className="mt-5 w-full"
        viewBox="0 0 400 180"
        role="img"
        aria-label={data
          .map((d, i) => `${d.label}: ${growth ? "" : "₹"}${vals[i]}`)
          .join(", ")}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#d0e1d4" stopOpacity=".55" />
            <stop offset="1" stopColor="#d0e1d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 65, 105, 150].map((y) => (
          <line
            key={y}
            x1="20"
            x2="380"
            y1={y}
            y2={y}
            stroke="hsl(var(--border))"
            strokeDasharray="4 4"
          />
        ))}
        <polygon points={`${x(0)},150 ${pts} ${x(Math.max(0, vals.length - 1))},150`} fill={`url(#${id})`} />
        <polyline
          points={pts}
          fill="none"
          stroke="#718b75"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {vals.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={150 - (v / max) * 125}
            r="3.5"
            fill="#718b75"
          >
            <title>
              {data[i]?.label}: {growth ? "" : "₹"}
              {v.toLocaleString("en-IN")}
            </title>
          </circle>
        ))}
        {data.map((d, i) => (
          <text
            key={d.month}
            x={x(i)}
            y="175"
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
            fontFamily="inherit"
          >
            {i % Math.max(1, Math.ceil(data.length / 7)) === 0 ? d.label : ""}
          </text>
        ))}
      </svg>
      {total === 0 && (
        <p className="mt-3 text-xs text-dim">
          {growth
            ? "New registrations will appear here."
            : "Record your first payment to start tracking revenue."}
        </p>
      )}
    </section>
  );
}
export function MembershipChart({
  data,
}: {
  data: DashboardInsights["memberships"];
}) {
  const total = data.active + data.trial + data.expired + data.cancelled;
  const activeEnd = total ? (data.active / total) * 100 : 0;
  const trialEnd = activeEnd + (total ? (data.trial / total) * 100 : 0);
  return (
    <section className="apple-card p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold">Membership overview</h2>
      <p className="mt-1 text-xs text-dim">A clear view of your community</p>
      <div className="my-6 flex items-center justify-center gap-7">
        <div
          className="flex size-32 shrink-0 items-center justify-center rounded-full"
          style={{
            background: total
              ? `conic-gradient(#d0e1d4 0% ${activeEnd}%, #e4be9e ${activeEnd}% ${trialEnd}%, #d9d2b6 ${trialEnd}% 100%)`
              : "#edeee8",
          }}
        >
          <div className="flex size-[98px] flex-col items-center justify-center rounded-full bg-card">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {total}
            </span>
            <span className="mt-1 text-[11px] text-dim">members</span>
          </div>
        </div>
        <div className="space-y-3 text-xs">
          {[
            ["Active", data.active, "bg-honeydew"],
            ["Trial", data.trial, "bg-desert"],
            ["Expired", data.expired, "bg-sand"],
            ["Cancelled", data.cancelled, "bg-sand"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="flex items-center gap-2.5">
              <span className={cn("size-1.5 rounded-full", color)} />
              <span className="w-14 text-dim">{label}</span>
              <span className="font-medium tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-border pt-3 text-[11px] text-dim">
        Membership status reflects current records.
      </p>
    </section>
  );
}
