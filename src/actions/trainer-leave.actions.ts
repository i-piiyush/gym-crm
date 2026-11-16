"use server";

import { createSafeAction } from "@/lib/safe-action";
import { listTrainerLeavesSchema, markTrainerLeaveSchema, removeTrainerLeaveSchema } from "@/schemas/trainer-leave.schema";
import * as leaveRepo from "@/db/repositories/trainer-leave.repo";
import { revalidatePath } from "next/cache";

function refreshLeavePages() {
  for (const path of ["/admin/staff", "/admin/people", "/admin/salaries", "/admin", "/trainer", "/trainer/salary"]) revalidatePath(path);
}

export const listTrainerLeavesAction = createSafeAction({
  schema: listTrainerLeavesSchema, allowedRoles: ["ADMIN"], requireGymId: true,
  handler: (input, ctx) => leaveRepo.listTrainerLeaves(ctx.gymId!, input.trainerId, input.month),
});

export const markTrainerLeaveAction = createSafeAction({
  schema: markTrainerLeaveSchema, allowedRoles: ["ADMIN"], requireGymId: true,
  handler: async (input, ctx) => {
    const result = await leaveRepo.markTrainerLeave(ctx.gymId!, ctx.user.id, input);
    refreshLeavePages();
    return result;
  },
});

export const removeTrainerLeaveAction = createSafeAction({
  schema: removeTrainerLeaveSchema, allowedRoles: ["ADMIN"], requireGymId: true,
  handler: async (input, ctx) => {
    const result = await leaveRepo.removeTrainerLeave(ctx.gymId!, input.leaveId);
    refreshLeavePages();
    return result;
  },
});
