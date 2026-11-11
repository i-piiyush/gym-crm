import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserFromClerk } from "@/services/auth.service";
import prisma from "@/db/client";
import { UserRoleType } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export interface PortalSession {
  userId: string;
  clerkId: string;
  email: string;
  name: string;
  role: UserRoleType;
  gymId: string | null;
  gymName?: string;
  timezone?: string;
  maxCustomers?: number;
}

/**
 * High-performance, request-memoized session resolver.
 * - Uses auth() for 0ms local JWT decoding (eliminates HTTPS round-trip to Clerk).
 * - Uses React cache() so layout and page share a single execution.
 * - Performs a single joined DB query for User + Gym.
 */
export const getPortalSession = cache(
  async (expectedRole: UserRoleType): Promise<PortalSession> => {
    const { userId } = await auth();

    if (!userId) {
      redirect(ROUTES.SIGN_IN);
    }

    // 1. Single joined query: user + gym
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        gym: {
          select: { name: true, status: true, timezone: true, maxCustomers: true },
        },
      },
    });

    // 2. Fallback for first login / un-synced user
    if (!user || user.status !== "ACTIVE" || !user.role) {
      const syncResult = await syncUserFromClerk(userId);
      if (syncResult.notInvited || !syncResult.user) {
        redirect(ROUTES.NOT_INVITED);
      }
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          gym: {
            select: { name: true, status: true, timezone: true, maxCustomers: true },
          },
        },
      });
    }

    if (!user || user.role !== expectedRole) {
      redirect(ROUTES.NOT_INVITED);
    }

    if (user.gym?.status === "SUSPENDED" && expectedRole !== "SUPER_ADMIN") {
      redirect("/not-invited?reason=suspended");
    }

    return {
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role as UserRoleType,
      gymId: user.gymId,
      gymName: user.gym?.name,
      timezone: user.gym?.timezone,
      maxCustomers: user.gym?.maxCustomers,
    };
  }
);
