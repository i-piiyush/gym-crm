"use server";

import { createSafeAction } from "@/lib/safe-action";
import { createPlanSchema, updatePlanSchema } from "@/schemas/plan.schema";
import * as planRepo from "@/db/repositories/plan.repo";
import { revalidatePath } from "next/cache";

export const createPlanAction = createSafeAction({
  schema: createPlanSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const plan = await planRepo.createPlan(ctx.gymId!, input);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/people");
    return plan;
  },
});

export const updatePlanAction = createSafeAction({
  schema: updatePlanSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const plan = await planRepo.updatePlan(input.id, ctx.gymId!, input);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/people");
    return plan;
  },
});

