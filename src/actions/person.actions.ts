"use server";

import { createSafeAction } from "@/lib/safe-action";
import { addPersonSchema, removePersonSchema } from "@/schemas/person.schema";
import { reassignCustomerTrainerSchema } from "@/schemas/customer.schema";
import { idSchema } from "@/schemas/common.schema";
import * as personService from "@/services/person.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const addPersonAction = createSafeAction({
  schema: addPersonSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const result = await personService.addPerson(ctx.gymId!, ctx.user.id, input);
    revalidatePath("/admin/people");
    return result;
  },
});

export const removePersonAction = createSafeAction({
  schema: removePersonSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const result = await personService.removePerson(ctx.gymId!, input);
    revalidatePath("/admin/people");
    return result;
  },
});

export const reassignTrainerAction = createSafeAction({
  schema: reassignCustomerTrainerSchema,
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const result = await personService.reassignCustomerTrainer(
      ctx.gymId!,
      input.customerId,
      input.newTrainerId
    );
    revalidatePath("/admin/people");
    return result;
  },
});

export const revokeInviteAction = createSafeAction({
  schema: z.object({ invitationId: idSchema }),
  allowedRoles: ["ADMIN"],
  requireGymId: true,
  handler: async (input, ctx) => {
    const result = await personService.revokeInvite(ctx.gymId!, input.invitationId);
    revalidatePath("/admin/people");
    return result;
  },
});

