import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getGymSubscriptionsGrouped } from "@/services/membership.service";
import { getActivePlans } from "@/db/repositories/customer.repo";
import { SubscriptionsView } from "@/features/subscriptions/components/SubscriptionsView";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const [buckets, plans] = await Promise.all([
    getGymSubscriptionsGrouped(gymId),
    getActivePlans(gymId),
  ]);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Subscription Renewals & Expiries"
        description="Track member pass expiration timelines (7, 15, 30 days) and renew memberships instantly."
      />

      <SubscriptionsView buckets={buckets} plans={plans} />
    </FadeIn>
  );
}

