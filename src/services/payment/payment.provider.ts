import { CreatePaymentInput, PaymentResult } from "@/types/payment.types";

export interface PaymentProvider {
  name: "demo" | "razorpay";
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  verifyPayment(payload: unknown, signature: string): Promise<boolean>;
  refund(paymentId: string, amount?: number): Promise<boolean>;
}

