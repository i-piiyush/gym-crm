"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  QrCode,
  CalendarCheck,
  Flame,
  MapPin,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface CustomerOverviewProps {
  data: {
    profile: {
      userId: string;
      status: string;
      membershipStart: Date | null;
      membershipEnd: Date | null;
      trialEndsAt: Date | null;
      user: {
        name: string;
        email: string;
        gym: {
          name: string;
          address: string;
        } | null;
      };
      trainer: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
      } | null;
      plan: {
        name: string;
        durationDays: number;
        price: unknown;
      } | null;
    };
    attendances: Array<{
      id: string;
      date: string;
      checkInAt: Date;
      distanceMeters: unknown;
    }>;
    thisMonthCount: number;
    streak: number;
  };
}

export function CustomerOverview({ data }: CustomerOverviewProps) {
  const { profile, attendances, thisMonthCount, streak } = data;
  const now = new Date().getTime();

  let validityText = "—";
  let daysLeft: number | null = null;

  if (profile.status === "TRIAL" && profile.trialEndsAt) {
    validityText = `Trial ends ${format(new Date(profile.trialEndsAt), "dd MMM yyyy")}`;
    const diff = new Date(profile.trialEndsAt).getTime() - now;
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  } else if (profile.membershipEnd) {
    validityText = `Valid until ${format(new Date(profile.membershipEnd), "dd MMM yyyy")}`;
    const diff = new Date(profile.membershipEnd).getTime() - now;
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Check-in Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-dim mb-1">
            <span className="font-medium tracking-wide">
              {profile.user.gym?.name || "Fitness Center"}
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Welcome back, {profile.user.name.split(" ")[0]}
          </h2>
          <p className="text-xs text-dim mt-0.5">
            Scan the reception QR station or check in to log today&apos;s
            workout.
          </p>
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-sm shrink-0"
        >
          <QrCode className="h-4 w-4" />
          <span>Check In Now</span>
        </Link>
      </div>

      {/* Grid: Membership Pass & Assigned Trainer */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Membership Pass Card */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
              <span className="text-xs font-medium text-dim tracking-wide">
                Membership Pass
              </span>
              <StatusBadge status={profile.status} label={profile.status} />
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                {profile.plan?.name ||
                  (profile.status === "TRIAL"
                    ? "Free Trial Pass"
                    : "Active Membership")}
              </h3>
              <p className="text-xs text-dim mt-1">{validityText}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/60 p-3.5 border border-border/60">
            <div className="flex items-center gap-2 text-xs text-dim">
              <Clock className="h-3.5 w-3.5" />
              <span>Pass Validity:</span>
            </div>
            <span
              className={`font-semibold text-xs tabular-nums ${
                daysLeft !== null && daysLeft <= 3
                  ? "text-status-danger-fg"
                  : "text-foreground"
              }`}
            >
              {daysLeft !== null
                ? daysLeft <= 0
                  ? "Expired"
                  : `${daysLeft} days remaining`
                : "Active"}
            </span>
          </div>
        </div>

        {/* Assigned Trainer Card */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
              <span className="text-xs font-medium text-dim tracking-wide">
                Assigned Coach
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-honeydew/50 border border-status-active-fg/20 px-2.5 py-0.5 text-[11px] font-medium text-status-active-fg">
                <User className="h-3 w-3" />
                <span>Coach</span>
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                {profile.trainer?.name || "Facility Coaching Staff"}
              </h3>
              <p className="text-xs text-dim mt-1">
                {profile.trainer?.email || "Assigned on facility floor"}
              </p>
              {profile.trainer?.phone && (
                <p className="text-xs font-mono text-dim mt-0.5 tabular-nums">
                  {profile.trainer.phone}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-xs text-dim">
            <ShieldCheck className="h-3.5 w-3.5 text-dim/70" />
            <span>Monitors workout consistency and attendance records</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              Workouts This Month
            </span>
            <CalendarCheck className="h-4 w-4 text-dim" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums tracking-tight">
            {thisMonthCount}{" "}
            <span className="text-xs font-normal text-dim">sessions</span>
          </p>
          <span className="text-xs text-dim mt-1 block">
            Verified by GPS geofence
          </span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              Current Streak
            </span>
            <Flame className="h-4 w-4 text-desert" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums tracking-tight">
            {streak}{" "}
            <span className="text-xs font-normal text-dim">days streak</span>
          </p>
          <span className="text-xs text-dim mt-1 block">
            Consecutive gym visits
          </span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-dim tracking-wide">
              Facility Location
            </span>
            <MapPin className="h-4 w-4 text-dim" />
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground truncate">
            {profile.user.gym?.name}
          </p>
          <span className="text-xs text-dim truncate block mt-0.5">
            {profile.user.gym?.address}
          </span>
        </div>
      </div>

      {/* Recent Attendance Log */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Check-In History
          </h3>
          <Link
            href="/customer/attendance"
            className="inline-flex items-center gap-1 text-xs font-medium text-dim hover:text-foreground transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border/50">
          {attendances.length === 0 ? (
            <p className="py-8 text-center text-xs text-dim">
              No check-ins logged yet. Scan the reception QR code to log your
              first session!
            </p>
          ) : (
            attendances.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-3.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-honeydew text-status-active-fg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {format(new Date(a.checkInAt), "EEEE, dd MMMM yyyy")}
                    </div>
                    <div className="text-[11px] text-dim">
                      Checked in at {format(new Date(a.checkInAt), "hh:mm a")}
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
