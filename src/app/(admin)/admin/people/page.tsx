import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { PeopleView } from "@/features/people/components/PeopleView";
import { getPeoplePageData } from "@/services/person.service";
import { getPortalSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const session = await getPortalSession("ADMIN");
  const data = await getPeoplePageData(session.gymId!);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="People & Staff Management"
        description="Manage enrolled trainers, customer memberships, mandatory trainer assignments, and invitations."
      />

      <PeopleView
        trainers={data.trainers}
        customers={data.customers}
        capacity={data.capacity}
        trainerOptions={data.trainerOptions}
        plans={data.plans}
        pendingInvites={data.pendingInvites}
      />
    </FadeIn>
  );
}

