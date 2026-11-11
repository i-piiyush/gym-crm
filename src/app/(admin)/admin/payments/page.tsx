import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { listPaymentsByGym } from "@/db/repositories/payment.repo";
import { listCustomers, getActivePlans } from "@/db/repositories/customer.repo";
import { PaymentsView } from "@/features/payments/components/PaymentsView";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const [payments, customers, activePlans] = await Promise.all([
    listPaymentsByGym(gymId),
    listCustomers(gymId),
    getActivePlans(gymId),
  ]);

  const customerOptions = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    currentPlanName: c.planName,
    membershipEnd: c.membershipEnd,
  }));

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

