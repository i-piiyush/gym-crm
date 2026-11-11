import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { EditGymForm } from "@/features/super-admin/components/EditGymForm";
import { getGymDetails } from "@/services/gym.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditGymPageProps {
  params: Promise<{ gymId: string }>;
}

export default async function EditGymPage({ params }: EditGymPageProps) {
  const { gymId } = await params;
  const gym = await getGymDetails(gymId);

  if (!gym) {
    notFound();
  }

  return (
    <FadeIn className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Edit Gym: ${gym.name}`}
        description="Update operational address, attendance geofence radius, coordinates, or tenant status."
      />

      <EditGymForm gym={gym} />
    </FadeIn>
  );
}

