import { verifyReceiptToken } from "@/services/receipt/receipt-token.service";
import { getPaymentPdfBuffer } from "@/services/payment/payment.service";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    const verification = verifyReceiptToken(token);
    if (!verification.isValid || !verification.paymentId) {
      return new Response(verification.reason || "Invalid or expired receipt download token.", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const { filename, buffer } = await getPaymentPdfBuffer(verification.paymentId);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load receipt PDF";
    return new Response(message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

