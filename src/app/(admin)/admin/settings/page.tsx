import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getGymSettingsData } from "@/services/gym.service";
import { PlansCrud } from "@/features/settings/components/PlansCrud";
import { notFound } from "next/navigation";
import {
  MapPin,
  Lock,
  ExternalLink,
  Building2,
  Clock,
  Users,
  Receipt,
  Radio,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getPortalSession("ADMIN");
  const { gym, plans } = await getGymSettingsData(session.gymId!);

  if (!gym) {
    notFound();
  }

  const serializedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    durationDays: p.durationDays,
    price: Number(p.price),
    isActive: p.isActive,
  }));

  return (
    <FadeIn className="space-y-8 max-w-5xl">
      <PageHeader
        title="Settings & Configuration"
        description="Facility operational profiles, membership pricing tiers, invoice numbering, and geofence coordinates."
      />

      {/* Membership Plans CRUD */}
      <PlansCrud initialPlans={serializedPlans} />

      {/* Facility Profile Card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-honeydew/40 text-foreground">
              <Building2 className="h-5 w-5 text-[#204E2B]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Facility Operational Profile
              </h2>
              <p className="text-xs text-dim mt-0.5">
                Physical location parameters, receipt sequences, and member capacity constraints.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-honeydew/50 border border-[#B5D5BD] px-2.5 py-1 text-[11px] font-medium text-[#204E2B]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified Facility</span>
          </span>
        </div>

        {/* Facility metadata list */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-dim">
              <Building2 className="h-3.5 w-3.5 text-dim/80" />
              <span className="font-medium">Facility Name</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground tracking-tight">
              {gym.name}
            </p>
            <p className="mt-1 text-xs text-dim line-clamp-1">
              {gym.address}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-dim">
              <Receipt className="h-3.5 w-3.5 text-dim/80" />
              <span className="font-medium">Receipt Invoice Prefix</span>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold text-foreground tracking-wider">
              {gym.receiptPrefix}
            </p>
            <p className="mt-1 text-xs text-dim">
              Sequential syntax: <code className="text-[11px] font-mono text-foreground">{gym.receiptPrefix}-YYYY-XXXXX</code>
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-dim">
              <Clock className="h-3.5 w-3.5 text-dim/80" />
              <span className="font-medium">Operating Timezone</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {gym.timezone}
            </p>
            <p className="mt-1 text-xs text-dim">
              Calculates midnight check-in reset windows
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-dim">
              <Users className="h-3.5 w-3.5 text-dim/80" />
              <span className="font-medium">Customer Membership Cap</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground tabular-nums">
              {gym.maxCustomers.toLocaleString()} active members
            </p>
            <p className="mt-1 text-xs text-dim">
              Hard limit enforced during customer intake
            </p>
          </div>
        </div>
      </div>

      {/* Read-Only GPS Coordinates Notice */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-desert/20 text-foreground">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Attendance GPS Geofence
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-[#F5F5F3] px-2 py-0.5 text-[11px] font-medium text-dim">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </span>
              </div>
              <p className="text-xs text-dim mt-0.5">
                Physical perimeter used by the verification engine to validate check-in proximity.
              </p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps?q=${gym.latitude},${gym.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <MapPin className="h-3.5 w-3.5 text-dim" />
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3 text-dim" />
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <span className="text-xs font-medium text-dim">Latitude Coordinate</span>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground tabular-nums">
              {gym.latitude.toFixed(6)}°
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <span className="text-xs font-medium text-dim">Longitude Coordinate</span>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground tabular-nums">
              {gym.longitude.toFixed(6)}°
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-[#F5F5F3]/50 p-4">
            <span className="text-xs font-medium text-dim">Allowed Perimeter Radius</span>
            <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
              {gym.attendanceRadiusMeters} meters
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2">
          <p className="text-xs text-dim">
            Geofence parameters are immutable at facility level to prevent location spoofing. To recalibrate coordinates, contact platform engineering.
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
