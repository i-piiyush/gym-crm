import prisma from "@/db/client";
import { GymStatus, Prisma } from "@prisma/client";
import { GymListItem, GymDetailsView } from "@/types/gym.types";

export async function listAllGyms(): Promise<GymListItem[]> {
  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "ADMIN" },
        select: { id: true, name: true, email: true },
        take: 1,
      },
    },
  });

  // Fetch customer and pending invite counts in parallel
  const enriched = await Promise.all(
    gyms.map(async (gym) => {
      const [customerCount, pendingCustomerInvitesCount] = await Promise.all([
        prisma.customerProfile.count({
          where: { user: { gymId: gym.id } },
        }),
        prisma.invitation.count({
          where: { gymId: gym.id, role: "CUSTOMER", status: "PENDING" },
        }),
      ]);

      const ownerUser = gym.users[0] || null;

      return {
        id: gym.id,
        name: gym.name,
        address: gym.address,
        latitude: Number(gym.latitude),
        longitude: Number(gym.longitude),
        attendanceRadiusMeters: gym.attendanceRadiusMeters,
        timezone: gym.timezone,
        maxCustomers: gym.maxCustomers,
        status: gym.status,
        receiptPrefix: gym.receiptPrefix,
        customerCount,
        pendingCustomerInvitesCount,
        owner: ownerUser,
        pendingOwnerEmail: gym.pendingOwnerEmail,
        createdAt: gym.createdAt,
      };
    })
  );

  return enriched;
}

export async function getGymById(id: string): Promise<GymDetailsView | null> {
  const gym = await prisma.gym.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "ADMIN" },
        select: { id: true, name: true, email: true },
        take: 1,
      },
    },
  });

  if (!gym) return null;

  const owner = gym.users[0];

  return {
    id: gym.id,
    name: gym.name,
    address: gym.address,
    latitude: Number(gym.latitude),
    longitude: Number(gym.longitude),
    attendanceRadiusMeters: gym.attendanceRadiusMeters,
    timezone: gym.timezone,
    maxCustomers: gym.maxCustomers,
    status: gym.status,
    receiptPrefix: gym.receiptPrefix,
    ownerUserId: gym.ownerUserId,
    pendingOwnerEmail: gym.pendingOwnerEmail,
    ownerName: owner?.name,
    ownerEmail: owner?.email,
  };
}

export async function createGym(data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  attendanceRadiusMeters?: number;
  timezone?: string;
  maxCustomers?: number;
  receiptPrefix?: string;
  pendingOwnerEmail?: string | null;
}) {
  return prisma.gym.create({
    data: {
      name: data.name,
      address: data.address,
      latitude: new Prisma.Decimal(data.latitude),
      longitude: new Prisma.Decimal(data.longitude),
      attendanceRadiusMeters: data.attendanceRadiusMeters ?? 50,
      timezone: data.timezone ?? "Asia/Kolkata",
      maxCustomers: data.maxCustomers ?? 50,
      receiptPrefix: data.receiptPrefix ?? "REC",
      pendingOwnerEmail: data.pendingOwnerEmail ?? null,
    },
  });
}

export async function updateGym(
  id: string,
  data: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    attendanceRadiusMeters?: number;
    receiptPrefix?: string;
    status?: GymStatus;
  }
) {
  const updateData: Prisma.GymUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.latitude !== undefined) updateData.latitude = new Prisma.Decimal(data.latitude);
  if (data.longitude !== undefined) updateData.longitude = new Prisma.Decimal(data.longitude);
  if (data.attendanceRadiusMeters !== undefined)
    updateData.attendanceRadiusMeters = data.attendanceRadiusMeters;
  if (data.receiptPrefix !== undefined) updateData.receiptPrefix = data.receiptPrefix;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.gym.update({
    where: { id },
    data: updateData,
  });
}

export async function updateGymStatus(id: string, status: GymStatus) {
  return prisma.gym.update({
    where: { id },
    data: { status },
  });
}

export async function updatePendingOwnerEmail(id: string, email: string | null) {
  return prisma.gym.update({
    where: { id },
    data: { pendingOwnerEmail: email },
  });
}
