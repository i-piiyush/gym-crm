# Next.js App Router (`src/app`)

## Architectural Rules
- **Routing ONLY**: Contains pages, layouts, templates, and API route handlers.
- **Zero Business Logic**: Pages and route handlers must never execute direct business logic, SQL queries, or direct database mutations.
- **Data Flow**:
  - Route handlers / Server Actions: Authenticate via Clerk -> Validate payload via Zod schemas (`src/schemas`) -> Delegate to domain service (`src/services`) -> Return `ActionResult<T>` (`src/types/api.types.ts`).
  - Pages: Render layout shells, call Server Actions or domain services for initial server-rendered data, and mount feature components (`src/features/*`).

## Routes Structure
- `(auth)/`: Unauthenticated sign-in and sign-up flows managed by Clerk.
- `(super-admin)/super-admin/`: Platform owner routes (gym management, coordinate configuration, owner invitations).
- `(admin)/admin/`: Gym owner portal (people, payments, salaries, trials, subscriptions, attendance, QR station, settings).
- `(trainer)/trainer/`: Trainer portal (assigned customers, personal check-in, attendance logs, salary history).
- `(customer)/customer/`: Customer portal (membership status, personal check-in, attendance calendar, payment receipts).
- `checkin/`: Dynamic mobile QR landing page for location-verified check-in.
- `api/`: Route handlers for Clerk webhooks, attendance check-in, today's polling feed, membership expiry cron, and signed PDF receipt downloads.

