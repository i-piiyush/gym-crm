import prisma from "@/db/client";
import { GymStatus, Prisma } from "@prisma/client";
import { GymListItem, GymDetailsView } from "@/types/gym.types";

export async function listAllGyms(): Promise<GymListItem[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      address: string;
      latitude: Prisma.Decimal;
      longitude: Prisma.Decimal;
      attendanceRadiusMeters: number;
      timezone: string;
      maxCustomers: number;
      status: GymStatus;
      receiptPrefix: string;
      pendingOwnerEmail: string | null;
      createdAt: Date;
      customerCount: bigint;
      pendingCustomerInvitesCount: bigint;
      ownerId: string | null;
      ownerName: string | null;
      ownerEmail: string | null;
    }>
  >`
    SELECT 
      g.id,
      g.name,
      g.address,
      g.latitude,
      g.longitude,
      g."attendanceRadiusMeters",
      g.timezone,
      g."maxCustomers",
      g.status,
      g."receiptPrefix",
      g."pendingOwnerEmail",
      g."createdAt",
      (SELECT COUNT(*) FROM "CustomerProfile" cp JOIN "User" u ON u.id = cp."userId" WHERE u."gymId" = g.id) AS "customerCount",
      (SELECT COUNT(*) FROM "Invitation" i WHERE i."gymId" = g.id AND i.role = 'CUSTOMER' AND i.status = 'PENDING') AS "pendingCustomerInvitesCount",
      owner.id AS "ownerId",
      owner.name AS "ownerName",
      owner.email AS "ownerEmail"
    FROM "Gym" g
    LEFT JOIN LATERAL (
      SELECT u.id, u.name, u.email
      FROM "User" u
      WHERE u."gymId" = g.id AND u.role = 'ADMIN'
      LIMIT 1
    ) owner ON true
    ORDER BY g."createdAt" DESC
  `;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    attendanceRadiusMeters: r.attendanceRadiusMeters,
    timezone: r.timezone,
    maxCustomers: r.maxCustomers,
    status: r.status,
    receiptPrefix: r.receiptPrefix,
    customerCount: Number(r.customerCount),
    pendingCustomerInvitesCount: Number(r.pendingCustomerInvitesCount),
    owner: r.ownerId
      ? { id: r.ownerId, name: r.ownerName ?? "Admin", email: r.ownerEmail ?? "" }
      : null,
    pendingOwnerEmail: r.pendingOwnerEmail,
    createdAt: r.createdAt,
  }));
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

/**
 * Consolidated 1-roundtrip query for the Gym Settings page.
 * Returns facility details, owner info, and all membership plans in a single query.
 */
export async function getGymSettingsData(gymId: string): Promise<{
  gym: GymDetailsView | null;
  plans: Array<{
    id: string;
    name: string;
    durationDays: number;
    price: number;
    isActive: boolean;
  }>;
}> {
  const rows = await prisma.$queryRaw<
    {
      gym: {
        id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        attendanceRadiusMeters: number;
        timezone: string;
        maxCustomers: number;
        status: any;
        receiptPrefix: string;
        ownerUserId: string | null;
        pendingOwnerEmail: string | null;
        ownerName?: string;
        ownerEmail?: string;
      } | null;
      plans: Array<{
        id: string;
        name: string;
        durationDays: number;
        price: number;
        isActive: boolean;
      }>;
    }[]
  >`
    SELECT
      (
        SELECT row_to_json(g)
        FROM (
          SELECT 
            gym."id",
            gym."name",
            gym."address",
            gym."latitude"::double precision AS "latitude",
            gym."longitude"::double precision AS "longitude",
            gym."attendanceRadiusMeters",
            gym."timezone",
            gym."maxCustomers",
            gym."status",
            gym."receiptPrefix",
            admin_u."id" AS "ownerUserId",
            gym."pendingOwnerEmail",
            admin_u."name" AS "ownerName",
            admin_u."email" AS "ownerEmail"
          FROM "Gym" gym
          LEFT JOIN "User" admin_u ON admin_u."gymId" = gym."id" AND admin_u."role" = 'ADMIN'
          WHERE gym."id" = ${gymId}
          LIMIT 1
        ) g
      ) AS "gym",
      (
        SELECT COALESCE(json_agg(p), '[]'::json)
        FROM (
          SELECT 
            "id",
            "name",
            "durationDays",
            "price"::double precision AS "price",
            "isActive"
          FROM "MembershipPlan"
          WHERE "gymId" = ${gymId}
          ORDER BY "price" ASC
        ) p
      ) AS "plans"
  `;

  const row = rows[0];
  return {
    gym: row?.gym
      ? {
          ...row.gym,
          latitude: Number(row.gym.latitude),
          longitude: Number(row.gym.longitude),
          attendanceRadiusMeters: Number(row.gym.attendanceRadiusMeters),
          maxCustomers: Number(row.gym.maxCustomers),
        }
      : null,
    plans: (row?.plans || []).map((p) => ({
      ...p,
      durationDays: Number(p.durationDays),
      price: Number(p.price),
    })),
  };
}
