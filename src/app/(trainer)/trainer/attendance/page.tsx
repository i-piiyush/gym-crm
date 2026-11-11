import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPortalSession } from "@/lib/session";
import prisma from "@/db/client";
import { TrainerAttendanceView } from "@/features/trainer/components/TrainerAttendanceView";

export const dynamic = "force-dynamic";

export default async function TrainerAttendancePage() {
  const session = await getPortalSession("TRAINER");

  const rawAttendances = await prisma.attendance.findMany({
    where: { userId: session.userId },
    orderBy: { checkInAt: "desc" },
    take: 60,
  });

  const attendances = rawAttendances.map((a) => ({
    ...a,
    latitude: Number(a.latitude),
    longitude: Number(a.longitude),
    accuracyMeters: Number(a.accuracyMeters),
    distanceMeters: Number(a.distanceMeters),
  }));

  return (
    <FadeIn className="space-y-6 max-w-5xl">
      <PageHeader
        title="Trainer Shift Attendance"
        description="Review all personal attendance records, reception check-in timestamps, and shift logs."
      />

      <TrainerAttendanceView attendances={attendances} />
    </FadeIn>
  );
}

