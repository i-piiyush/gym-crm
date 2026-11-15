import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserFromClerk } from "@/services/auth.service";
import prisma from "@/db/client";
import { ROLE_HOME_ROUTES, ROUTES } from "@/constants/routes";
import Link from "next/link";
import {
  Users,
  CalendarCheck2,
  CreditCard,
  QrCode,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Activity,
  Compass,
  Building2,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const isPreview = params?.preview === "true";

  if (userId && !isPreview) {
    let userRole: string | null = null;

    try {
      const existing = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, status: true },
      });

      if (existing && existing.status === "ACTIVE" && existing.role) {
        userRole = existing.role;
      } else {
        const sync = await syncUserFromClerk(userId);
        if (sync.user) {
          userRole = sync.user.role;
        }
      }
    } catch (err) {
      console.warn("Retrying database sync on home route:", err);
      try {
        const sync = await syncUserFromClerk(userId);
        if (sync.user) {
          userRole = sync.user.role;
        }
      } catch (retryErr) {
        console.error("Database connection failed after retry:", retryErr);
      }
    }

    if (userRole) {
      const destination = ROLE_HOME_ROUTES[userRole as keyof typeof ROLE_HOME_ROUTES];
      if (destination) {
        redirect(destination);
      }
    }

    redirect(ROUTES.NOT_INVITED);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#242424] antialiased selection:bg-[#d0e1d4] selection:text-[#242424]">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. APPLE-INSPIRED TRANSLUCENT TOP NAVIGATION */}
      {/* ---------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-[rgba(40,40,40,0.08)] bg-[#FAFAF8]/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:h-16">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-[#242424] transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#242424] text-white shadow-sm">
              <span className="font-mono text-xs font-bold tracking-tighter">OS</span>
            </div>
            <span className="text-base font-semibold tracking-tight">GYM-OS</span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-xs font-medium text-[#71697a] transition-colors hover:text-[#242424]"
            >
              Features
            </a>
            <a
              href="#product"
              className="text-xs font-medium text-[#71697a] transition-colors hover:text-[#242424]"
            >
              Product
            </a>
            <a
              href="#geofence"
              className="text-xs font-medium text-[#71697a] transition-colors hover:text-[#242424]"
            >
              Attendance
            </a>
            <a
              href="#pricing"
              className="text-xs font-medium text-[#71697a] transition-colors hover:text-[#242424]"
            >
              Philosophy
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.SIGN_IN}
              className="px-3 py-1.5 text-xs font-medium text-[#71697a] transition-colors hover:text-[#242424]"
            >
              Log in
            </Link>
            <Link
              href={ROUTES.SIGN_UP}
              className="apple-button-press inline-flex items-center justify-center rounded-full bg-[#242424] px-4 py-1.5 text-xs font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all hover:bg-[#383838]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Subtle atmospheric glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
          <div className="h-[420px] w-[640px] rounded-full bg-gradient-to-b from-[#f2f6d0] via-[#d0e1d4] to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Subtle announcement pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(40,40,40,0.08)] bg-white/70 px-3.5 py-1 text-xs font-medium text-[#71697a] shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-md">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#d0e1d4]" />
            <span>Introducing GYM-OS</span>
            <span className="text-[#858585]">•</span>
            <span className="text-[#242424]">Your gym. In perfect sync.</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#242424] sm:text-6xl md:text-7xl lg:leading-[1.08]">
            Running your gym,
            <br />
            <span className="text-[#71697a]">made effortless.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-[#71697a] sm:text-lg sm:leading-relaxed">
            Manage members, track attendance, handle payments and understand your gym’s
            performance — all in one beautifully simple workspace.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={ROUTES.SIGN_UP}
              className="apple-button-press inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#242424] px-7 text-sm font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all hover:bg-[#383838]"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="apple-button-press inline-flex h-11 items-center justify-center rounded-full border border-[rgba(40,40,40,0.1)] bg-white/80 px-6 text-sm font-medium text-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-sm transition-all hover:bg-white"
            >
              Explore features
            </a>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* REALISTIC HIGH-FIDELITY PRODUCT INTERFACE PREVIEW */}
          {/* ------------------------------------------------------------------ */}
          <div className="relative mt-14 sm:mt-20">
            <div className="overflow-hidden rounded-2xl border border-[rgba(40,40,40,0.12)] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06),0_20px_60px_rgba(0,0,0,0.04)]">
              {/* Window Controls Bar */}
              <div className="flex h-10 items-center justify-between border-b border-[rgba(40,40,40,0.07)] bg-[#FAFAF8] px-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#e4be9e]" />
                  <div className="h-3 w-3 rounded-full bg-[#d9d2b6]" />
                  <div className="h-3 w-3 rounded-full bg-[#d0e1d4]" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#71697a]">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>FitZone Elite Saket • Dashboard</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#71697a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Reception Live</span>
                </div>
              </div>

              {/* Realistic Dashboard Mockup Content */}
              <div className="p-6 text-left sm:p-8">
                {/* Greeting Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-[rgba(40,40,40,0.06)] pb-6 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#242424] sm:text-3xl">
                      Good morning.
                    </h2>
                    <p className="mt-1 text-xs text-[#71697a]">
                      Here’s what’s happening at your gym today.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d0e1d4]/50 px-3 py-1 text-xs font-medium text-[#242424]">
                      <Activity className="h-3.5 w-3.5 text-emerald-800" />
                      <span>Capacity: 82%</span>
                    </span>
                    <span className="rounded-full border border-[rgba(40,40,40,0.08)] bg-[#FAFAF8] px-3 py-1 text-xs font-medium text-[#71697a]">
                      November 2026
                    </span>
                  </div>
                </div>

                {/* 4 Apple-Style Key Metrics */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Metric 1: Total Active Members */}
                  <div className="rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                    <span className="text-xs font-medium text-[#71697a]">Active Members</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="tabular-nums font-mono text-2xl font-semibold text-[#242424]">
                        164
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700 bg-[#d0e1d4]/40 px-2 py-0.5 rounded-full">
                        +8 this week
                      </span>
                    </div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-stone-200">
                      <div className="h-full w-[82%] rounded-full bg-[#71697a]" />
                    </div>
                  </div>

                  {/* Metric 2: Today's Attendance */}
                  <div className="rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                    <span className="text-xs font-medium text-[#71697a]">Today’s Attendance</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="tabular-nums font-mono text-2xl font-semibold text-[#242424]">
                        42
                      </span>
                      <span className="text-[11px] font-medium text-[#71697a]">
                        Peak at 7:30 AM
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] text-[#71697a]">
                      All check-ins verified within 45m geofence
                    </p>
                  </div>

                  {/* Metric 3: Monthly Revenue */}
                  <div className="rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                    <span className="text-xs font-medium text-[#71697a]">Monthly Revenue</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="tabular-nums font-mono text-2xl font-semibold text-[#242424]">
                        ₹1,48,500
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700 bg-[#d0e1d4]/40 px-2 py-0.5 rounded-full">
                        +14.2%
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] text-[#71697a]">
                      Sequential receipt receipts #2026-00042
                    </p>
                  </div>

                  {/* Metric 4: Attention Needed */}
                  <div className="rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                    <span className="text-xs font-medium text-[#71697a]">Pending Renewals</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="tabular-nums font-mono text-2xl font-semibold text-[#242424]">
                        4
                      </span>
                      <span className="text-[11px] font-medium text-[#8c5222] bg-[#e4be9e]/50 px-2 py-0.5 rounded-full">
                        Action needed
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] text-[#71697a]">
                      3 trial expirations, 1 overdue pass
                    </p>
                  </div>
                </div>

                {/* Sub-section: Live Attendance & Member Activity Preview */}
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4">
                    <div className="flex items-center justify-between border-b border-[rgba(40,40,40,0.06)] pb-3">
                      <div className="flex items-center gap-2">
                        <CalendarCheck2 className="h-4 w-4 text-[#71697a]" />
                        <span className="text-xs font-semibold text-[#242424]">
                          Live Attendance Stream
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71697a]">Updated 30s ago</span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {[
                        { name: "Aarav Sharma", plan: "Annual Gold", dist: "12m", time: "09:42 AM", status: "Verified" },
                        { name: "Priya Patel", plan: "Quarterly Pro", dist: "18m", time: "09:38 AM", status: "Verified" },
                        { name: "Vikram Malhotra", plan: "Trainer Staff", dist: "5m", time: "09:15 AM", status: "Staff Check-in" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-[rgba(40,40,40,0.04)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f6d0] text-xs font-semibold text-[#242424]">
                              {item.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#242424]">{item.name}</p>
                              <p className="text-[11px] text-[#71697a]">{item.plan}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-[#71697a]">{item.dist}</span>
                            <span className="rounded-full bg-[#d0e1d4]/40 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                              {item.status}
                            </span>
                            <span className="text-[11px] text-[#71697a]">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reception QR Station Card */}
                  <div className="flex flex-col justify-between rounded-xl border border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] p-4 text-center">
                    <div>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <QrCode className="h-5 w-5 text-[#242424]" />
                      </div>
                      <h3 className="mt-3 text-xs font-semibold text-[#242424]">
                        Reception Check-in Station
                      </h3>
                      <p className="mt-1 text-[11px] text-[#71697a]">
                        Dynamic 15-second rotating token with physical GPS boundary verification.
                      </p>
                    </div>

                    <div className="my-3 rounded-lg border border-dashed border-[#d9d2b6] bg-white p-3">
                      <div className="mx-auto h-20 w-20 rounded bg-stone-100 flex items-center justify-center">
                        <QrCode className="h-14 w-14 text-stone-800 opacity-80" />
                      </div>
                      <span className="mt-2 block text-[10px] font-mono text-[#71697a]">
                        Rotates in 12s
                      </span>
                    </div>

                    <span className="text-[10px] font-medium text-emerald-700 bg-[#d0e1d4]/40 py-1 rounded-full">
                      Zero buddy punching
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. PRODUCT FEATURES SECTION */}
      {/* ---------------------------------------------------------------------- */}
      <section id="features" className="border-t border-[rgba(40,40,40,0.07)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#242424] sm:text-5xl">
              Everything your gym needs.
              <br />
              <span className="text-[#71697a]">Nothing it doesn’t.</span>
            </h2>
            <p className="mt-4 text-sm text-[#71697a] sm:text-base">
              Engineered with the restraint and precision of Apple, Stripe, and Linear.
              Zero bloated menus or confusing configurations.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="apple-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f6d0] text-[#242424]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#242424]">
                Member Management
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#71697a]">
                Complete contact directories, assigned coaching trainers, renewal notes, and membership lifecycle tracking in one clean view.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
                <span>Instant profile inspection</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#71697a]" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="apple-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d0e1d4] text-[#242424]">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#242424]">
                15-Second Geofence Attendance
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#71697a]">
                High-security rotating HMAC QR station. Members scan from their device and physical distance from the gym boundary is computed instantly.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
                <span>Anti-spoofing verification</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#71697a]" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="apple-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9d2b6] text-[#242424]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#242424]">
                Subscription Lifecycle
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#71697a]">
                Automated 7, 15, and 30-day renewal buckets. Catch expiring memberships before they drop off with single-click renewals.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
                <span>Proactive retention</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#71697a]" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="apple-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4be9e] text-[#242424]">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#242424]">
                Sequential Receipts & Billing
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#71697a]">
                Custom receipt numbering (`FIT-2026-00042`) with atomic counters, automated branded PDF invoice generation, and email delivery audits.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
                <span>Automated delivery</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#71697a]" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="apple-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-[#242424]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#242424]">
                Business Analytics
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#71697a]">
                Server-side customer capacity enforcement, peak check-in time heatmaps, and month-over-month revenue velocity metrics.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
                <span>Real-time intelligence</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#71697a]" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="apple-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d0e1d4]/60 text-[#242424]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#242424]">
                Trainer Payroll & Rosters
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#71697a]">
                Snapshots monthly salaries for all active coaching staff, tracks salary disbursement due days, and maintains clean payroll ledgers.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
                <span>Automated payroll</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#71697a]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. DEEP-DIVE SHOWCASE: GEOFENCE ATTENDANCE & MEMBER RETENTION */}
      {/* ---------------------------------------------------------------------- */}
      <section id="geofence" className="border-t border-[rgba(40,40,40,0.07)] bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71697a]">
                Proprietary Geofence System
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#242424] sm:text-4xl">
                Attendance that cannot be faked.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#71697a] sm:text-base">
                Traditional check-ins rely on honor systems or shared QR codes that members text to friends.
                GYM-OS pairs a cryptographic 15-second rotating QR token with physical device GPS coordinates.
              </p>

              <div className="mt-6 space-y-3.5">
                {[
                  "15-second rotating cryptographic HMAC token",
                  "Hardware GPS distance computed against gym geofence radius",
                  "Flagged audit trail for out-of-boundary check-in attempts",
                  "Reception kiosk mode with fullscreen tablet support",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d0e1d4]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900" />
                    </div>
                    <span className="text-xs font-medium text-[#242424]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href={ROUTES.SIGN_UP}
                  className="apple-button-press inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
                >
                  <span>Experience GYM-OS</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Geofence Card */}
            <div className="rounded-2xl border border-[rgba(40,40,40,0.09)] bg-[#FAFAF8] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[rgba(40,40,40,0.06)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#242424] text-white">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#242424]">Geofence Perimeter</p>
                    <p className="text-[11px] text-[#71697a]">45m Radius • 28.5355° N, 77.2167° E</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#d0e1d4]/60 px-2.5 py-1 text-[10px] font-semibold text-emerald-900">
                  Active Boundary
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[rgba(40,40,40,0.05)]">
                  <div>
                    <p className="text-xs font-medium text-[#242424]">Check-In Within Boundary</p>
                    <p className="text-[11px] text-[#71697a]">Device distance: 12.4 meters from reception</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-[#d0e1d4]/50 px-2.5 py-1 rounded-full">
                    Approved
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[rgba(40,40,40,0.05)]">
                  <div>
                    <p className="text-xs font-medium text-[#242424]">Off-Site Attempt (Spoof)</p>
                    <p className="text-[11px] text-[#71697a]">Device distance: 2,400 meters away</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                    Flagged
                  </span>
                </div>

                <div className="rounded-xl border border-dashed border-[#d9d2b6] bg-[#f2f6d0]/20 p-4 text-center">
                  <p className="text-xs font-medium text-[#242424]">
                    "Zero buddy punching. Zero unverified gym passes."
                  </p>
                  <p className="mt-1 text-[11px] text-[#71697a]">
                    Verified across thousands of monthly check-ins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. FINAL CALL TO ACTION */}
      {/* ---------------------------------------------------------------------- */}
      <section className="border-t border-[rgba(40,40,40,0.07)] py-20 sm:py-28 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#242424] text-white shadow-md">
            <span className="font-mono text-sm font-bold">OS</span>
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#242424] sm:text-5xl">
            Your gym deserves a better operating system.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#71697a] sm:text-base">
            Bring your gym’s everyday operations into one simple workspace.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.SIGN_UP}
              className="apple-button-press inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-8 text-sm font-medium text-white shadow-md hover:bg-[#383838]"
            >
              <span>Get started with Gym-OS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.SIGN_IN}
              className="apple-button-press inline-flex h-12 items-center justify-center rounded-full border border-[rgba(40,40,40,0.1)] bg-white px-7 text-sm font-medium text-[#242424] hover:bg-stone-50"
            >
              Log in to your gym
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#71697a]">
            No unnecessary complexity. Just better gym management.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 6. APPLE-STYLE MINIMAL FOOTER */}
      {/* ---------------------------------------------------------------------- */}
      <footer className="border-t border-[rgba(40,40,40,0.08)] bg-[#FAFAF8] py-12 text-xs text-[#71697a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#242424] text-white text-[10px] font-bold">
              OS
            </div>
            <span className="font-semibold text-[#242424]">GYM-OS</span>
            <span>•</span>
            <span>Your gym. In perfect sync.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-[#242424] transition-colors">
              Features
            </a>
            <Link href={ROUTES.SIGN_IN} className="hover:text-[#242424] transition-colors">
              Log In
            </Link>
            <Link href={ROUTES.SIGN_UP} className="hover:text-[#242424] transition-colors">
              Sign Up
            </Link>
            <span className="text-[#858585]">
              © {new Date().getFullYear()} GYM-OS Inc. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
