"use client";

import { DashboardStats } from "@/services/dashboard.service";
import { StatCard } from "@/components/shared/StatCard";
import Link from "next/link";
import {
  Users,
  CalendarCheck2,
  CreditCard,
  AlertTriangle,
  QrCode,
  UserPlus,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface DashboardOverviewProps {
  stats: DashboardStats;
  gymName: string;
  greeting?: string;
  dateStr?: string;
}

export function DashboardOverview({
  stats,
  gymName,
  greeting = "Good morning.",
  dateStr,
}: DashboardOverviewProps) {
  const hasAlerts =
    stats.needsAttention.trialsEndingSoon.length > 0 ||
    stats.needsAttention.overdueMembers.length > 0 ||
    stats.needsAttention.pendingSalaries.count > 0;

  return (
    <div className="space-y-8 pb-10">
      {/* -------------------------------------------------------------------- */}
      {/* 1. APPLE-STYLE DASHBOARD GREETING */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col justify-between gap-4 border-b border-[rgba(40,40,40,0.06)] pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#242424] sm:text-4xl">
            {greeting}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#71697a]">
            Here’s what’s happening at <span className="font-medium text-[#242424]">{gymName}</span> today
            {dateStr && <span> • {dateStr}</span>}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/attendance/qr"
            className="apple-button-press inline-flex items-center gap-2 rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-4 py-2 text-xs font-medium text-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-stone-50"
          >
            <QrCode className="h-3.5 w-3.5 text-[#71697a]" />
            <span>Launch QR Station</span>
          </Link>

          <Link
            href="/admin/people"
            className="apple-button-press inline-flex items-center gap-2 rounded-full bg-[#242424] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. THE 4 CORE METRICS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Active Members */}
        <StatCard
          title="Active Members"
          value={stats.customers.total}
          icon={Users}
          progress={{
            value: stats.customers.total,
            max: stats.customers.max,
          }}
          badge={{
            text:
              stats.customers.total >= stats.customers.max
                ? "At Capacity"
                : `${stats.customers.max - stats.customers.total} spots left`,
            variant:
              stats.customers.total >= stats.customers.max
                ? "destructive"
                : stats.customers.total >= stats.customers.max * 0.8
                ? "warning"
                : "success",
          }}
        />

        {/* Metric 2: Today's Attendance */}
        <StatCard
          title="Today’s Attendance"
          value={stats.presentTodayCount}
          icon={CalendarCheck2}
          description="Verified GPS check-ins today"
          badge={{ text: "Live", variant: "success" }}
        />

        {/* Metric 3: Monthly Revenue */}
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          prefix="₹"
          formatValue={(n) => n.toLocaleString("en-IN")}
          icon={CreditCard}
          description="Total paid receipts this month"
          badge={{ text: "This Month", variant: "default" }}
        />

        {/* Metric 4: Attention Needed */}
        <StatCard
          title="Attention Needed"
          value={stats.feesOverdueCount + stats.needsAttention.trialsEndingSoon.length}
          icon={AlertTriangle}
          description="Expired passes and ending trials"
          badge={{
            text:
              stats.feesOverdueCount > 0 || stats.needsAttention.trialsEndingSoon.length > 0
                ? "Action Required"
                : "All Good",
            variant:
              stats.feesOverdueCount > 0 || stats.needsAttention.trialsEndingSoon.length > 0
                ? "warning"
                : "success",
          }}
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. QUICK RECEPTION ACTIONS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/people"
          className="apple-card flex items-center gap-3 p-3.5 transition-all hover:bg-stone-50/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f2f6d0] text-[#242424]">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[#242424]">Add Member</h2>
            <p className="text-[11px] text-[#71697a]">Invite customer or trainer</p>
          </div>
        </Link>

        <Link
          href="/admin/payments"
          className="apple-card flex items-center gap-3 p-3.5 transition-all hover:bg-stone-50/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d0e1d4] text-[#242424]">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[#242424]">Record Payment</h2>
            <p className="text-[11px] text-[#71697a]">Generate sequential receipt</p>
          </div>
        </Link>

        <Link
          href="/admin/attendance/qr"
          className="apple-card flex items-center gap-3 p-3.5 transition-all hover:bg-stone-50/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d9d2b6] text-[#242424]">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[#242424]">Reception QR</h2>
            <p className="text-[11px] text-[#71697a]">15s dynamic scanner</p>
          </div>
        </Link>

        <Link
          href="/admin/salaries"
          className="apple-card flex items-center gap-3 p-3.5 transition-all hover:bg-stone-50/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e4be9e] text-[#242424]">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[#242424]">Trainer Payroll</h2>
            <p className="text-[11px] text-[#71697a]">Monthly salary ledger</p>
          </div>
        </Link>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. DASHBOARD PANELS: ATTENDANCE OVERVIEW & UPCOMING EXPIRATIONS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Attention Items & Upcoming Expirations */}
        <div className="lg:col-span-2 apple-card p-6">
          <div className="flex items-center justify-between border-b border-[rgba(40,40,40,0.06)] pb-4">
            <div>
              <h2 className="text-base font-semibold text-[#242424]">Needs Attention</h2>
              <p className="text-xs text-[#71697a]">
                Expiring memberships, trial visitors, and pending payroll
              </p>
            </div>
            {hasAlerts && (
              <span className="rounded-full bg-[#e4be9e]/50 px-2.5 py-0.5 text-[11px] font-semibold text-[#8c5222]">
                Action Required
              </span>
            )}
          </div>

          {!hasAlerts ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d0e1d4]/60 text-emerald-900 mb-3">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#242424]">All Caught Up</h4>
              <p className="mt-1 text-xs text-[#71697a] max-w-sm">
                No trial expirations, overdue memberships, or pending payroll require action.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {/* Trials Ending Soon */}
              {stats.needsAttention.trialsEndingSoon.length > 0 && (
                <div className="rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#242424]">
                      Trials Ending Soon ({stats.needsAttention.trialsEndingSoon.length})
                    </span>
                    <Link
                      href="/admin/trials"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#71697a] hover:text-[#242424]"
                    >
                      <span>View all</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stats.needsAttention.trialsEndingSoon.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-lg bg-white p-3 border border-[rgba(40,40,40,0.04)] shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#242424]">{t.name}</p>
                          <p className="text-[11px] text-[#71697a]">{t.email}</p>
                        </div>
                        <span className="rounded-full bg-[#e4be9e]/50 px-2 py-0.5 text-[10px] font-semibold text-[#8c5222]">
                          {t.daysLeft <= 0 ? "Ends today" : `${t.daysLeft}d left`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Memberships */}
              {stats.needsAttention.overdueMembers.length > 0 && (
                <div className="rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#242424]">
                      Expired Passes ({stats.needsAttention.overdueMembers.length})
                    </span>
                    <Link
                      href="/admin/subscriptions"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#71697a] hover:text-[#242424]"
                    >
                      <span>View list</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stats.needsAttention.overdueMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg bg-white p-3 border border-[rgba(40,40,40,0.04)] shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#242424]">{m.name}</p>
                          <p className="text-[11px] text-[#71697a]">{m.email}</p>
                        </div>
                        <Link
                          href="/admin/payments"
                          className="apple-button-press rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100"
                        >
                          Renew
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Salaries */}
              {stats.needsAttention.pendingSalaries.count > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-[rgba(40,40,40,0.06)] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-[#242424]">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#242424]">
                        Payroll Pending ({stats.needsAttention.pendingSalaries.count} trainers)
                      </p>
                      <p className="text-[11px] text-[#71697a] tabular-nums font-mono">
                        ₹{stats.needsAttention.pendingSalaries.totalAmount.toLocaleString("en-IN")}{" "}
                        due this month
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/salaries"
                    className="apple-button-press inline-flex items-center gap-1 rounded-full border border-[rgba(40,40,40,0.08)] bg-stone-50 px-3 py-1.5 text-xs font-medium text-[#242424] hover:bg-stone-100"
                  >
                    <span>Disburse</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Facility Capacity & Operations Status */}
        <div className="space-y-6">
          {/* Facility Status Card */}
          <div className="apple-card p-6">
            <h2 className="text-sm font-semibold text-[#242424]">Facility Status</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#71697a]">Active Trainers</span>
                <span className="font-semibold text-[#242424]">{stats.trainersCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#71697a]">Expiring in 7 Days</span>
                <span className="font-semibold text-[#242424]">{stats.expiringIn7DaysCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#71697a]">Capacity Limit</span>
                <span className="font-semibold text-[#242424]">{stats.customers.max} members</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#71697a]">Geofence Radius</span>
                <span className="font-semibold text-emerald-800 bg-[#d0e1d4]/40 px-2 py-0.5 rounded-full text-[11px]">
                  Locked & Active
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-[rgba(40,40,40,0.06)] pt-4">
              <Link
                href="/admin/attendance"
                className="flex items-center justify-between text-xs font-medium text-[#242424] hover:underline"
              >
                <span>View Attendance Logs</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#71697a]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
