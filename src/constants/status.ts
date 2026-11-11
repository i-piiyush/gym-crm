export const GymStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export const UserStatus = {
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const CustomerStatus = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
} as const;

export const PaymentStatus = {
  PAID: "PAID",
  PENDING: "PENDING",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const DeliveryStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
} as const;

export const SalaryStatus = {
  PAID: "PAID",
  PENDING: "PENDING",
} as const;

