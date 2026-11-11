import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getTrainerAssignedCustomers } from "@/db/repositories/trainer.repo";
import { TrainerClientsTable } from "@/features/trainer/components/TrainerClientsTable";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function TrainerCustomersPage() {
  const session = await getPortalSession("TRAINER");
  const now = new Date();
  const zonedNow = toZonedTime(now, "Asia/Kolkata");
  const todayDateStr = format(zonedNow, "yyyy-MM-dd");

  const clients = await getTrainerAssignedCustomers(session.userId, todayDateStr);

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Assigned Clients"
        description="Monitor workout attendance, view membership status, and manage client training regimens."
      />

      <TrainerClientsTable clients={clients} todayDateStr={todayDateStr} />
    </FadeIn>
  );
}

