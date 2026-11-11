# Prisma ORM & Database Layer (`prisma`)

Contains the Prisma schema, SQL migration history, and database seed script.

## Files
- `schema.prisma`: Complete multi-tenant relational schema for PostgreSQL.
- `migrations/`: Tracked SQL migration directory.
- `seed.ts`: Seed script populating:
  - 1 Super Admin (`SUPER_ADMIN_EMAILS`)
  - 2 Gyms with manual GPS coordinates and receipt prefixes
  - 1 Admin per gym
  - 2 Trainers per gym with active salary records
  - 10 Customers per gym with varied statuses (ACTIVE, TRIAL, EXPIRED, CANCELLED)
  - Sample attendance and payment records

