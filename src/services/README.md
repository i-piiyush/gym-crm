# Business Logic Services (`src/services`)

Framework-agnostic domain business logic invoked by Server Actions and Route Handlers.

## Structure
- `attendance/`:
  - `qr-token.service.ts`: HMAC-SHA256 token generation and dual-window verification (15-second rotating windows).
  - `geo.service.ts`: Haversine distance calculation and GPS accuracy gating.
  - `check-in.service.ts`: Check-in orchestration, membership status validation, daily check-in deduplication.
- `payment/`:
  - `payment.provider.ts`: Interface for payment processing (`createPayment`, `verifyPayment`, `refund`).
  - `demo.provider.ts`: Instant simulated checkout provider.
  - `razorpay.provider.ts`: Stub for Razorpay order generation and webhook verification.
  - `payment.service.ts`: Payment orchestration, plan renewal, receipt trigger.
- `email/`:
  - `email.provider.ts`: Outbound email delivery interface (`sendEmail`).
  - `gmail-smtp.provider.ts`: Nodemailer transport using Gmail SMTP and Google App Password.
  - `gmail-oauth.provider.ts`: Future per-owner Gmail API provider stub.
  - `email.service.ts`: Delivery orchestration, gym daily quota tracking, logging to `ReceiptDelivery`.
  - `templates/receipt.email.ts`: Responsive HTML + text email template for receipt delivery.
- `receipt/`:
  - `receipt.service.ts`: Receipt number sequencing and receipt PDF generation.
  - `receipt-pdf.tsx`: React-pdf document template for printable gym receipts.
  - `receipt-token.service.ts`: HMAC token signer and verifier for 30-day public receipt download links.
- `membership.service.ts`: Subscription calculations, expiry transitions, trial computation.
- `gym.service.ts`: Gym lifecycle, coordinate management, manual setup.
- `person.service.ts`: User invitation via Clerk Invitations API, profile provisioning, 50-customer capacity enforcement.
- `salary.service.ts`: Monthly trainer payroll calculation and settlement.
- `dashboard.service.ts`: Metric aggregation for admin overview and attention panel.

