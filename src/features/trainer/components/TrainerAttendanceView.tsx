"use client";

import { format } from "date-fns";
import { LuCalendarCheck, LuClock, LuSearch, LuQrCode } from "react-icons/lu";
import { useState } from "react";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  date: string;
  checkInAt: Date;
  distanceMeters: unknown;
  accuracyMeters: unknown;
}

interface TrainerAttendanceViewProps {
  attendances: AttendanceRecord[];
}

export function TrainerAttendanceView({ attendances }: TrainerAttendanceViewProps) {
  const [search, setSearch] = useState("");

  const filtered = attendances.filter((a) => {
    const q = search.toLowerCase();
    const formatted = format(new Date(a.checkInAt), "EEEE dd MMMM yyyy").toLowerCase();
    return formatted.includes(q) || a.date.includes(q);
  });

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthCount = attendances.filter((a) => a.date.startsWith(currentMonthPrefix)).length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Recorded Shifts
            </span>
            <LuCalendarCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">
            {attendances.length}
          </p>
          <span className="text-[11px] text-muted-foreground">All-time GPS verified staff check-ins</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Shifts This Month
            </span>
            <LuClock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {thisMonthCount}
          </p>
          <span className="text-[11px] text-muted-foreground">Recorded this calendar month</span>
        </div>
      </div>

      {/* Filter and Check-in CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shift records by date..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <LuQrCode className="h-4 w-4" />
          <span>Log Shift Check-In</span>
        </Link>
      </div>

      {/* Attendance Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in Time</th>
                <th className="px-6 py-4">Facility Distance</th>
                <th className="px-6 py-4">GPS Accuracy</th>
                <th className="px-6 py-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    {search
                      ? "No records match your search."
                      : "No check-in logs found yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-foreground text-xs">
                      {format(new Date(a.checkInAt), "EEEE, dd MMMM yyyy")}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-foreground">
                      {format(new Date(a.checkInAt), "hh:mm:ss a")}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {Number(a.distanceMeters).toFixed(1)}m from center
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      ±{Number(a.accuracyMeters).toFixed(1)}m
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

