"use server";

import { createSafeAction } from "@/lib/safe-action";
import {
  createGymSchema,
  updateGymSchema,
  gymStatusSchema,
  ownerInviteActionSchema,
} from "@/schemas/gym.schema";
import * as gymService from "@/services/gym.service";
import { revalidatePath } from "next/cache";

export const createGymAction = createSafeAction({
  schema: createGymSchema,
  allowedRoles: ["SUPER_ADMIN"],
  handler: async (input) => {
    const gym = await gymService.createNewGym(input);
    revalidatePath("/super-admin/gyms");
    return gym;
  },
});

export const updateGymAction = createSafeAction({
  schema: updateGymSchema,
  allowedRoles: ["SUPER_ADMIN"],
  handler: async (input) => {
    const gym = await gymService.updateGym(input);
    revalidatePath("/super-admin/gyms");
    revalidatePath(`/super-admin/gyms/${input.id}`);
    return gym;
  },
});

export const toggleGymStatusAction = createSafeAction({
  schema: gymStatusSchema,
  allowedRoles: ["SUPER_ADMIN"],
  handler: async (input) => {
    const gym = await gymService.toggleGymStatus(input.gymId, input.status);
    revalidatePath("/super-admin/gyms");
    return gym;
  },
});

export const resendOwnerInviteAction = createSafeAction({
  schema: ownerInviteActionSchema,
  allowedRoles: ["SUPER_ADMIN"],
  handler: async (input) => {
    const result = await gymService.resendOwnerInvite(input.gymId, input.email);
    revalidatePath("/super-admin/gyms");
    return result;
  },
});

export const revokeOwnerInviteAction = createSafeAction({
  schema: ownerInviteActionSchema.pick({ gymId: true }),
  allowedRoles: ["SUPER_ADMIN"],
  handler: async (input) => {
    const result = await gymService.revokeOwnerInvite(input.gymId);
    revalidatePath("/super-admin/gyms");
    return result;
  },
});

