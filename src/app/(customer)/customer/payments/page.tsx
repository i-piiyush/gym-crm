import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getCustomerPayments } from "@/db/repositories/customer.repo";
import { CustomerPaymentsTable } from "@/features/customer/components/CustomerPaymentsTable";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentsPage() {
  const session = await getPortalSession("CUSTOMER");
  const payments = await getCustomerPayments(session.userId);

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Billing Receipts & Invoices"
        description="Access and download official GST payment receipts for all your gym subscriptions."
      />

      <CustomerPaymentsTable payments={payments} />
    </FadeIn>
  );
}

