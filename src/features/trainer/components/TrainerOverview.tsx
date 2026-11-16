"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Users,
  CalendarCheck,
  Banknote,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

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
      deductionAmount: number;
      holidayDays: number;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <span className="text-xs font-medium text-dim tracking-wide">
            Coaching Staff Portal
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-foreground mt-1">
            Hello, Coach {trainerProfile?.user.name.split(" ")[0]}
          </h2>
          <p className="text-xs text-dim mt-0.5">
            Track client attendance, record personal check-in, and view
            compensation statements.
          </p>
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-sm shrink-0"
        >
          <QrCode className="h-4 w-4" />
          <span>{checkedInToday ? "Checked In Today" : "Check In Now"}</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Assigned Clients */}
        <Link
          href="/trainer/customers"
          className="group rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              Assigned Clients
            </span>
            <Users className="h-4 w-4 text-dim" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums tracking-tight">
            {totalAssignedClients}
          </p>
          <span className="text-xs text-dim mt-1 block">Members in roster</span>
        </Link>

        {/* Clients Checked In Today */}
        <Link
          href="/trainer/customers"
          className="group rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              Clients Present
            </span>
            <CalendarCheck className="h-4 w-4 text-dim" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums tracking-tight">
            {clientsCheckedInToday}{" "}
            <span className="text-xs font-normal text-dim">
              / {totalAssignedClients}
            </span>
          </p>
          <span className="text-xs text-dim mt-1 block">
            Attended facility today
          </span>
        </Link>

        {/* Personal Attendance Status */}
        <Link
          href="/trainer/attendance"
          className="group rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              My Status ({todayDateStr})
            </span>
            {checkedInToday ? (
              <CheckCircle2 className="h-4 w-4 text-status-active-fg" />
            ) : (
              <Clock className="h-4 w-4 text-desert" />
            )}
          </div>
          <p className="mt-2 text-lg font-semibold text-foreground tracking-tight">
            {checkedInToday ? "Checked In" : "Not Checked In"}
          </p>
          <span className="text-xs text-dim mt-1 block">
            {checkedInToday ? "Verified at gym facility" : "Scan reception QR"}
          </span>
        </Link>

        {/* Monthly Salary Compensation */}
        <Link
          href="/trainer/salary"
          className="group rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              Monthly Payable Salary
            </span>
            <Banknote className="h-4 w-4 text-dim" />
          </div>
          <p className="mt-2 text-xl font-semibold font-mono text-foreground tabular-nums tracking-tight">
            ₹
            {currentSalary
              ? currentSalary.amount.toLocaleString("en-IN")
              : Number(trainerProfile?.monthlySalary || 0).toLocaleString(
                  "en-IN",
                )}
          </p>
          {currentSalary && <p className="mt-1 text-xs text-dim">₹{currentSalary.deductionAmount.toLocaleString("en-IN")} deduction · {currentSalary.holidayDays} missed day(s)</p>}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-dim">
              Day {trainerProfile?.salaryDueDay || 1}
            </span>
            <StatusBadge
              status={currentSalary?.status || "PENDING"}
              label={currentSalary?.status || "PENDING"}
            />
          </div>
        </Link>
      </div>

      {/* Recent Personal Attendance Log */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Check-In History
          </h3>
          <Link
            href="/trainer/attendance"
            className="inline-flex items-center gap-1 text-xs font-medium text-dim hover:text-foreground transition-colors"
          >
            <span>View log</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border/50">
          {recentAttendances.length === 0 ? (
            <p className="py-8 text-center text-xs text-dim">
              No check-ins logged yet. Scan the reception QR code upon arrival.
            </p>
          ) : (
            recentAttendances.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-3.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-honeydew text-status-active-fg">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {format(new Date(a.checkInAt), "EEEE, dd MMMM yyyy")}
                    </div>
                    <div className="text-[11px] text-dim">
                      Checked in at{" "}
                      {format(new Date(a.checkInAt), "hh:mm:ss a")}
                    </div>
                  </div>
                </div>

                <span className="rounded-full border border-border/70 bg-muted px-2.5 py-0.5 text-[11px] font-mono text-dim tabular-nums">
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
