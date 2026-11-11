import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import {
  getSalariesForGymAndMonth,
  getCurrentMonthString,
} from "@/services/salary.service";
import { SalariesTable } from "@/features/salaries/components/SalariesTable";

export const dynamic = "force-dynamic";

interface AdminSalariesPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AdminSalariesPage({
  searchParams,
}: AdminSalariesPageProps) {
  const session = await getPortalSession("ADMIN");
  const { month } = await searchParams;

  const currentMonth = getCurrentMonthString();
  const targetMonth = month || currentMonth;

  const overview = await getSalariesForGymAndMonth(session.gymId!, targetMonth);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Trainer Salaries & Payroll"
        description="Snapshot monthly salaries, track due disbursement dates, and record payroll payments."
      />

      <SalariesTable
        initialOverview={overview}
        currentMonth={targetMonth}
      />
    </FadeIn>
  );
}

