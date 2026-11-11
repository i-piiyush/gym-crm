"use client";

import { DashboardStats } from "@/services/dashboard.service";
import { StatCard } from "@/components/shared/StatCard";
import Link from "next/link";
import {
  LuUsers,
  LuDumbbell,
  LuCalendarCheck,
  LuCreditCard,
  LuTriangleAlert,
  LuClock,
  LuArrowRight,
  LuQrCode,
  LuUserPlus,
  LuReceipt,
  LuCircleCheck,
} from "react-icons/lu";

interface DashboardOverviewProps {
  stats: DashboardStats;
  gymName: string;
}

export function DashboardOverview({ stats, gymName }: DashboardOverviewProps) {
  const hasAlerts =
    stats.needsAttention.trialsEndingSoon.length > 0 ||
    stats.needsAttention.overdueMembers.length > 0 ||
    stats.needsAttention.pendingSalaries.count > 0;

  return (
    <div className="space-y-8">
      {/* 6 Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Customer Capacity */}
        <StatCard
          title="Customer Capacity"
          value={stats.customers.total}
          icon={LuUsers}
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

        {/* 2. Trainers */}
        <StatCard
          title="Active Trainers"
          value={stats.trainersCount}
          icon={LuDumbbell}
          description="Coaching staff on active roster"
        />

        {/* 3. Present Today */}
        <StatCard
          title="Checked-In Today"
          value={stats.presentTodayCount}
          icon={LuCalendarCheck}
          description="Live attendance recorded today"
          badge={{ text: "Live", variant: "success" }}
        />

        {/* 4. Monthly Revenue */}
        <StatCard
          title="Revenue This Month"
          value={stats.monthlyRevenue}
          prefix="₹"
          formatValue={(n) => n.toLocaleString("en-IN")}
          icon={LuCreditCard}
          description="Total paid receipts this calendar month"
        />

        {/* 5. Fees Overdue / Expired */}
        <StatCard
          title="Expired / Overdue"
          value={stats.feesOverdueCount}
          icon={LuTriangleAlert}
          description="Members with expired passes"
          badge={{
            text: stats.feesOverdueCount > 0 ? "Action Required" : "All Good",
            variant: stats.feesOverdueCount > 0 ? "destructive" : "success",
          }}
        />

        {/* 6. Expiring in 7 Days */}
        <StatCard
          title="Expiring In 7 Days"
          value={stats.expiringIn7DaysCount}
          icon={LuClock}
          description="Subscriptions due for renewal"
          badge={{
            text: stats.expiringIn7DaysCount > 0 ? "Upcoming" : "None",
            variant: stats.expiringIn7DaysCount > 0 ? "warning" : "default",
          }}
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Link
          href="/admin/people"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LuUserPlus className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Add Person</h4>
            <p className="text-[11px] text-muted-foreground">Invite customer/trainer</p>
          </div>
        </Link>

        <Link
          href="/admin/payments"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <LuReceipt className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Record Payment</h4>
            <p className="text-[11px] text-muted-foreground">Issue GST receipt</p>
          </div>
        </Link>

        <Link
          href="/admin/attendance/qr"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <LuQrCode className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">QR Station</h4>
            <p className="text-[11px] text-muted-foreground">15s rotating scanner</p>
          </div>
        </Link>

        <Link
          href="/admin/attendance"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <LuCalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Live Feed</h4>
            <p className="text-[11px] text-muted-foreground">Real-time attendance</p>
          </div>
        </Link>
      </div>

      {/* Needs Attention Panel */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <LuTriangleAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Needs Attention</h3>
              <p className="text-xs text-muted-foreground">
                Time-sensitive member renewals, trial expiries, and payroll items.
              </p>
            </div>
          </div>
        </div>

        {!hasAlerts ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3">
              <LuCircleCheck className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">All Clear!</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              No pending trial expirations, overdue memberships, or unhandled payroll records
              require immediate attention for {gymName}.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Trials Ending Soon */}
            {stats.needsAttention.trialsEndingSoon.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Trials Ending Soon ({stats.needsAttention.trialsEndingSoon.length})
                    </h4>
                  </div>
                  <Link
                    href="/admin/trials"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline dark:text-amber-300"
                  >
                    <span>View all trials</span>
                    <LuArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stats.needsAttention.trialsEndingSoon.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-card p-2.5 border border-border text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground">{t.email}</div>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {t.daysLeft <= 0 ? "Ends today" : `${t.daysLeft}d left`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Memberships */}
            {stats.needsAttention.overdueMembers.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Expired Memberships ({stats.needsAttention.overdueMembers.length})
                    </h4>
                  </div>
                  <Link
                    href="/admin/subscriptions"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 hover:underline dark:text-rose-300"
                  >
                    <span>View expired list</span>
                    <LuArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stats.needsAttention.overdueMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg bg-card p-2.5 border border-border text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{m.name}</div>
                        <div className="text-[11px] text-muted-foreground">{m.email}</div>
                      </div>
                      <Link
                        href="/admin/payments"
                        className="rounded-lg bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 transition-colors"
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
              <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50/80 p-4 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <LuCreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Trainer Payroll Pending ({stats.needsAttention.pendingSalaries.count}{" "}
                      trainers)
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      ₹{stats.needsAttention.pendingSalaries.totalAmount.toLocaleString("en-IN")}{" "}
                      due this month
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/salaries"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <span>Disburse</span>
                  <LuArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

