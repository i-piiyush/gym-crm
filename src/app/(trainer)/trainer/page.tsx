import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getTrainerPortalOverview } from "@/db/repositories/trainer.repo";
import { TrainerOverview } from "@/features/trainer/components/TrainerOverview";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TrainerPortalPage() {
  const session = await getPortalSession("TRAINER");
  const now = new Date();
  const zonedNow = toZonedTime(now, "Asia/Kolkata");
  const todayDateStr = format(zonedNow, "yyyy-MM-dd");
  const currentMonthStr = format(zonedNow, "yyyy-MM");

  const data = await getTrainerPortalOverview(
    session.userId,
    session.gymId!,
    todayDateStr,
    currentMonthStr
  );

  if (!data.trainerProfile) {
    notFound();
  }

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Trainer Portal"
        description="Assigned client attendance tracking, personal gym check-in, and monthly payroll."
      />

      <TrainerOverview data={data} todayDateStr={todayDateStr} />
    </FadeIn>
  );
}
