import { FadeIn } from "@/components/motion/FadeIn";
import { QrCodeStation } from "@/features/attendance/components/QrCodeStation";
import { getPortalSession } from "@/lib/session";
import { generateQrToken } from "@/services/attendance/qr-token.service";

export const dynamic = "force-dynamic";

export default async function AttendanceQrPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const tokenData = generateQrToken(gymId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <FadeIn className="max-w-2xl mx-auto py-4">
      <QrCodeStation
        gymId={gymId}
        gymName={session.gymName || "Gym Reception"}
        initialToken={tokenData.token}
        initialSecondsRemaining={tokenData.secondsRemaining}
        appUrl={appUrl}
      />
    </FadeIn>
  );
}

