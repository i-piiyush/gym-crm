import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncUserFromClerk } from "@/services/auth.service";
import * as attendanceRepo from "@/db/repositories/attendance.repo";
import prisma from "@/db/client";
import { formatInTimeZone } from "date-fns-tz";

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sync = await syncUserFromClerk(clerkId);
    if (!sync.user || (sync.user.role !== "ADMIN" && sync.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const gymId = sync.user.gymId;
    if (!gymId) {
      return NextResponse.json({ error: "Missing gym context" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");
    const roleFilter =
      roleParam === "TRAINER" || roleParam === "CUSTOMER" ? roleParam : undefined;

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { timezone: true },
    });

    const timezone = gym?.timezone || "Asia/Kolkata";
    const dateParam =
      searchParams.get("date") || formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");

    const records = await attendanceRepo.getLiveAttendanceRecords(
      gymId,
      dateParam,
      roleFilter
    );

    return NextResponse.json({
      records,
      date: dateParam,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

