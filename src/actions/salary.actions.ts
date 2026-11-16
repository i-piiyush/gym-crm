"use server";

import { createSafeAction } from "@/lib/safe-action";
import { markSalaryPaidSchema, updateTrainerHolidayRateSchema } from "@/schemas/salary.schema";
import { setTrainerHolidayDeduction } from "@/db/repositories/salary.repo";
import * as salaryService from "@/services/salary.service";
import { revalidatePath } from "next/cache";

export const markSalaryPaidAction = createSafeAction({
  schema: markSalaryPaidSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const record = await salaryService.markSalaryPaid(ctx.gymId!, input.salaryRecordId, input.expectedAmount);
    revalidatePath("/admin/salaries");
    revalidatePath("/admin");
    revalidatePath("/trainer");
    revalidatePath("/trainer/salary");
    return { id: record.id, status: record.status, paidAt: record.paidAt, amount: Number(record.amount),
      baseAmount: Number(record.baseAmount ?? record.amount), holidayDays: record.holidayDays,
      holidayDeductionPerDay: Number(record.holidayDeductionPerDay), deductionAmount: Number(record.deductionAmount) };
  },
});

export const updateTrainerHolidayRateAction = createSafeAction({
  schema: updateTrainerHolidayRateSchema, allowedRoles: ["ADMIN"], requireGymId: true,
  handler: async (input, ctx) => {
    const result = await setTrainerHolidayDeduction(ctx.gymId!, input.trainerId, input.holidayDeductionPerDay);
    for (const path of ["/admin/staff", "/admin/people", "/admin/salaries", "/admin", "/trainer", "/trainer/salary"]) revalidatePath(path);
    return result;
  },
});

