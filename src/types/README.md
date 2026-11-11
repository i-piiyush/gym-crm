# Type Definitions (`src/types`)

Centralized TypeScript types for domain entities, auth claims, API responses, and external providers.

## Structure
- `index.ts`: Barrel export.
- `auth.types.ts`: Clerk user metadata extensions, session payload, role enums.
- `gym.types.ts`: Gym entity views, coordinate interfaces.
- `person.types.ts`: Person/user view models, trainer and customer profile views.
- `attendance.types.ts`: Check-in results, live attendance feed payload, QR token claims.
- `payment.types.ts`: Transaction views, provider response abstractions.
- `email.types.ts`: Outbound email options, delivery results.
- `api.types.ts`: Standardized server action & API responses:
  - `ActionResult<T> = { success: true; data: T } | { success: false; error: string; code?: string; validationErrors?: Record<string, string[]> }`
  - `ApiError`: Error payload format.

## Rules
- No runtime code in this folder (pure TypeScript declarations and types).
- Inferred Zod input types stay in `src/schemas/`; domain, view, and interface types reside here.

