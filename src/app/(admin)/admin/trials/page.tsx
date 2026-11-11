import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import { getGymTrials } from "@/services/membership.service";
import { getActivePlans } from "@/db/repositories/customer.repo";
import { TrialsTable } from "@/features/trials/components/TrialsTable";

export const dynamic = "force-dynamic";

export default async function AdminTrialsPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const [trials, plans] = await Promise.all([
    getGymTrials(gymId),
    getActivePlans(gymId),
  ]);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Free Trial Members"
        description="Monitor trial expiration countdowns and convert trial visitors into paying subscribers."
      />

      <TrialsTable trials={trials} plans={plans} />
    </FadeIn>
  );
}

