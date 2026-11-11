# Server Actions (`src/actions`)

Server-side entry points for mutations and user-initiated actions.

## Rules
- One file per domain:
  - `gym.actions.ts`
  - `person.actions.ts`
  - `attendance.actions.ts`
  - `payment.actions.ts`
  - `salary.actions.ts`
  - `plan.actions.ts`
  - `receipt.actions.ts`
- Must use `'use server'` directive at the top of each file.
- Handled through `createSafeAction`:
  1. Authenticate user session with Clerk (`auth()`).
  2. Verify user role and tenant context from database (`db/repositories/user.repo.ts`).
  3. Validate input payload strictly with Zod schema (`src/schemas/*`).
  4. Ensure tenant isolation (resource must belong to authenticated gymId).
  5. Call domain service (`src/services/*`).
  6. Return typed response `ActionResult<T>` (`src/types/api.types.ts`).
- Server actions must NEVER contain raw business logic or direct ORM queries.

