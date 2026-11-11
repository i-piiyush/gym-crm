import prisma from "@/db/client";
import { CheckInInput } from "@/schemas/attendance.schema";
import { CheckInResult } from "@/types/attendance.types";
import { verifyQrToken } from "./qr-token.service";
import { verifyCoordinates } from "./geo.service";
import * as attendanceRepo from "@/db/repositories/attendance.repo";
import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

export async function processCheckIn({
  userId,
  input,
  ipAddress,
}: {
  userId: string;
  input: CheckInInput;
  ipAddress?: string | null;
}): Promise<CheckInResult> {
  // 1. Fetch user & gym context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gym: true,
      customerProfile: true,
    },
  });

  if (!user || !user.gymId || !user.gym) {
    throw new Error("You are not associated with an active gym.");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Your account status is currently inactive. Contact your gym administrator.");
  }

  if (user.gym.status !== "ACTIVE") {
    throw new Error("This gym facility is currently suspended.");
  }

  // 2. Customer membership validation
  if (user.role === "CUSTOMER" && user.customerProfile) {
    const profile = user.customerProfile;
    const now = new Date();

    if (profile.status === "EXPIRED") {
      throw new Error("Your gym membership has expired. Please renew your membership to check in.");
    }

    if (profile.status === "CANCELLED") {
      throw new Error("Your membership was cancelled. Please speak with reception.");
    }

    if (profile.status === "TRIAL" && profile.trialEndsAt && profile.trialEndsAt < now) {
      throw new Error(
        `Your trial period expired on ${format(
          profile.trialEndsAt,
          "dd MMM yyyy"
        )}. Please enroll in a membership plan.`
      );
    }

    if (profile.status === "ACTIVE" && profile.membershipEnd && profile.membershipEnd < now) {
      throw new Error(
        `Your membership expired on ${format(
          profile.membershipEnd,
          "dd MMM yyyy"
        )}. Please renew to check in.`
      );
    }
  }

  // 3. QR Token Verification (dual-window tolerance)
  const tokenVerification = verifyQrToken(input.token, user.gymId);
  if (!tokenVerification.isValid) {
    throw new Error(tokenVerification.reason || "Invalid QR code. Please scan the current code on display.");
  }

  // 4. Compute gym-local date YYYY-MM-DD
  const gymTimezone = user.gym.timezone || "Asia/Kolkata";
  const localDate = formatInTimeZone(new Date(), gymTimezone, "yyyy-MM-dd");

  // 5. Check if already marked today (idempotent daily attendance)
  const existingAttendance = await attendanceRepo.findAttendanceForDate(user.id, localDate);
  if (existingAttendance) {
    return {
      alreadyMarked: true,
      distanceMeters: Number(existingAttendance.distanceMeters),
      accuracyMeters: Number(existingAttendance.accuracyMeters),
      checkInAt: existingAttendance.checkInAt,
      gymName: user.gym.name,
      userName: user.name,
      message: "Attendance has already been marked for today!",
    };
  }

  // 6. Geolocation & Accuracy Verification
  const gymCoords = {
    latitude: Number(user.gym.latitude),
    longitude: Number(user.gym.longitude),
  };

  const geoVerification = verifyCoordinates({
    userCoords: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    gymCoords,
    accuracyMeters: input.accuracy,
    attendanceRadiusMeters: user.gym.attendanceRadiusMeters,
  });

  if (!geoVerification.isValid) {
    throw new Error(geoVerification.reason || "You are outside the attendance check-in radius.");
  }

  // 7. Save Attendance Record
  const record = await attendanceRepo.upsertAttendance({
    gymId: user.gymId,
    userId: user.id,
    date: localDate,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracyMeters: geoVerification.accuracyMeters,
    distanceMeters: geoVerification.distanceMeters,
    ipAddress: ipAddress ?? null,
  });

  return {
    alreadyMarked: false,
    distanceMeters: geoVerification.distanceMeters,
    accuracyMeters: geoVerification.accuracyMeters,
    checkInAt: record.checkInAt,
    gymName: user.gym.name,
    userName: user.name,
    message: "Attendance marked successfully!",
  };
}

