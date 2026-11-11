# Configuration (`src/config`)

Application-wide configuration files and validated runtime environments.

## Modules
- `env.ts`: Zod schema validating all client and server environment variables. Crashes fast at startup if required variables are missing or malformed.
- `site.ts`: Platform metadata, branding, and default SEO definitions.
- `constants.ts`: System defaults (e.g., default pagination limits, retry counts).
- `navigation.ts`: Static navigation item definitions mapped strictly to roles (`SUPER_ADMIN`, `ADMIN`, `TRAINER`, `CUSTOMER`).

