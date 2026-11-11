import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getGymDetails } from "@/services/gym.service";
import { listPlansByGym } from "@/db/repositories/plan.repo";
import { PlansCrud } from "@/features/settings/components/PlansCrud";
import { notFound } from "next/navigation";
import { LuMapPin, LuLock, LuExternalLink, LuBuilding2 } from "react-icons/lu";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getPortalSession("ADMIN");
  const [gym, plans] = await Promise.all([
    getGymDetails(session.gymId!),
    listPlansByGym(session.gymId!),
  ]);

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
    <FadeIn className="space-y-6 max-w-4xl">
      <PageHeader
        title="Gym Settings & Profile"
        description="Facility operational information, membership plans, receipt configuration, and geofence specifications."
      />

      {/* Membership Plans CRUD */}
      <PlansCrud initialPlans={serializedPlans} />

      {/* Facility Profile */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-primary dark:bg-emerald-950/40">
            <LuBuilding2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{gym.name}</h2>
            <p className="text-xs text-muted-foreground">{gym.address}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 mt-6">
          <div className="rounded-xl border border-border bg-slate-50/50 p-4 dark:bg-slate-900/40">
            <span className="text-xs font-medium text-muted-foreground">Receipt Prefix</span>
            <p className="mt-1 font-mono text-base font-bold text-foreground">
              {gym.receiptPrefix}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Used in {gym.receiptPrefix}-YYYY-XXXXX
            </span>
          </div>

          <div className="rounded-xl border border-border bg-slate-50/50 p-4 dark:bg-slate-900/40">
            <span className="text-xs font-medium text-muted-foreground">Operating Timezone</span>
            <p className="mt-1 text-base font-bold text-foreground">
              {gym.timezone}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Local day boundaries for check-in
            </span>
          </div>

          <div className="rounded-xl border border-border bg-slate-50/50 p-4 dark:bg-slate-900/40">
            <span className="text-xs font-medium text-muted-foreground">Customer Capacity</span>
            <p className="mt-1 text-base font-bold text-foreground">
              {gym.maxCustomers} members
            </p>
            <span className="text-[11px] text-muted-foreground">
              Enforced server-side limit
            </span>
          </div>
        </div>
      </div>

      {/* Read-Only GPS Coordinates Notice */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <LuMapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Attendance GPS Geofence (Read-Only)
              </h2>
              <p className="text-xs text-muted-foreground">
                Physical check-in boundaries configured for this facility.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <LuLock className="h-3.5 w-3.5" />
            <span>Read-Only</span>
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-slate-50/70 p-4 dark:bg-slate-900/50">
            <span className="text-xs font-medium text-muted-foreground">Latitude</span>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">
              {gym.latitude.toFixed(6)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-slate-50/70 p-4 dark:bg-slate-900/50">
            <span className="text-xs font-medium text-muted-foreground">Longitude</span>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">
              {gym.longitude.toFixed(6)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-slate-50/70 p-4 dark:bg-slate-900/50">
            <span className="text-xs font-medium text-muted-foreground">Check-in Radius</span>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {gym.attendanceRadiusMeters} meters
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2">
          <a
            href={`https://www.google.com/maps?q=${gym.latitude},${gym.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>View geofence center on Google Maps</span>
            <LuExternalLink className="h-3.5 w-3.5" />
          </a>

          <p className="text-[11px] text-muted-foreground italic">
            Geofence coordinates are locked. Contact platform Super Admin to adjust location.
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

