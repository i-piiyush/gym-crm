"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { format } from "date-fns";
import {
  CalendarCheck as LuCalendarCheck,
  Flame as LuFlame,
  Search as LuSearch,
  QrCode as LuQrCode,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  date: string;
  checkInAt: Date;
  distanceMeters: unknown;
  accuracyMeters: unknown;
}

interface CustomerAttendanceViewProps {
  attendances: AttendanceRecord[];
  thisMonthCount: number;
  streak: number;
}

export function CustomerAttendanceView({
  attendances,
  thisMonthCount,
  streak,
}: CustomerAttendanceViewProps) {
  const [search, setSearch] = useState("");

  const filtered = attendances.filter((a) => {
    const q = search.toLowerCase();
    const formatted = format(
      new Date(a.checkInAt),
      "EEEE dd MMMM yyyy",
    ).toLowerCase();
    return formatted.includes(q) || a.date.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Gym Visits
            </span>
            <LuCalendarCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground">
            {attendances.length}
          </p>
          <span className="text-[11px] text-muted-foreground">
            All-time GPS verified check-ins
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              This Month
            </span>
            <LuCalendarCheck className="h-4 w-4 text-emerald-600 " />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-emerald-600 ">
            {thisMonthCount}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Sessions logged this calendar month
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Current Streak
            </span>
            <LuFlame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-amber-500">
            {streak} days
          </p>
          <span className="text-[11px] text-muted-foreground">
            Consecutive active workout days
          </span>
        </div>
      </div>

      {/* Filter and Check-in link */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendance by date or day..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <LuQrCode className="h-4 w-4" />
          <span>Check In Now</span>
        </Link>
      </div>

      {/* Attendance Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-sm">
            <TableHeader className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground ">
              <TableRow>
                <TableHead className="px-6 py-4">Date</TableHead>
                <TableHead className="px-6 py-4">Check-in Time</TableHead>
                <TableHead className="px-6 py-4">Geofence Distance</TableHead>
                <TableHead className="px-6 py-4">GPS Accuracy</TableHead>
                <TableHead className="px-6 py-4 text-right">
                  Verification
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground text-xs"
                  >
                    {search
                      ? "No check-ins match your search filter."
                      : "No attendance records found yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow
                    key={a.id}
                    className="hover:bg-muted/30  transition-colors"
                  >
                    <TableCell className="px-6 py-4 font-semibold text-foreground text-xs">
                      {format(new Date(a.checkInAt), "EEEE, dd MMMM yyyy")}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs font-mono text-foreground">
                      {format(new Date(a.checkInAt), "hh:mm:ss a")}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {Number(a.distanceMeters).toFixed(1)}m from center
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      ±{Number(a.accuracyMeters).toFixed(1)}m
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-status-active-bg px-2.5 py-0.5 text-[11px] font-semibold text-status-active-fg border border-emerald-200   ">
                        Verified
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
