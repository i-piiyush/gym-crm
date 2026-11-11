# Database & Repositories (`src/db`)

Prisma Client initialization and data access layer.

## Structure
- `client.ts`: Prisma Client singleton ensuring connections are reused during Next.js hot-reloads.
- `repositories/`:
  - `gym.repo.ts`: Gym queries and coordinate fetches.
  - `user.repo.ts`: User profile, role checks, invitations.
  - `customer.repo.ts`: Customer profiles, active count checks in transactions.
  - `trainer.repo.ts`: Trainer profiles, salary agreements.
  - `attendance.repo.ts`: Daily check-in upserts, live polling feed, attendance aggregates.
  - `payment.repo.ts`: Payment transactions, sequential receipt numbering.
  - `plan.repo.ts`: Membership plans CRUD.
  - `receipt-delivery.repo.ts`: Audit log of email/download deliveries.
  - `salary.repo.ts`: Trainer payroll records.

## Rules
- Components and Server Actions must NEVER import from `src/db/`.
- All queries must be strictly scoped by `gymId` to ensure total tenant isolation.
- Capacity checks (50 max customers) must use database transactions (`prisma.$transaction`) to prevent race conditions during concurrent onboarding.

