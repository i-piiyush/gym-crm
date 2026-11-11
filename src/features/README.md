# Feature Modules (`src/features`)

Feature-sliced modules containing feature-specific presentation components and client-side hooks.

## Guidelines
- Each domain module contains:
  - `components/`: UI components dedicated exclusively to this domain.
  - `hooks/`: Feature-local React hooks for UI state, form management, and queries.
- Feature components never perform direct database access.
- Mutations are triggered by calling Server Actions (`src/actions/*`) wrapped in safe-action helpers.
- Forms use `react-hook-form` with resolvers from `src/schemas/*`.
- Feedback is provided exclusively via `sonner` toasts and inline validation messages.

