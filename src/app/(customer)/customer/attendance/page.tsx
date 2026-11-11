import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getCustomerPortalData } from "@/db/repositories/customer.repo";
import { CustomerAttendanceView } from "@/features/customer/components/CustomerAttendanceView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerAttendancePage() {
  const session = await getPortalSession("CUSTOMER");
  const data = await getCustomerPortalData(session.userId);

  if (!data) {
    notFound();
  }

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Workout Attendance History"
        description="Review all your past gym visits, verified check-in timestamps, and active workout streaks."
      />

      <CustomerAttendanceView
        attendances={data.attendances}
        thisMonthCount={data.thisMonthCount}
        streak={data.streak}
      />
    </FadeIn>
  );
}

