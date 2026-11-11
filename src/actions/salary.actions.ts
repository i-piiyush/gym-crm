"use server";

import { createSafeAction } from "@/lib/safe-action";
import { markSalaryPaidSchema } from "@/schemas/salary.schema";
import * as salaryService from "@/services/salary.service";
import { revalidatePath } from "next/cache";

export const markSalaryPaidAction = createSafeAction({
  schema: markSalaryPaidSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const record = await salaryService.markSalaryPaid(ctx.gymId!, input.salaryRecordId);
    revalidatePath("/admin/salaries");
    revalidatePath("/admin");
    return { id: record.id, status: record.status, paidAt: record.paidAt };
  },
});

