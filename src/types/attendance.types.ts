import { UserRoleType } from "@/constants/roles";

export interface CheckInPayload {
  token: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface CheckInResult {
  alreadyMarked: boolean;
  distanceMeters: number;
  accuracyMeters: number;
  checkInAt: Date;
  gymName: string;
  userName: string;
  message: string;
}

export interface AttendanceRecordView {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRoleType;
  userEmail: string;
  date: string;
  checkInAt: Date;
  distanceMeters: number;
  accuracyMeters: number;
  flagged: boolean;
  flagReason: string | null;
}

export interface MonthlyAttendanceSummary {
  userId: string;
  userName: string;
  userRole: UserRoleType;
  daysPresent: number;
  totalDaysInMonth: number;
  attendancePercentage: number;
}

