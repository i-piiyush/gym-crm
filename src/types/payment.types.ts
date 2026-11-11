export type PaymentProviderType = "DEMO" | "RAZORPAY";
export type PaymentStatusType = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
export type DeliveryChannelType = "EMAIL" | "DOWNLOAD";
export type DeliveryStatusType = "PENDING" | "SENT" | "FAILED";

export interface CreatePaymentInput {
  gymId: string;
  customerId: string;
  planId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  emailReceipt?: boolean;
}

export interface PaymentResult {
  paymentId: string;
  receiptNumber: string;
  status: PaymentStatusType;
  providerPaymentId: string;
  paidAt: Date;
  receiptDeliveryStatus: DeliveryStatusType;
  receiptPdfBuffer?: Buffer;
}

export interface PaymentListItem {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string | null;
  planName: string;
  amount: number;
  provider: PaymentProviderType;
  status: PaymentStatusType;
  paidAt: Date;
  deliveryStatus: DeliveryStatusType;
  deliveryChannel: DeliveryChannelType;
  deliveryError: string | null;
}

