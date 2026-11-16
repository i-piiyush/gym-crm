# Trainer leave and salary deductions

In **Admin → Staff** or the **Trainers** tab in People, each trainer has a **Manage leave** button. Select an inclusive date range, choose paid/unpaid leave with the searchable shadcn-style combobox, and optionally add a reason. The recorded leave list supports a month filter and removal. Saving an overlapping date range updates the existing records.

Configure **Deduction per day without a check-in (₹)** when inviting a trainer. Existing trainers have an **Edit** link beneath their compensation; pending rows in **Salaries** also offer **Edit rate**. The default ₹0 leaves salary unchanged. Changing the rate recalculates all pending records and applies to future records.

Payroll counts every completed calendar day without a check-in, including weekends, from the trainer's gym-local joining date. Today and future days do not count. Paid leave excuses a missed check-in; unpaid leave counts once. A recorded check-in takes priority over either leave type.

For example, ₹30,000 base salary at ₹250 per missed day with three unexcused missed days gives a ₹750 deduction and ₹29,250 payable. Deductions are capped at the base salary. The admin payroll page, dashboard pending total, trainer overview, and salary history use the net payable amount; statement tables show the calculation breakdown.

Marking paid validates the reviewed net amount against the latest server calculation. A changed amount requires refreshing and reviewing again. Paid statements remain immutable; their leave dates cannot be edited or removed. Changes to other pending periods remain available.

## Database update

The additive migration is `prisma/migrations/20261116_trainer_holiday_deductions/migration.sql`. For an existing database using this repository's schema:

```sh
npx prisma db execute --file prisma/migrations/20261116_trainer_holiday_deductions/migration.sql --schema prisma/schema.prisma
npm run db:generate
```

The migration adds daily-rate and calculation snapshot fields plus the leave table. It backfills existing base salaries from their recorded amounts and preserves existing payment status, net amount, and paid timestamp. It does not reset or seed data. This repository did not have an initial migration baseline, so this SQL requires the existing core tables; it is not a standalone empty-database bootstrap.

## Verification

```sh
npm run check:payroll
npm run check:payroll:db
npm run check:combobox
npx prisma validate
npx tsc --noEmit
```

The pure checks cover money precision/capping, schema validation, leap dates, and leave ranges. The database checks create isolated fixtures inside one transaction and deliberately roll back every change, including simulated salary payments. They verify timezone boundaries, attendance versus leave, idempotent payroll generation, tenant boundaries, pending recalculation, stale-payment rejection, and paid-record locking. They require the additive migration and a reachable database; they send no invitations or messages.
