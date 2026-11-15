import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserFromClerk } from "@/services/auth.service";
import { CheckInCard } from "@/features/attendance/components/CheckInCard";
import prisma from "@/db/client";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12 flex flex-col justify-between">
      <div className="mx-auto w-full max-w-md">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background font-semibold text-xs transition-transform group-hover:scale-105">
              G
            </div>
            <div>
              <span className="text-xs font-semibold tracking-tight text-foreground block">
                GYM-OS
              </span>
              <span className="text-[10px] text-dim block -mt-0.5">
                Attendance Check-in
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 rounded-full bg-honeydew/40 border border-[#B5D5BD] px-2.5 py-1 text-[11px] font-medium text-[#204E2B]">
            <ShieldCheck className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{sync.user.name}</span>
          </div>
        </div>

        {/* Check-In Card */}
        <CheckInCard
          initialToken={t || ""}
          gymName={gym?.name || "Facility"}
          userRole={sync.user.role}
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

      <div className="mt-8 text-center text-[11px] text-dim/60">
        GYM-OS Geofence Attendance Engine · 50m Secure Radius
      </div>
    </div>
  );
}
