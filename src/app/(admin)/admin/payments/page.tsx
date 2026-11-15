import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getPaymentsPageData } from "@/db/repositories/payment.repo";
import { PaymentsView } from "@/features/payments/components/PaymentsView";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const { payments, customerOptions, activePlans } =
    await getPaymentsPageData(gymId);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Payments & Receipts"
        description="Record customer membership fees, generate sequential receipts, and track automated email delivery."
      />

      <PaymentsView
        payments={payments}
        customers={customerOptions}
        plans={activePlans}
      />
    </FadeIn>
  );
}

