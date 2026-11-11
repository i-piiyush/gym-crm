import { ATTENDANCE_RADIUS_METERS, MAX_GPS_ACCURACY_METERS } from "@/constants/attendance";

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula.
 * Returns distance in meters.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLng = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function verifyCoordinates({
  userCoords,
  gymCoords,
  accuracyMeters,
  attendanceRadiusMeters = ATTENDANCE_RADIUS_METERS,
}: {
  userCoords: Coordinates;
  gymCoords: Coordinates;
  accuracyMeters: number;
  attendanceRadiusMeters?: number;
}): {
  isValid: boolean;
  distanceMeters: number;
  accuracyMeters: number;
  reason?: string;
} {
  const distance = calculateHaversineDistance(userCoords, gymCoords);

  // 1. Gating by reported GPS accuracy
  if (accuracyMeters > MAX_GPS_ACCURACY_METERS) {
    return {
      isValid: false,
      distanceMeters: distance,
      accuracyMeters,
      reason: `GPS signal too weak (accuracy ±${Math.round(
        accuracyMeters
      )}m). Please move near a window or entrance and retry.`,
    };
  }

  // 2. Geofence radius gating
  if (distance > attendanceRadiusMeters) {
    return {
      isValid: false,
      distanceMeters: distance,
      accuracyMeters,
      reason: `You are ${distance}m away. Move within ${attendanceRadiusMeters}m of the gym and try again.`,
    };
  }

  return {
    isValid: true,
    distanceMeters: distance,
    accuracyMeters,
  };
}

