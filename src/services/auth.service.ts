import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/db/client";
import { UserRole, UserStatus, InvitationStatus } from "@prisma/client";
import { UserSessionContext } from "@/types/auth.types";
import { UserRoleType } from "@/constants/roles";

export interface SyncUserResult {
  user: UserSessionContext | null;
  notInvited: boolean;
}

/**
 * Idempotently synchronizes a Clerk user into the PostgreSQL database.
 * Derives role and gymId strictly from server-side Invitations, pending gym owner state,
 * or SUPER_ADMIN_EMAILS bootstrap list.
 */
export async function syncUserFromClerk(clerkId: string): Promise<SyncUserResult> {
  // 1. Fast path: Check existing DB user by clerkId FIRST before making any Clerk API calls
  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingByClerk && existingByClerk.status === UserStatus.ACTIVE && existingByClerk.role) {
    return {
      user: {
        id: existingByClerk.id,
        clerkId: existingByClerk.clerkId,
        email: existingByClerk.email,
        name: existingByClerk.name,
        role: existingByClerk.role as UserRoleType,
        gymId: existingByClerk.gymId,
        status: existingByClerk.status,
      },
      notInvited: false,
    };
  }

  // 2. Slow path: Only hit Clerk API on first login / un-synced user
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);

  const primaryEmailObj = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  ) || clerkUser.emailAddresses[0];

  if (!primaryEmailObj) {
    throw new Error(`Clerk user ${clerkId} has no email address.`);
  }

  const email = primaryEmailObj.emailAddress.toLowerCase().trim();
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    "User";

  // Check if a record with this email already exists (e.g. from seed or created by email)
  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });

  // Safe helper: updates existing user by email to associate real clerkId, or creates new
  const linkOrUpsert = async (data: {
    role: UserRole;
    gymId: string | null;
    status: UserStatus;
  }) => {
    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkId,
          name,
          role: data.role,
          gymId: data.gymId ?? existingByEmail.gymId,
          status: data.status,
        },
      });
    }

    return prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        name,
        role: data.role,
        gymId: data.gymId,
        status: data.status,
      },
      create: {
        clerkId,
        email,
        name,
        role: data.role,
        gymId: data.gymId,
        status: data.status,
      },
    });
  };

  // 2. Check Super Admin bootstrap
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (superAdminEmails.includes(email)) {
    const user = await linkOrUpsert({
      role: UserRole.SUPER_ADMIN,
      gymId: null,
      status: UserStatus.ACTIVE,
    });

    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: UserRole.SUPER_ADMIN,
        gymId: null,
      },
    });

    return {
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role as UserRoleType,
        gymId: null,
        status: user.status,
      },
      notInvited: false,
    };
  }

  // 3. Check Pending Gym Owner match
  const pendingGym = await prisma.gym.findFirst({
    where: {
      pendingOwnerEmail: {
        equals: email,
        mode: "insensitive",
      },
      status: "ACTIVE",
    },
  });

  if (pendingGym) {
    const user = await linkOrUpsert({
      role: UserRole.ADMIN,
      gymId: pendingGym.id,
      status: UserStatus.ACTIVE,
    });

    // Clear pendingOwnerEmail and link ownerUserId
    await prisma.gym.update({
      where: { id: pendingGym.id },
      data: {
        ownerUserId: user.id,
        pendingOwnerEmail: null,
      },
    });

    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: UserRole.ADMIN,
        gymId: pendingGym.id,
      },
    });

    return {
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role as UserRoleType,
        gymId: user.gymId,
        status: user.status,
      },
      notInvited: false,
    };
  }

  // 4. Check Invitation record match
  const invitation = await prisma.invitation.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      status: InvitationStatus.PENDING,
    },
    include: { gym: true },
  });

  if (invitation) {
    const user = await linkOrUpsert({
      role: invitation.role,
      gymId: invitation.gymId,
      status: UserStatus.ACTIVE,
    });

    // Mark invitation accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });

    // Ensure trainer profile if TRAINER
    if (invitation.role === UserRole.TRAINER) {
      await prisma.trainerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          monthlySalary: 0,
          salaryDueDay: 1,
        },
      });
    }

    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: invitation.role,
        gymId: invitation.gymId,
      },
    });

    return {
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role as UserRoleType,
        gymId: user.gymId,
        status: user.status,
      },
      notInvited: false,
    };
  }

  // 5. Not invited: User has signed in with an unauthorized email
  return {
    user: null,
    notInvited: true,
  };
}
