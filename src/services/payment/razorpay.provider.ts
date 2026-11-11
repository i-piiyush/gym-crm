import { PaymentProvider } from "./payment.provider";
import { CreatePaymentInput, PaymentResult } from "@/types/payment.types";

/**
 * STUB: Razorpay Payment Provider
 *
 * Production Integration Architecture:
 * 1. Initialize Razorpay instance:
 *    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
 * 2. Create Order:
 *    const order = await instance.orders.create({
 *      amount: input.amount * 100, // in paise
 *      currency: "INR",
 *      receipt: `order_${Date.now()}`,
 *      notes: { gymId: input.gymId, customerId: input.customerId, planId: input.planId }
 *    });
 * 3. Client captures checkout via Razorpay Checkout Modal (https://checkout.razorpay.com/v1/checkout.js).
 * 4. Verify Signature:
 *    HMAC-SHA256 of (order_id + "|" + payment_id) with RAZORPAY_KEY_SECRET matching razorpay_signature.
 * 5. Handle Webhooks:
 *    Verify x-razorpay-signature header with RAZORPAY_WEBHOOK_SECRET.
 */
export class RazorpayProvider implements PaymentProvider {
  name = "razorpay" as const;

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    console.warn(
      "RazorpayProvider is currently a stub. To process simulated payments, set PAYMENT_PROVIDER=demo."
    );

    throw new Error(
      "Razorpay gateway credentials are not yet configured for live capture."
    );
  }

  async verifyPayment(payload: unknown, signature: string): Promise<boolean> {
    return false;
  }

  async refund(paymentId: string, amount?: number): Promise<boolean> {
    return false;
  }
}

export const razorpayProvider = new RazorpayProvider();

