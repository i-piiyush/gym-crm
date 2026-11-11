import prisma from "@/db/client";
import { UserRole, InvitationStatus, Prisma } from "@prisma/client";
import { PendingInviteItem } from "@/types/person.types";

export async function createInvitation(
  data: {
    gymId: string;
    email: string;
    role: UserRole;
    invitedById: string;
    clerkInvitationId?: string | null;
  },
  tx?: Prisma.TransactionClient
) {
  const db = tx ?? prisma;
  return db.invitation.create({
    data: {
      gymId: data.gymId,
      email: data.email.toLowerCase().trim(),
      role: data.role,
      invitedById: data.invitedById,
      clerkInvitationId: data.clerkInvitationId,
      status: InvitationStatus.PENDING,
    },
  });
}

export async function listPendingInvitations(
  gymId: string,
  role?: UserRole
): Promise<PendingInviteItem[]> {
  const where: Prisma.InvitationWhereInput = {
    gymId,
    status: InvitationStatus.PENDING,
  };

  if (role) {
    where.role = role;
  }

  const invites = await prisma.invitation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return invites.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    createdAt: inv.createdAt,
  }));
}

export async function revokeInvitation(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.REVOKED },
  });
}

export async function findPendingInvitationByEmail(email: string, gymId: string) {
  return prisma.invitation.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      gymId,
      status: InvitationStatus.PENDING,
    },
  });
}

