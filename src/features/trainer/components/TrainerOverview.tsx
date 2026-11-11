"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  LuUsers,
  LuCalendarCheck,
  LuBanknote,
  LuQrCode,
  LuCircleCheck,
  LuClock,
  LuArrowRight,
} from "react-icons/lu";

interface TrainerOverviewProps {
  data: {
    trainerProfile: {
      userId: string;
      monthlySalary: unknown;
      salaryDueDay: number;
      joinedAt: Date;
      user: {
        name: string;
        email: string;
      };
    } | null;
    totalAssignedClients: number;
    clientsCheckedInToday: number;
    checkedInToday: boolean;
    recentAttendances: Array<{
      id: string;
      date: string;
      checkInAt: Date;
      distanceMeters: unknown;
    }>;
    currentSalary: {
      amount: number;
      status: string;
      paidAt: Date | null;
    } | null;
  };
  todayDateStr: string;
}

export function TrainerOverview({ data, todayDateStr }: TrainerOverviewProps) {
  const {
    trainerProfile,
    totalAssignedClients,
    clientsCheckedInToday,
    checkedInToday,
    recentAttendances,
    currentSalary,
  } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Trainer Coaching Staff
          </span>
          <h2 className="text-xl font-bold text-foreground mt-1">
            Hello, Coach {trainerProfile?.user.name.split(" ")[0]}!
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your clients&apos; workouts, log your personal attendance, and view salary statements.
          </p>
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02] shrink-0"
        >
          <LuQrCode className="h-5 w-5" />
          <span>{checkedInToday ? "Checked In Today" : "Scan to Check In"}</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assigned Clients */}
        <Link
          href="/trainer/customers"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Assigned Clients
            </span>
            <LuUsers className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">
            {totalAssignedClients}
          </p>
          <span className="text-[11px] text-muted-foreground">Members under your coaching</span>
        </Link>

        {/* Clients Checked In Today */}
        <Link
          href="/trainer/customers"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Clients Present Today
            </span>
            <LuCalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {clientsCheckedInToday}{" "}
            <span className="text-xs font-normal text-muted-foreground">/ {totalAssignedClients}</span>
          </p>
          <span className="text-[11px] text-muted-foreground">Attended gym today</span>
        </Link>

        {/* Personal Attendance Status */}
        <Link
          href="/trainer/attendance"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              My Check-in ({todayDateStr})
            </span>
            {checkedInToday ? (
              <LuCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <LuClock className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="mt-2 text-lg font-bold text-foreground">
            {checkedInToday ? "Checked In" : "Not Checked In"}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {checkedInToday ? "Logged at gym facility" : "Scan reception QR"}
          </span>
        </Link>

        {/* Monthly Salary Compensation */}
        <Link
          href="/trainer/salary"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Monthly Salary
            </span>
            <LuBanknote className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-foreground">
            ₹{currentSalary ? currentSalary.amount.toLocaleString("en-IN") : Number(trainerProfile?.monthlySalary || 0).toLocaleString("en-IN")}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Due Day {trainerProfile?.salaryDueDay || 1}</span>
            <StatusBadge status={currentSalary?.status || "PENDING"} label={currentSalary?.status || "PENDING"} />
          </div>
        </Link>
      </div>

      {/* Recent Personal Attendance Log */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground">My Recent Check-Ins</h3>
          <Link
            href="/trainer/attendance"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View attendance log</span>
            <LuArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border">
          {recentAttendances.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No check-ins logged yet. Scan the reception QR code upon arrival.
            </p>
          ) : (
            recentAttendances.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <LuCalendarCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {format(new Date(a.checkInAt), "EEEE, dd MMMM yyyy")}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Checked in at {format(new Date(a.checkInAt), "hh:mm:ss a")}
                    </div>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {Number(a.distanceMeters).toFixed(0)}m from center
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

