import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getCustomerPortalData } from "@/db/repositories/customer.repo";
import { CustomerOverview } from "@/features/customer/components/CustomerOverview";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerPortalPage() {
  const session = await getPortalSession("CUSTOMER");
  const data = await getCustomerPortalData(session.userId);

  if (!data) {
    notFound();
  }

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Member Portal"
        description="Daily gym check-in, active membership pass validity, and workout streaks."
      />

      <CustomerOverview data={data} />
    </FadeIn>
  );
}
