import crypto from "crypto";

const QR_WINDOW_MS = 15 * 1000; // 15 seconds

function getSecret(): string {
  const secret = process.env.QR_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("QR_TOKEN_SECRET must be at least 32 characters long");
  }
  return secret;
}

function computeHmac(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function generateQrToken(gymId: string, nowMs = Date.now()) {
  const secret = getSecret();
  const windowStart = Math.floor(nowMs / QR_WINDOW_MS) * QR_WINDOW_MS;
  const timeIntoWindow = nowMs - windowStart;
  const secondsRemaining = Math.max(0, Math.ceil((QR_WINDOW_MS - timeIntoWindow) / 1000));

  const payload = `${gymId}:${windowStart}`;
  const signature = computeHmac(payload, secret);
  const token = `${windowStart}.${signature}`;

  return {
    token,
    windowStart,
    secondsRemaining: secondsRemaining === 0 ? 15 : secondsRemaining,
    totalSeconds: 15,
  };
}

export function verifyQrToken(
  token: string,
  expectedGymId: string,
  nowMs = Date.now()
): { isValid: boolean; reason?: string } {
  if (!token || !token.includes(".")) {
    return { isValid: false, reason: "Malformed QR token." };
  }

  const [windowStartStr, clientSignature] = token.split(".");
  if (!windowStartStr || !clientSignature) {
    return { isValid: false, reason: "Invalid token structure." };
  }

  const windowStart = parseInt(windowStartStr, 10);
  if (isNaN(windowStart)) {
    return { isValid: false, reason: "Invalid window timestamp." };
  }

  // Dual-window validation: Allow current window and immediate previous window (15s + 15s = 30s validity)
  const currentWindowStart = Math.floor(nowMs / QR_WINDOW_MS) * QR_WINDOW_MS;
  const previousWindowStart = currentWindowStart - QR_WINDOW_MS;

  if (windowStart !== currentWindowStart && windowStart !== previousWindowStart) {
    return {
      isValid: false,
      reason: "QR code has expired. Please rescan the latest QR on display.",
    };
  }

  const secret = getSecret();
  const expectedPayload = `${expectedGymId}:${windowStart}`;
  const expectedSignature = computeHmac(expectedPayload, secret);

  const isValid = crypto.timingSafeEqual(
    Buffer.from(clientSignature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );

  if (!isValid) {
    return {
      isValid: false,
      reason: "Invalid QR code signature for your registered gym facility.",
    };
  }

  return { isValid: true };
}

