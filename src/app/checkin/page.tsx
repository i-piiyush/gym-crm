import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserFromClerk } from "@/services/auth.service";
import { CheckInCard } from "@/features/attendance/components/CheckInCard";
import prisma from "@/db/client";
import { ROUTES } from "@/constants/routes";
import { LuDumbbell } from "react-icons/lu";

export const dynamic = "force-dynamic";

interface CheckInPageProps {
  searchParams: Promise<{ t?: string }>;
}

export default async function CheckInPage({ searchParams }: CheckInPageProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    const { t } = await searchParams;
    const returnUrl = t ? `/checkin?t=${encodeURIComponent(t)}` : "/checkin";
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
  }

  const sync = await syncUserFromClerk(clerkUser.id);
  if (sync.notInvited || !sync.user || !sync.user.gymId) {
    redirect(ROUTES.NOT_INVITED);
  }

  const gym = await prisma.gym.findUnique({
    where: { id: sync.user.gymId },
    select: { name: true, latitude: true, longitude: true },
  });

  const { t } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8 dark:bg-slate-950 sm:p-6 lg:p-12">
      <div className="mx-auto max-w-lg mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LuDumbbell className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground">
              {gym?.name || "Gym CRM"}
            </span>
            <p className="text-[11px] text-muted-foreground">
              Signed in as {sync.user.name} ({sync.user.role})
            </p>
          </div>
        </div>
      </div>

      <CheckInCard
        initialToken={t || ""}
        gymName={gym?.name || "Gym"}
        gymCoords={
          gym
            ? {
                latitude: Number(gym.latitude),
                longitude: Number(gym.longitude),
              }
            : undefined
        }
      />
    </div>
  );
}

