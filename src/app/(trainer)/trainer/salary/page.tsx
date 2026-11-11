import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { listTrainerSalaryHistory } from "@/db/repositories/salary.repo";
import { TrainerSalaryHistoryTable } from "@/features/trainer/components/TrainerSalaryHistoryTable";

export const dynamic = "force-dynamic";

export default async function TrainerSalaryPage() {
  const session = await getPortalSession("TRAINER");
  const records = await listTrainerSalaryHistory(session.userId);

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Compensation & Salary History"
        description="Review your monthly salary statements, due payout dates, and disbursement confirmations."
      />

      <TrainerSalaryHistoryTable records={records} />
    </FadeIn>
  );
}

