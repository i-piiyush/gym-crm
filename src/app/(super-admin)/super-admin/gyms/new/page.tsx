import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { CreateGymForm } from "@/features/super-admin/components/CreateGymForm";

export const dynamic = "force-dynamic";

export default function NewGymPage() {
  return (
    <FadeIn className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create New Gym"
        description="Configure a new tenant facility, specify exact manual GPS coordinates, and invite the gym owner."
      />

      <CreateGymForm />
    </FadeIn>
  );
}

