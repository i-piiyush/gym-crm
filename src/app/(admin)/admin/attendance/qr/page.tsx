import { FadeIn } from "@/components/motion/FadeIn";
import { QrCodeStation } from "@/features/attendance/components/QrCodeStation";
import { getPortalSession } from "@/lib/session";
import { generateQrToken } from "@/services/attendance/qr-token.service";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AttendanceQrPage() {
  const session = await getPortalSession("ADMIN");
  const gymId = session.gymId!;

  const tokenData = generateQrToken(gymId);

  // 1. Check process.env.NEXT_PUBLIC_APP_URL
  const rawEnvUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  let appUrl = rawEnvUrl;

  // 2. If NEXT_PUBLIC_APP_URL is not set or still default localhost, inspect incoming Host header
  if (!appUrl || appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || "http";
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      appUrl = `${proto}://${host}`;
    }
  }

  appUrl = appUrl || "http://localhost:3000";

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
