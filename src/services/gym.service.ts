import * as gymRepo from "@/db/repositories/gym.repo";
import { CreateGymInput, UpdateGymInput } from "@/schemas/gym.schema";
import { GymListItem, GymDetailsView } from "@/types/gym.types";
import { clerkClient } from "@clerk/nextjs/server";

export async function getAllGyms(): Promise<GymListItem[]> {
  return gymRepo.listAllGyms();
}

export async function getGymDetails(id: string): Promise<GymDetailsView | null> {
  return gymRepo.getGymById(id);
}

export async function createNewGym(input: CreateGymInput) {
  const normalizedOwnerEmail = input.ownerEmail.toLowerCase().trim();

  // Create gym in DB with pendingOwnerEmail
  const gym = await gymRepo.createGym({
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    attendanceRadiusMeters: input.attendanceRadiusMeters,
    timezone: input.timezone,
    maxCustomers: input.maxCustomers,
    receiptPrefix: input.receiptPrefix,
    pendingOwnerEmail: normalizedOwnerEmail,
  });

  // Try creating Clerk Invitation
  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: normalizedOwnerEmail,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin`,
      publicMetadata: {
        role: "ADMIN",
        gymId: gym.id,
      },
    });
  } catch (err) {
    // If Clerk Invitation fails (e.g. invalid test keys or duplicate in Clerk),
    // the DB pendingOwnerEmail still serves as the source of truth for first-login fallback sync!
    console.warn("Clerk invitation dispatch skipped or failed:", err);
  }

  return gym;
}

export async function updateGym(input: UpdateGymInput) {
  return gymRepo.updateGym(input.id, {
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    attendanceRadiusMeters: input.attendanceRadiusMeters,
    receiptPrefix: input.receiptPrefix,
    status: input.status,
  });
}

export async function toggleGymStatus(gymId: string, status: "ACTIVE" | "SUSPENDED") {
  return gymRepo.updateGymStatus(gymId, status);
}

export async function resendOwnerInvite(gymId: string, email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  await gymRepo.updatePendingOwnerEmail(gymId, normalizedEmail);

  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: normalizedEmail,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin`,
      publicMetadata: {
        role: "ADMIN",
        gymId,
      },
    });
  } catch (err) {
    console.warn("Clerk invitation dispatch skipped or failed:", err);
  }

  return { email: normalizedEmail };
}

export async function revokeOwnerInvite(gymId: string) {
  return gymRepo.updatePendingOwnerEmail(gymId, null);
}

