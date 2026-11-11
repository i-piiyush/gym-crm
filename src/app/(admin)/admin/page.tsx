import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getAdminDashboardStats } from "@/services/dashboard.service";
import { getGymDetails } from "@/services/gym.service";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LuQrCode } from "react-icons/lu";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const [stats, gym] = await Promise.all([
    getAdminDashboardStats(gymId),
    getGymDetails(gymId),
  ]);

  if (!gym) {
    notFound();
  }

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title={`${gym.name} Dashboard`}
        description="Monitor member capacity, active attendance, monthly revenue, and operational alerts."
        action={
          <Link
            href="/admin/attendance/qr"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
          >
            <LuQrCode className="h-4 w-4" />
            <span>Launch Check-in QR</span>
          </Link>
        }
      />

      <DashboardOverview stats={stats} gymName={gym.name} />
    </FadeIn>
  );
}
