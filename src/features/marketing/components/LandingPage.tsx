import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  CalendarCheck2,
  CreditCard,
  ChartNoAxesCombined,
  Clock,
  UserRoundPlus,
  Check,
  QrCode,
  ChevronRight,
} from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "./MarketingNav";
import { ProductPreview, MemberPreview, PreviewBars } from "./ProductPreview";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-card p-3 focus:not-sr-only"
      >
        Skip to content
      </a>
      <MarketingNav />
      <main id="main-content">
        <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-20 lg:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[11px] text-dim">
            <span className="size-1.5 rounded-full bg-[#7b967e]" />A calmer way
            to run your gym
            <ChevronRight className="size-3" />
          </div>
          <h1 className="mt-7 text-[44px] font-semibold leading-[1.08] tracking-[-2.2px] sm:text-[64px] sm:tracking-[-3px] lg:text-[76px] lg:tracking-[-3.8px]">
            Running your gym,
            <br />
            <span className="text-muted-foreground">made effortless.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[540px] text-[15px] leading-[1.8] text-dim sm:text-base">
            Manage members, track attendance, handle payments and understand
            your gym’s performance — all in one beautifully simple workspace.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link href="/sign-in">
                Open your workspace <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <a href="#features">
                Explore features <ArrowRight />
              </a>
            </Button>
          </div>
          <p className="mt-4 text-[11px] text-dim">
            Less busywork. More room for what matters.
          </p>
          <div className="relative mx-auto mt-12 max-w-[1050px] sm:mt-16">
            <div className="pointer-events-none absolute -inset-x-4 -inset-y-6 -z-0 rounded-[32px] bg-accent/40 sm:-inset-x-8" />
            <div className="relative">
              <ProductPreview />
            </div>
          </div>
          <p className="mt-6 text-[11px] text-dim">
            One workspace. Every part of your gym.{" "}
            <span className="ml-1 text-dim/70">
              Illustrative product preview.
            </span>
          </p>
        </section>
        <div className="mx-auto max-w-[1120px] border-y border-border px-5 py-7 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[12px] text-dim">
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-status-active-fg" />
              Built for independent gyms
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-status-active-fg" />
              Simple by design
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-status-active-fg" />
              Everything in one place
            </span>
          </div>
        </div>
        <section
          id="features"
          className="landing-section mx-auto max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="text-center">
            <p className="text-[11px] font-medium tracking-[1.6px] text-dim">
              LESS FRICTION. MORE FOCUS.
            </p>
            <h2 className="mt-4 text-[34px] font-semibold leading-[1.15] tracking-[-1.2px] sm:text-[46px]">
              Everything your gym needs.
              <br />
              <span className="text-muted-foreground">Nothing it doesn’t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-dim">
              Thoughtfully connected tools that make the everyday feel a little
              easier.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-5">
            <article className="overflow-hidden rounded-2xl bg-secondary p-6 sm:p-8 lg:col-span-3">
              <span className="mb-5 inline-flex size-9 items-center justify-center rounded-xl bg-card/80">
                <Users className="size-[18px]" />
              </span>
              <h3 className="text-[22px] font-semibold tracking-tight">
                People first. Always.
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-dim">
                From the first hello to the next renewal, keep every member’s
                details, membership, and history beautifully organized.
              </p>
              <div className="mt-7">
                <MemberPreview />
              </div>
            </article>
            <article className="overflow-hidden rounded-2xl bg-secondary p-6 sm:p-8 lg:col-span-2">
              <span className="mb-5 inline-flex size-9 items-center justify-center rounded-xl bg-card/80">
                <CalendarCheck2 className="size-[18px]" />
              </span>
              <h3 className="text-[22px] font-semibold tracking-tight">
                Every visit counts.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">
                Simple check-ins. A clearer picture of who’s showing up and how
                your community is growing.
              </p>
              <div className="mt-7 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">This week’s attendance</p>
                  <span className="size-1.5 rounded-full bg-[#647b67]" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">
                    486
                  </span>
                  <span className="text-[10px] text-dim">check-ins</span>
                </div>
                <PreviewBars compact />
              </div>
            </article>
          </div>
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: "Memberships, simplified.",
                text: "Flexible plans, clear expirations, and renewals that feel effortless.",
              },
              {
                icon: CreditCard,
                title: "Payments, in order.",
                text: "Know what’s collected, what’s pending, and where every receipt is.",
              },
              {
                icon: ChartNoAxesCombined,
                title: "Clarity for your business.",
                text: "Turn attendance, revenue, and member trends into better decisions.",
              },
              {
                icon: UserRoundPlus,
                title: "Make the first move.",
                text: "Keep trial members in view and make the next step feel personal.",
              },
            ].map((f) => (
              <article key={f.title} className="border-t border-border pt-6">
                <f.icon className="size-5 text-dim" strokeWidth={1.6} />
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.7] text-dim">
                  {f.text}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section
          id="solutions"
          className="landing-section border-y border-border bg-card"
        >
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium tracking-[1.6px] text-dim">
                YOUR DAY, IN PERFECT SYNC.
              </p>
              <h2 className="mt-4 text-[36px] font-semibold leading-[1.15] tracking-[-1.4px] sm:text-[44px]">
                Less behind the desk.
                <br />
                <span className="text-muted-foreground">More on the floor.</span>
              </h2>
              <p className="mt-5 max-w-[410px] text-sm leading-[1.8] text-dim">
                A great gym runs on people. GYM-OS brings your daily operations
                together so you can spend more time with yours.
              </p>
              <div className="mt-7 space-y-4">
                {[
                  "Welcome members with a quick QR check-in",
                  "Keep upcoming renewals on your radar",
                  "Record payments and share a clear receipt",
                ].map((x) => (
                  <p key={x} className="flex items-center gap-3 text-[13px]">
                    <span className="flex size-5 items-center justify-center rounded-full bg-honeydew/60">
                      <Check className="size-3" />
                    </span>
                    {x}
                  </p>
                ))}
              </div>
              <Button asChild variant="link" className="mt-6 px-0">
                <Link href="/sign-in">
                  Find your flow <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl bg-muted p-5 sm:p-9">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border p-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-cream">
                    <QrCode className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      A warm welcome. A simple check-in.
                    </p>
                    <p className="mt-1 text-[11px] text-dim">
                      Reception · Today
                    </p>
                  </div>
                </div>
                {[
                  ["AS", "Aarav Sharma", "9:42 AM", "bg-honeydew/60"],
                  ["PM", "Priya Mehta", "9:38 AM", "bg-desert/50"],
                  ["NS", "Neha Singh", "9:31 AM", "bg-cream"],
                ].map(([i, n, t, c]) => (
                  <div
                    key={n}
                    className="flex items-center gap-3 border-b border-border/60 px-5 py-5"
                  >
                    <span
                      className={`flex size-9 items-center justify-center rounded-full text-xs ${c}`}
                    >
                      {i}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{n}</p>
                      <p className="mt-1 text-[10px] text-dim">
                        Checked in · {t}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-status-active-fg">
                      <Check className="size-3" />
                      Verified
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-muted px-5 py-4 text-[11px] text-dim">
                  <span>One less thing to think about.</span>
                  <span className="size-1.5 rounded-full bg-[#647b67]" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
          <div className="order-2 rounded-2xl bg-secondary p-5 sm:p-9 lg:order-1">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs font-medium text-dim">Revenue overview</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">
                  ₹1,84,500
                </span>
                <span className="rounded-full bg-honeydew/50 px-2 py-1 text-[10px] text-status-active-fg">
                  ↗ 8.2% this month
                </span>
              </div>
              <svg
                viewBox="0 0 400 140"
                role="img"
                aria-label="Illustrative monthly revenue growth"
                className="mt-6 w-full"
              >
                <defs>
                  <linearGradient
                    id="preview-revenue-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop stopColor="#d0e1d4" stopOpacity=".6" />
                    <stop offset="1" stopColor="#d0e1d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[30, 70, 110].map((y) => (
                  <path
                    key={y}
                    d={`M0 ${y}H400`}
                    stroke="#eaece5"
                    strokeDasharray="4 4"
                  />
                ))}
                <path
                  d="M0 118L35 112L70 118L105 85L140 94L175 65L210 72L245 49L280 57L315 28L350 39L400 13V140H0Z"
                  fill="url(#preview-revenue-fill)"
                />
                <path
                  d="M0 118L35 112L70 118L105 85L140 94L175 65L210 72L245 49L280 57L315 28L350 39L400 13"
                  fill="none"
                  stroke="#708a73"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4 flex justify-between text-[10px] text-dim">
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
                <span className="text-dim">
                  Your numbers. A little clearer.
                </span>
                <ChartNoAxesCombined className="size-4 text-dim" />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:pl-8">
            <p className="text-[11px] font-medium tracking-[1.6px] text-dim">
              SEE THE BIGGER PICTURE.
            </p>
            <h2 className="mt-4 text-[36px] font-semibold leading-[1.15] tracking-[-1.4px] sm:text-[44px]">
              Good decisions start
              <br />
              <span className="text-muted-foreground">with a clear view.</span>
            </h2>
            <p className="mt-5 max-w-[400px] text-sm leading-[1.8] text-dim">
              Understand your revenue, spot membership trends, and see what’s
              working. Thoughtful insights, without the spreadsheet sprawl.
            </p>
            <Button asChild variant="link" className="mt-5 px-0">
              <a href="#features">
                Explore what’s possible <ArrowRight />
              </a>
            </Button>
          </div>
        </section>
        <section
          id="about"
          className="landing-section mx-auto max-w-[1120px] rounded-2xl bg-accent px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <p className="text-[11px] font-medium tracking-[1.6px] text-dim">
            BUILT WITH INTENTION.
          </p>
          <h2 className="mx-auto mt-4 max-w-[640px] text-[34px] font-semibold leading-[1.15] tracking-[-1.3px] sm:text-[44px]">
            Your gym deserves
            <br />a better operating system.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-dim">
            Bring your gym’s everyday operations into one simple workspace.
          </p>
          <Button asChild className="mt-7 rounded-full px-6">
            <Link href="/sign-in">
              Open your workspace <ArrowUpRight />
            </Link>
          </Button>
          <p className="mt-5 text-[11px] text-dim">
            No unnecessary complexity. Just better gym management.
          </p>
        </section>
      </main>
      <footer className="mx-auto max-w-[1180px] px-5 pb-7 pt-16 sm:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-border pb-10 sm:flex-row">
          <div>
            <Brand />
            <p className="mt-3 text-xs text-dim">Your gym. In perfect sync.</p>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-6 text-xs">
            <div className="space-y-3">
              <p className="font-medium">Product</p>
              <a
                className="block text-dim hover:text-foreground"
                href="#features"
              >
                Features
              </a>
              <a
                className="block text-dim hover:text-foreground"
                href="#solutions"
              >
                Solutions
              </a>
              <a className="block text-dim hover:text-foreground" href="#about">
                About
              </a>
            </div>
            <div className="space-y-3">
              <p className="font-medium">Your workspace</p>
              <Link
                className="block text-dim hover:text-foreground"
                href="/sign-in"
              >
                Log in
              </Link>
              <Link
                className="block text-dim hover:text-foreground"
                href="/help"
              >
                Help & support
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-dim">
          <p>© {new Date().getFullYear()} GYM-OS. Made for the everyday.</p>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
