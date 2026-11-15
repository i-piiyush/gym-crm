import { getPortalSession } from "@/lib/session";
import { getPeoplePageData } from "@/services/person.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrainersTable } from "@/features/people/components/TrainersTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function StaffPage() {
  const session = await getPortalSession("ADMIN");
  const data = await getPeoplePageData(session.gymId!, {
    maxCustomers: session.maxCustomers ?? 50,
    name: session.gymName ?? "Gym",
  });
  return (
    <div className="space-y-7">
      <PageHeader
        title="Staff"
        description={`${data.trainers.length} coaches helping your community get stronger.`}
        action={
          <Button asChild>
            <Link href="/admin/people?add=true">
              <Plus />
              Invite staff
            </Link>
          </Button>
        }
      />
      <TrainersTable
        trainers={data.trainers}
        allTrainers={data.trainerOptions}
      />
    </div>
  );
}
