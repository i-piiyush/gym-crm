"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  LuQrCode,
  LuCalendarCheck,
  LuFlame,
  LuMapPin,
  LuUser,
  LuClock,
  LuCreditCard,
  LuArrowRight,
} from "react-icons/lu";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {profile.user.gym?.name || "Fitness Center"}
          </span>
          <h2 className="text-xl font-bold text-foreground mt-1">
            Welcome back, {profile.user.name.split(" ")[0]}!
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scan the reception QR station to log today&apos;s workout session.
          </p>
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02] shrink-0"
        >
          <LuQrCode className="h-5 w-5" />
          <span>Scan to Check In</span>
        </Link>
      </div>

      {/* Grid: Membership Pass & Assigned Trainer */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Membership Pass Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Active Membership Pass
              </span>
              <StatusBadge status={profile.status} label={profile.status} />
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-foreground">
                {profile.plan?.name || (profile.status === "TRIAL" ? "Free Trial Pass" : "Custom Membership")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{validityText}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50/70 p-3.5 border border-border/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 text-xs">
              <LuClock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pass Expiration:</span>
            </div>
            <span
              className={`font-mono text-xs font-bold ${
                daysLeft !== null && daysLeft <= 3
                  ? "text-rose-600 dark:text-rose-400"
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
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Assigned Personal Trainer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <LuUser className="h-3 w-3" />
                <span>Coach</span>
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-foreground">
                {profile.trainer?.name || "Dedicated Coaching Staff"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.trainer?.email}
              </p>
              {profile.trainer?.phone && (
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {profile.trainer.phone}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground italic">
            <span>Your assigned trainer monitors your check-ins and fitness progress.</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Workouts This Month
            </span>
            <LuCalendarCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">
            {thisMonthCount} <span className="text-xs font-normal text-muted-foreground">days</span>
          </p>
          <span className="text-[11px] text-muted-foreground">Gym sessions verified by GPS</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Current Streak
            </span>
            <LuFlame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-500">
            {streak} <span className="text-xs font-normal text-muted-foreground">days in a row</span>
          </p>
          <span className="text-[11px] text-muted-foreground">Consistent workout streak</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Home Facility
            </span>
            <LuMapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-sm font-bold text-foreground truncate">
            {profile.user.gym?.name}
          </p>
          <span className="text-[11px] text-muted-foreground truncate block">
            {profile.user.gym?.address}
          </span>
        </div>
      </div>

      {/* Recent Attendance Log */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground">Recent Check-In History</h3>
          <Link
            href="/customer/attendance"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View all attendance</span>
            <LuArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border">
          {attendances.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No check-ins logged yet. Scan the reception QR code to log your first session!
            </p>
          ) : (
            attendances.slice(0, 5).map((a) => (
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
                      Checked in at {format(new Date(a.checkInAt), "hh:mm a")}
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

