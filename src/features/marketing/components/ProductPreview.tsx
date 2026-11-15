import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  CreditCard,
  Settings,
  Dumbbell,
  ChevronDown,
  Search,
  Bell,
  ArrowUpRight,
  Clock,
  CircleCheck,
  ArrowRight,
  UserRoundPlus,
} from "lucide-react";

const previewMembers = [
  {
    name: "Aarav Sharma",
    initials: "AS",
    plan: "Annual membership",
    date: "Nov 18",
    tone: "bg-honeydew/70",
  },
  {
    name: "Priya Mehta",
    initials: "PM",
    plan: "Quarterly membership",
    date: "Nov 20",
    tone: "bg-desert/40",
  },
  {
    name: "Rohan Kapoor",
    initials: "RK",
    plan: "Monthly membership",
    date: "Nov 22",
    tone: "bg-sand/50",
  },
];
export function PreviewBars({ compact = false }: { compact?: boolean }) {
  const values = [38, 53, 44, 66, 58, 79, 61, 48, 76, 64, 89, 72, 67, 91];
  return (
    <div className="relative mt-5">
      <div className="absolute inset-0 flex flex-col justify-between pb-6">
        {["100", "75", "50", "25"].map((n) => (
          <div key={n} className="flex items-center gap-3">
            <span className="w-5 text-right text-[9px] text-dim/70">{n}</span>
            <span className="flex-1 border-t border-dashed border-border" />
          </div>
        ))}
      </div>
      <div
        className={`relative ml-8 flex items-end gap-[3%] pb-6 ${compact ? "h-28" : "h-36"}`}
      >
        {values.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-[4px] ${i === 13 ? "bg-[#647b67]" : "bg-honeydew"}`}
            style={{ height: `${v}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-x-8 bottom-0 flex justify-between text-[9px] text-dim">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}
export function MemberPreview({ small = false }: { small?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-left">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold">Your members, at a glance.</p>
          <p className="mt-1 text-[11px] text-dim">
            A little more personal. A lot more organized.
          </p>
        </div>
        <span className="flex size-7 items-center justify-center rounded-lg bg-cream">
          <UserRoundPlus className="size-3.5" />
        </span>
      </div>
      {previewMembers.map((m, i) => (
        <div
          key={m.name}
          className="flex items-center gap-3 border-b border-border/60 px-5 py-4 last:border-0"
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${m.tone}`}
          >
            {m.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">{m.name}</p>
            <p className="mt-0.5 text-[10px] text-dim">{m.plan}</p>
          </div>
          {!small && (
            <span className="hidden text-[10px] text-dim sm:block">
              Joined Nov {i + 1}, 2026
            </span>
          )}
          <span className="rounded-full bg-honeydew/50 px-2 py-1 text-[9px] font-medium text-status-active-fg">
            Active
          </span>
        </div>
      ))}
    </div>
  );
}
export function ProductPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="GYM-OS dashboard preview with illustrative data"
      className="overflow-hidden rounded-[14px] border border-black/[.10] bg-card text-left shadow-[0_20px_70px_-25px_rgba(40,40,40,0.18)]"
    >
      <div className="flex h-9 items-center gap-1.5 border-b border-border bg-background px-4">
        <span className="size-2 rounded-full bg-desert" />
        <span className="size-2 rounded-full bg-sand" />
        <span className="size-2 rounded-full bg-honeydew" />
        <span className="mx-auto pr-8 text-[9px] tracking-wide text-dim">
          GYM-OS · YOUR WORKSPACE
        </span>
      </div>
      <div className="flex">
        <aside className="hidden w-[168px] shrink-0 flex-col border-r border-border bg-muted px-3 py-5 md:flex">
          <div className="mb-6 flex items-center gap-2 px-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cream">
              <Dumbbell className="size-3.5" />
            </span>
            <span className="text-xs font-semibold tracking-tight">GYM-OS</span>
          </div>
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-honeydew/60 text-[10px] font-semibold">
              S
            </span>
            <div className="flex-1">
              <p className="text-[10px] font-medium">Studio Fitness</p>
              <p className="text-[8px] text-dim">Your workspace</p>
            </div>
            <ChevronDown className="size-3 text-dim" />
          </div>
          <p className="px-2 text-[8px] tracking-wider text-dim">WORKSPACE</p>
          <div className="mt-2 space-y-1">
            {[
              ["Overview", LayoutDashboard],
              ["Members", Users],
              ["Attendance", CalendarCheck2],
              ["Memberships", Clock],
              ["Payments", CreditCard],
            ].map(([name, Icon], i) => {
              const I = Icon as typeof Users;
              return (
                <div
                  key={String(name)}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-2.5 text-[10px] ${i === 0 ? "bg-cream/75 font-medium" : "text-dim"}`}
                >
                  <I className="size-3.5" />
                  {String(name)}
                </div>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-2 px-2 pt-14 text-[10px] text-dim">
            <Settings className="size-3.5" />
            Settings
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border px-2 pt-4">
            <span className="flex size-6 items-center justify-center rounded-full bg-desert/50 text-[8px]">
              AK
            </span>
            <div>
              <p className="text-[9px] font-medium">Alex Kim</p>
              <p className="text-[8px] text-dim">Gym owner</p>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between border-b border-border px-5">
            <span className="text-[10px] text-dim">
              Workspace <span className="mx-2 text-sand">/</span>{" "}
              <span className="text-foreground">Overview</span>
            </span>
            <div className="flex items-center gap-4 text-dim">
              <Search className="size-3.5" />
              <Bell className="size-3.5" />
              <span className="size-5 rounded-full bg-desert/50" />
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[9px] text-dim">
                  Sunday, November 15, 2026
                </p>
                <h3 className="text-xl font-semibold tracking-[-.6px] sm:text-2xl">
                  Good morning, Alex <span className="text-sand">☀</span>
                </h3>
                <p className="mt-1 text-[10px] text-dim">
                  A good day starts with a clear picture.
                </p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[9px] text-primary-foreground sm:flex">
                <span>+</span> Add member
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-b border-border pb-6 sm:grid-cols-4">
              {[
                {
                  label: "Active members",
                  value: "248",
                  trend: "+12 this month",
                  icon: Users,
                },
                {
                  label: "Today's attendance",
                  value: "86",
                  trend: "34.7% of members",
                  icon: CalendarCheck2,
                },
                {
                  label: "Monthly revenue",
                  value: "₹1,84,500",
                  trend: "+8.2% vs. last month",
                  icon: CreditCard,
                },
                {
                  label: "Pending payments",
                  value: "₹12,500",
                  trend: "6 members to follow up",
                  icon: Clock,
                },
              ].map((m, i) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-[9px] text-dim">
                    <span>{m.label}</span>
                    <m.icon className="size-3 opacity-70" />
                  </div>
                  <p className="mt-2 text-[22px] font-semibold tracking-[-.7px] tabular-nums">
                    {m.value}
                  </p>
                  <p
                    className={`mt-2 flex items-center gap-1 text-[8px] ${i === 3 ? "text-status-warning-fg" : "text-status-active-fg"}`}
                  >
                    {i !== 3 && <ArrowUpRight className="size-2.5" />}
                    {m.trend}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1.55fr_1fr]">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Attendance overview</p>
                  <span className="rounded-md border border-border px-2 py-1 text-[8px] text-dim">
                    This week⌄
                  </span>
                </div>
                <p className="mt-1 text-[9px] text-dim">
                  Showing up. Getting stronger.
                </p>
                <PreviewBars compact={compact} />
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-semibold">Membership overview</p>
                <p className="mt-1 text-[9px] text-dim">A healthy community.</p>
                <div className="my-4 flex items-center justify-center gap-5">
                  <div
                    className="flex size-24 items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(#d0e1d4 0% 80%, #e4be9e 80% 93%, #ecece7 93% 100%)",
                    }}
                  >
                    <div className="flex size-[72px] flex-col items-center justify-center rounded-full bg-card">
                      <span className="text-xl font-semibold">248</span>
                      <span className="text-[8px] text-dim">members</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-[9px]">
                    {[
                      ["Active", "224", "bg-honeydew"],
                      ["Expiring", "18", "bg-desert"],
                      ["Expired", "6", "bg-muted"],
                    ].map(([a, b, c]) => (
                      <div key={a} className="flex items-center gap-2">
                        <span className={`size-1.5 rounded-full ${c}`} />
                        <span className="w-10 text-dim">{a}</span>
                        <span className="font-medium">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-3 text-[9px] text-dim">
                  18 memberships expire this month{" "}
                  <ArrowRight className="ml-1 inline size-2.5" />
                </div>
              </div>
            </div>
            {!compact && (
              <div className="mt-5 grid gap-4 sm:grid-cols-[1.55fr_1fr]">
                <div className="rounded-lg border border-border">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-xs font-semibold">Upcoming renewals</p>
                    <span className="text-[9px] text-dim">View all →</span>
                  </div>
                  {previewMembers.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3 last:border-0"
                    >
                      <span
                        className={`flex size-7 items-center justify-center rounded-full text-[8px] ${m.tone}`}
                      >
                        {m.initials}
                      </span>
                      <div className="flex-1">
                        <p className="text-[10px] font-medium">{m.name}</p>
                        <p className="text-[8px] text-dim">{m.plan}</p>
                      </div>
                      <span className="text-[9px] text-dim">{m.date}</span>
                      <span className="ml-2 rounded-md border border-border px-2 py-1 text-[8px]">
                        Renew
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs font-semibold">Recent activity</p>
                  <div className="mt-4 space-y-4">
                    {[
                      ["Payment received", "Priya Mehta · ₹4,500", CircleCheck],
                      [
                        "New member joined",
                        "Neha Singh · Monthly plan",
                        UserRoundPlus,
                      ],
                      [
                        "Member checked in",
                        "Aarav Sharma · 9:42 AM",
                        CalendarCheck2,
                      ],
                    ].map(([a, b, Icon]) => {
                      const I = Icon as typeof Users;
                      return (
                        <div key={String(a)} className="flex items-start gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-honeydew/35">
                            <I className="size-3 text-status-active-fg" />
                          </span>
                          <div>
                            <p className="text-[9px] font-medium">
                              {String(a)}
                            </p>
                            <p className="mt-0.5 text-[8px] text-dim">
                              {String(b)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
