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
      _count: {
        select: {
          attendances: {
            where: {
              date: { startsWith: monthPrefix },
            },
          },
        },
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
    const daysPresent = u._count.attendances;
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

/**
 * Consolidated 1-roundtrip query for the Admin Attendance page.
 * Fetches live records for today + monthly attendance aggregation in a single query.
 */
export async function getAttendancePageData(
  gymId: string,
  date: string,
  monthPrefix: string
): Promise<{
  initialRecords: AttendanceRecordView[];
  monthlySummaries: MonthlyAttendanceSummary[];
}> {
  const [yearStr, monthStr] = monthPrefix.split("-");
  const year = parseInt(yearStr || "2026", 10);
  const month = parseInt(monthStr || "1", 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const rows = await prisma.$queryRaw<
    {
      live_records: Array<{
        id: string;
        userId: string;
        userName: string;
        userRole: string;
        userEmail: string;
        date: string;
        checkInAt: string | Date;
        distanceMeters: number;
        accuracyMeters: number;
        flagged: boolean;
        flagReason: string | null;
      }>;
      monthly_summaries: Array<{
        userId: string;
        userName: string;
        userRole: string;
        daysPresent: number;
      }>;
    }[]
  >`
    SELECT
      (
        SELECT COALESCE(json_agg(t), '[]'::json)
        FROM (
          SELECT 
            a."id",
            a."userId",
            u."name" AS "userName",
            u."role" AS "userRole",
            u."email" AS "userEmail",
            a."date",
            a."checkInAt",
            a."distanceMeters"::double precision AS "distanceMeters",
            a."accuracyMeters"::double precision AS "accuracyMeters",
            a."flagged",
            a."flagReason"
          FROM "Attendance" a
          JOIN "User" u ON u."id" = a."userId"
          WHERE a."gymId" = ${gymId} AND a."date" = ${date}
          ORDER BY a."checkInAt" DESC
        ) t
      ) AS "live_records",
      (
        SELECT COALESCE(json_agg(m), '[]'::json)
        FROM (
          SELECT
            u."id" AS "userId",
            u."name" AS "userName",
            u."role" AS "userRole",
            COUNT(a."id")::int AS "daysPresent"
          FROM "User" u
          LEFT JOIN "Attendance" a ON a."userId" = u."id" AND a."gymId" = ${gymId} AND a."date" LIKE ${monthPrefix + "%"}
          WHERE u."gymId" = ${gymId} AND u."role" IN ('TRAINER', 'CUSTOMER') AND u."status" = 'ACTIVE'
          GROUP BY u."id", u."name", u."role"
          ORDER BY u."name" ASC
        ) m
      ) AS "monthly_summaries"
  `;

  const row = rows[0];
  const initialRecords: AttendanceRecordView[] = (row?.live_records || []).map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userRole: r.userRole as UserRoleType,
    userEmail: r.userEmail,
    date: r.date,
    checkInAt: new Date(r.checkInAt),
    distanceMeters: Number(r.distanceMeters),
    accuracyMeters: Number(r.accuracyMeters),
    flagged: r.flagged,
    flagReason: r.flagReason,
  }));

  const monthlySummaries: MonthlyAttendanceSummary[] = (row?.monthly_summaries || []).map((u) => {
    const daysPresent = Number(u.daysPresent);
    return {
      userId: u.userId,
      userName: u.userName,
      userRole: u.userRole as UserRoleType,
      daysPresent,
      totalDaysInMonth: daysInMonth,
      attendancePercentage: Math.round((daysPresent / daysInMonth) * 100),
    };
  });

  return { initialRecords, monthlySummaries };
}

