# Utility Library (`src/lib`)

Core reusable utilities, formatters, and server helpers.

## Modules
- `utils.ts`: Tailwind `cn` utility function combining `clsx` and `tailwind-merge`.
- `format.ts`: Currency (INR ₹), numbers, phone numbers (+91 display format), distance formatting (m / km).
- `date.ts`: Date manipulation using `date-fns` and `date-fns-tz` adhering to `Asia/Kolkata` gym timezone.
- `errors.ts`: Custom domain errors, API error normalization, user-safe error messages.
- `safe-action.ts`: Typed Server Action wrapper with authentication, Zod input validation, role enforcement, and error normalization.
- `rate-limit.ts`: In-memory or Upstash-compatible token-bucket rate limiter for check-in and email endpoints.

