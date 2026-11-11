import prisma from "@/db/client";
import { Prisma } from "@prisma/client";
import {
  AttendanceRecordView,
  MonthlyAttendanceSummary,
} from "@/types/attendance.types";
import { UserRoleType } from "@/constants/roles";

export async function upsertAttendance(data: {
  gymId: string;
  userId: string;
  date: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  distanceMeters: number;
  ipAddress?: string | null;
}) {
  return prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: data.userId,
        date: data.date,
      },
    },
    update: {
      // If already marked today, update audit info but preserve initial checkInAt
      ipAddress: data.ipAddress ?? undefined,
    },
    create: {
      gymId: data.gymId,
      userId: data.userId,
      date: data.date,
      latitude: new Prisma.Decimal(data.latitude),
      longitude: new Prisma.Decimal(data.longitude),
      accuracyMeters: new Prisma.Decimal(data.accuracyMeters),
      distanceMeters: new Prisma.Decimal(data.distanceMeters),
      ipAddress: data.ipAddress ?? null,
    },
  });
}

export async function findAttendanceForDate(userId: string, date: string) {
  return prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
  });
}

export async function getLiveAttendanceRecords(
  gymId: string,
  date: string,
  roleFilter?: "TRAINER" | "CUSTOMER"
): Promise<AttendanceRecordView[]> {
  const where: Prisma.AttendanceWhereInput = {
    gymId,
    date,
  };

  if (roleFilter) {
    where.user = { role: roleFilter };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { checkInAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    userRole: r.user.role as UserRoleType,
    userEmail: r.user.email,
    date: r.date,
    checkInAt: r.checkInAt,
    distanceMeters: Number(r.distanceMeters),
    accuracyMeters: Number(r.accuracyMeters),
    flagged: r.flagged,
    flagReason: r.flagReason,
  }));
}

export async function getMonthlySummary(
  gymId: string,
  monthPrefix: string // Format "YYYY-MM"
): Promise<MonthlyAttendanceSummary[]> {
  // Get all active users of this gym
  const users = await prisma.user.findMany({
    where: {
      gymId,
      role: { in: ["TRAINER", "CUSTOMER"] },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      role: true,
      attendances: {
        where: {
          date: { startsWith: monthPrefix },
        },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate days in the given month
  const [yearStr, monthStr] = monthPrefix.split("-");
  const year = parseInt(yearStr || "2026", 10);
  const month = parseInt(monthStr || "1", 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  return users.map((u) => {
    const daysPresent = u.attendances.length;
    return {
      userId: u.id,
      userName: u.name,
      userRole: u.role as UserRoleType,
      daysPresent,
      totalDaysInMonth: daysInMonth,
      attendancePercentage: Math.round((daysPresent / daysInMonth) * 100),
    };
  });
}

