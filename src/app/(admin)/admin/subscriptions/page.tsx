import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getSubscriptionsPageData } from "@/services/membership.service";
import { SubscriptionsView } from "@/features/subscriptions/components/SubscriptionsView";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const { buckets, plans } = await getSubscriptionsPageData(gymId);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Memberships"
        description="Keep every plan, expiration, and renewal in perfect sync."
      />

      <SubscriptionsView buckets={buckets} plans={plans} />
    </FadeIn>
  );
}
