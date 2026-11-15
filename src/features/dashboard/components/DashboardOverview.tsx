"use client";
import type { DashboardStats } from "@/services/dashboard.service";
import type { DashboardInsights } from "@/services/insights.service";
import Link from "next/link";
import {
  Users,
  CalendarCheck2,
  CreditCard,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Check,
  UserRoundPlus,
  Receipt,
  QrCode,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AttendanceChart,
  RevenueChart,
  MembershipChart,
} from "./OverviewCharts";
export function DashboardOverview({
  stats,
  insights,
  gymName,
  greeting = "Good morning.",
  dateStr,
}: {
  stats: DashboardStats;
  insights: DashboardInsights;
  gymName: string;
  greeting?: string;
  dateStr?: string;
}) {
  const change = insights.revenueChange;
  const metrics = [
    {
      title: "Active members",
      value: insights.memberships.active.toLocaleString(),
      icon: Users,
      detail: `${stats.customers.total} of ${stats.customers.max} member capacity`,
      positive: false,
    },
    {
      title: "Today’s attendance",
      value: stats.presentTodayCount.toLocaleString(),
      icon: CalendarCheck2,
      detail: "Verified check-ins today",
      positive: true,
    },
    {
      title: "Monthly revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
      icon: CreditCard,
      detail:
        change === null
          ? "Collected this month"
          : `${change >= 0 ? "+" : ""}${change}% vs. last month`,
      positive: change !== null && change >= 0,
    },
    {
      title: "Pending payments",
      value: `₹${insights.pendingPayments.amount.toLocaleString("en-IN")}`,
      icon: Clock,
      detail: `${insights.pendingPayments.count} pending ${insights.pendingPayments.count === 1 ? "payment" : "payments"}`,
      positive: false,
    },
  ];
  return (
    <div className="space-y-7 pb-5">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs text-dim">{dateStr}</p>
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-1.1px] sm:text-[36px]">
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-dim">
            Here’s what’s happening at{" "}
            <span className="font-medium text-foreground">{gymName}</span>{" "}
            today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/attendance/qr">
              <QrCode />
              Check-in station
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/people?add=true">
              <Plus />
              Add member
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 rounded-xl border border-border bg-card px-5 py-6 sm:px-7 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.title}
            className={i > 0 ? "xl:border-l xl:border-border xl:pl-6" : ""}
          >
            <div className="flex items-center justify-between gap-2 text-xs text-dim">
              <span>{m.title}</span>
              <m.icon className="size-4" strokeWidth={1.6} />
            </div>
            <p className="mt-3 text-[28px] font-semibold tracking-[-.8px] tabular-nums sm:text-[30px]">
              {m.value}
            </p>
            <p
              className={`mt-2 flex items-center gap-1 text-[11px] ${m.positive ? "text-status-active-fg" : "text-dim"}`}
            >
              {m.positive && <ArrowUpRight className="size-3" />}
              {m.detail}
            </p>
          </div>
        ))}
      </div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.65fr_1fr]">
        <AttendanceChart data={insights.attendance} />
        <MembershipChart data={insights.memberships} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="apple-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-[15px] font-semibold">Upcoming renewals</h2>
              <p className="mt-1 text-xs text-dim">
                {stats.expiringIn7DaysCount} memberships expire in the next 7
                days
              </p>
            </div>
            <Link
              href="/admin/subscriptions"
              className="flex shrink-0 items-center gap-1 text-xs text-dim hover:text-foreground"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {insights.expirations.length ? (
            insights.expirations.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 border-t border-border/70 px-5 py-4 sm:px-6"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ${i % 2 ? "bg-desert/35" : "bg-honeydew/50"}`}
                >
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/people/${m.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {m.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-dim">{m.plan}</p>
                </div>
                <span className="hidden text-xs text-dim sm:block">
                  {new Date(m.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/subscriptions?renew=${m.id}`}>Renew</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center border-t border-border py-12">
              <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-honeydew/50">
                <Check className="size-4 text-status-active-fg" />
              </span>
              <p className="text-sm font-medium">You’re all caught up.</p>
              <p className="mt-1 text-xs text-dim">
                No memberships are expiring this week.
              </p>
            </div>
          )}
        </section>
        <section className="apple-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold">Recent activity</h2>
          <p className="mt-1 text-xs text-dim">The latest from your gym</p>
          <div className="mt-5 space-y-5">
            {insights.activity.length ? (
              insights.activity.map((a) => {
                const Icon =
                  a.type === "payment"
                    ? Receipt
                    : a.type === "member"
                      ? UserRoundPlus
                      : CalendarCheck2;
                return (
                  <div
                    key={`${a.type}-${a.id}`}
                    className="flex items-start gap-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-honeydew/35">
                      <Icon className="size-3.5 text-status-active-fg" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{a.name}</p>
                      <p className="mt-0.5 text-[11px] text-dim">{a.detail}</p>
                      <p className="mt-1 text-[10px] text-dim/75">
                        {formatDistanceToNow(new Date(a.time), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-xs leading-relaxed text-dim">
                Your gym’s activity will appear here as members join, check in,
                and make payments.
              </p>
            )}
          </div>
        </section>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <RevenueChart data={insights.revenue} />
        <section className="apple-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold">
            A little attention goes a long way.
          </h2>
          <p className="mt-1 text-xs text-dim">
            Keep the everyday running smoothly.
          </p>
          <div className="mt-5 divide-y divide-border">
            {[
              {
                title: "Expired memberships",
                count: stats.feesOverdueCount,
                href: "/admin/subscriptions",
                text: "Help members get back into their routine.",
              },
              {
                title: "Trials ending soon",
                count: stats.needsAttention.trialsEndingSoon.length,
                href: "/admin/trials",
                text: "Turn a great first impression into a membership.",
              },
              {
                title: "Pending payroll",
                count: stats.needsAttention.pendingSalaries.count,
                href: "/admin/salaries",
                text: "Keep your coaching team taken care of.",
              },
            ].map((x) => (
              <Link
                key={x.title}
                href={x.href}
                className="flex items-center gap-3 py-4 first:pt-0"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-desert/25 text-xs font-medium tabular-nums">
                  {x.count}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-medium">{x.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-dim">
                    {x.text}
                  </p>
                </div>
                <ArrowRight className="size-3 text-dim" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
