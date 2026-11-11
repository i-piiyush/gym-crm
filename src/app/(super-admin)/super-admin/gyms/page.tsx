import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { GymsTable } from "@/features/super-admin/components/GymsTable";
import { getAllGyms } from "@/services/gym.service";
import { LuPlus } from "react-icons/lu";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-dynamic";

export default async function GymsListPage() {
  const gyms = await getAllGyms();

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Gym Facilities"
        description="View and configure all multi-tenant gym installations, attendance geofence coordinates, and owner accounts."
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

      <GymsTable gyms={gyms} />
    </FadeIn>
  );
}

