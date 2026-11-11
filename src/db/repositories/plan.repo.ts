import prisma from "@/db/client";
import { Prisma } from "@prisma/client";

export async function listPlansByGym(gymId: string) {
  return prisma.membershipPlan.findMany({
    where: { gymId },
    orderBy: { price: "asc" },
  });
}

export async function getPlanById(id: string, gymId?: string) {
  return prisma.membershipPlan.findFirst({
    where: {
      id,
      ...(gymId ? { gymId } : {}),
    },
  });
}

export async function createPlan(
  gymId: string,
  data: {
    name: string;
    durationDays: number;
    price: number;
    isActive?: boolean;
  }
) {
  return prisma.membershipPlan.create({
    data: {
      gymId,
      name: data.name,
      durationDays: data.durationDays,
      price: new Prisma.Decimal(data.price),
      isActive: data.isActive ?? true,
    },
  });
}

export async function updatePlan(
  id: string,
  gymId: string,
  data: {
    name: string;
    durationDays: number;
    price: number;
    isActive: boolean;
  }
) {
  return prisma.membershipPlan.update({
    where: { id },
    data: {
      name: data.name,
      durationDays: data.durationDays,
      price: new Prisma.Decimal(data.price),
      isActive: data.isActive,
    },
  });
}

