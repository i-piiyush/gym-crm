BEGIN;

ALTER TABLE "TrainerProfile"
  ADD COLUMN IF NOT EXISTS "holidayDeductionPerDay" DECIMAL(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE "SalaryRecord"
  ADD COLUMN IF NOT EXISTS "baseAmount" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "holidayDeductionPerDay" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "holidayDays" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "deductionAmount" DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Preserve every existing net salary and payment status.
UPDATE "SalaryRecord" SET "baseAmount" = "amount" WHERE "baseAmount" IS NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrainerLeaveType') THEN
    CREATE TYPE "TrainerLeaveType" AS ENUM ('PAID', 'UNPAID');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "TrainerLeave" (
  "id" TEXT NOT NULL,
  "gymId" TEXT NOT NULL,
  "trainerId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "type" "TrainerLeaveType" NOT NULL DEFAULT 'UNPAID',
  "reason" TEXT,
  "markedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrainerLeave_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TrainerLeave_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainerLeave_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainerLeave_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TrainerLeave_trainerId_date_key" ON "TrainerLeave"("trainerId", "date");
CREATE INDEX IF NOT EXISTS "TrainerLeave_gymId_date_idx" ON "TrainerLeave"("gymId", "date");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TrainerProfile_holiday_rate_nonnegative') THEN
    ALTER TABLE "TrainerProfile" ADD CONSTRAINT "TrainerProfile_holiday_rate_nonnegative"
      CHECK ("holidayDeductionPerDay" >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SalaryRecord_holiday_deduction_valid') THEN
    ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_holiday_deduction_valid"
      CHECK (
        "holidayDays" BETWEEN 0 AND 31
        AND "holidayDeductionPerDay" >= 0
        AND "deductionAmount" >= 0
        AND "amount" >= 0
        AND ("baseAmount" IS NULL OR (
          "baseAmount" >= "deductionAmount"
          AND "amount" = "baseAmount" - "deductionAmount"
        ))
      );
  END IF;
END $$;

COMMIT;
