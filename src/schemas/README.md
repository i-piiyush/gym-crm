# Validation Schemas (`src/schemas`)

Single source of truth for validation schemas across client and server.

## Files
- `index.ts`: Barrel export of all domain schemas.
- `gym.schema.ts`: Gym creation, location coordinates validation (-90..90, -180..180, non-zero), radius.
- `person.schema.ts`: Base user schema, invitation schema.
- `customer.schema.ts`: Customer creation, trainer assignment, plan selection, trial options.
- `trainer.schema.ts`: Trainer onboarding, salary, salaryDueDay.
- `attendance.schema.ts`: Geolocation payload validation (lat, lng, accuracy, token).
- `payment.schema.ts`: Payment initiation, method, amount, plan attachment.
- `plan.schema.ts`: Membership plan definitions (duration, price).
- `salary.schema.ts`: Monthly salary payout record validation.
- `receipt.schema.ts`: PDF receipt payload and download token schema.
- `email.schema.ts`: Outbound email request schema.
- `common.schema.ts`: Reusable building blocks: E.164 phone number, RFC 5322 email, coordinate pairs, cuid/uuid regex.

## Rules
- Zod schemas NEVER live inside components or actions.
- Schemas export inferred types only using `z.infer<typeof ...>` if tightly coupled to form inputs. Hand-written domain/view models live in `src/types/`.

