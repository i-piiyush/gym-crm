import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { LuBuilding2, LuPlus } from "react-icons/lu";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function SuperAdminOverviewPage() {
  return (
    <FadeIn>
      <PageHeader
        title="Platform Administration"
        description="Manage multi-tenant gym facilities, configure manual GPS coordinates, and invite gym owners."
        action={
          <Link
            href={ROUTES.SUPER_ADMIN.GYM_NEW}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <LuPlus className="h-4 w-4" />
            <span>Create New Gym</span>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Link
          href={ROUTES.SUPER_ADMIN.GYMS}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-primary dark:bg-emerald-950/40">
            <LuBuilding2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Gym Facilities</h3>
            <p className="text-xs text-muted-foreground mt-1">
              View all active and suspended gyms, owner invitations, and attendance coordinates.
            </p>
          </div>
        </Link>
      </div>
    </FadeIn>
  );
}

