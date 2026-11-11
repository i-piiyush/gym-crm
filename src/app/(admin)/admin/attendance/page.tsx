import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { LiveAttendanceView } from "@/features/attendance/components/LiveAttendanceView";
import { getPortalSession } from "@/lib/session";
import * as attendanceRepo from "@/db/repositories/attendance.repo";
import prisma from "@/db/client";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { LuQrCode } from "react-icons/lu";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { timezone: true },
  });

  const timezone = gym?.timezone || "Asia/Kolkata";
  const todayStr = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  const currentMonth = formatInTimeZone(new Date(), timezone, "yyyy-MM");

  const [initialRecords, monthlySummaries] = await Promise.all([
    attendanceRepo.getLiveAttendanceRecords(gymId, todayStr),
    attendanceRepo.getMonthlySummary(gymId, currentMonth),
  ]);

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        title="Attendance & Geofence Logs"
        description="Monitor live member and trainer check-ins, verify physical distance from gym geofence, and inspect monthly attendance."
        action={
          <Link
            href={ROUTES.ADMIN.ATTENDANCE_QR}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <LuQrCode className="h-4 w-4" />
            <span>Launch Attendance QR</span>
          </Link>
        }
      />

      <LiveAttendanceView
        gymId={gymId}
        initialRecords={initialRecords}
        initialDate={todayStr}
        monthlySummaries={monthlySummaries}
      />
    </FadeIn>
  );
}

