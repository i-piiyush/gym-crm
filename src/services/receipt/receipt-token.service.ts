import crypto from "crypto";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.RECEIPT_LINK_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("RECEIPT_LINK_SECRET must be at least 32 characters long");
  }
  return secret;
}

export function generateReceiptToken(paymentId: string): string {
  const secret = getSecret();
  const expiresAt = Date.now() + THIRTY_DAYS_MS;
  const payload = `${paymentId}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  // Format: base64(paymentId):expiresAt:signature
  const encodedId = Buffer.from(paymentId).toString("base64url");
  return `${encodedId}.${expiresAt}.${signature}`;
}

export function verifyReceiptToken(token: string): {
  isValid: boolean;
  paymentId?: string;
  reason?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { isValid: false, reason: "Malformed receipt token." };
    }

    const [encodedId, expiresAtStr, clientSignature] = parts;
    if (!encodedId || !expiresAtStr || !clientSignature) {
      return { isValid: false, reason: "Incomplete token components." };
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { isValid: false, reason: "Receipt download link has expired (valid for 30 days)." };
    }

    const paymentId = Buffer.from(encodedId, "base64url").toString("utf-8");
    const secret = getSecret();
    const payload = `${paymentId}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(clientSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );

    if (!isValid) {
      return { isValid: false, reason: "Invalid receipt token signature." };
    }

    return { isValid: true, paymentId };
  } catch {
    return { isValid: false, reason: "Failed to verify token." };
  }
}

