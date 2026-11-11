import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { syncUserFromClerk } from "@/services/auth.service";
import { ActionResult } from "@/types/api.types";
import { UserRoleType } from "@/constants/roles";
import { UserSessionContext } from "@/types/auth.types";

interface SafeActionContext {
  user: UserSessionContext;
  gymId: string | null;
}

interface CreateActionOptions<TSchema extends z.ZodTypeAny, TOutput> {
  schema: TSchema;
  allowedRoles?: UserRoleType[];
  requireGymId?: boolean;
  handler: (input: z.output<TSchema>, ctx: SafeActionContext) => Promise<TOutput>;
}

export function createSafeAction<TSchema extends z.ZodTypeAny, TOutput>({
  schema,
  allowedRoles,
  requireGymId = false,
  handler,
}: CreateActionOptions<TSchema, TOutput>) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return {
          success: false,
          error: "Authentication required. Please sign in.",
          code: "UNAUTHORIZED",
        };
      }

      const syncResult = await syncUserFromClerk(userId);

      if (syncResult.notInvited || !syncResult.user) {
        return {
          success: false,
          error: "Your account is not linked to an active gym.",
          code: "NOT_INVITED",
        };
      }

      const user = syncResult.user;

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return {
          success: false,
          error: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        };
      }

      if (requireGymId && !user.gymId && user.role !== "SUPER_ADMIN") {
        return {
          success: false,
          error: "Gym context missing for this operation.",
          code: "MISSING_GYM_CONTEXT",
        };
      }

      const parseResult = schema.safeParse(input);

      if (!parseResult.success) {
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        const flattened = Object.values(fieldErrors).flat();
        const firstErrorMsg =
          typeof flattened[0] === "string" ? flattened[0] : "Invalid input payload";

        return {
          success: false,
          error: firstErrorMsg,
          code: "VALIDATION_ERROR",
          validationErrors: fieldErrors as Record<string, string[]>,
        };
      }

      const data = await handler(parseResult.data, {
        user,
        gymId: user.gymId,
      });

      return {
        success: true,
        data,
      };
    } catch (err: unknown) {
      console.error("Safe action error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      return {
        success: false,
        error: message,
        code: "INTERNAL_ERROR",
      };
    }
  };
}
