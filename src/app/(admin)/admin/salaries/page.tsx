import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import {
  getSalariesForGymAndMonth,
  getCurrentMonthString,
} from "@/services/salary.service";
import { SalariesTable } from "@/features/salaries/components/SalariesTable";
import { monthStringSchema } from "@/schemas/salary.schema";

export const dynamic = "force-dynamic";

interface AdminSalariesPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AdminSalariesPage({
  searchParams,
}: AdminSalariesPageProps) {
  const session = await getPortalSession("ADMIN");
  const { month } = await searchParams;

  const currentMonth = getCurrentMonthString(new Date(), session.timezone);
  const parsedMonth = monthStringSchema.safeParse(month);
  const targetMonth = parsedMonth.success ? parsedMonth.data : currentMonth;

  const overview = await getSalariesForGymAndMonth(session.gymId!, targetMonth);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Trainer Salaries & Payroll"
        description="Review base salaries, automatic attendance deductions, and payable amounts before recording payroll payments."
      />

      <SalariesTable
        initialOverview={overview}
        currentMonth={targetMonth}
      />
    </FadeIn>
  );
}

