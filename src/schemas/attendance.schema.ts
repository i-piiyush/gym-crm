import { z } from "zod";

export const checkInSchema = z.object({
  token: z.string().min(10, "Invalid QR check-in token"),
  latitude: z
    .number({ invalid_type_error: "Latitude must be a valid number" })
    .min(-90)
    .max(90),
  longitude: z
    .number({ invalid_type_error: "Longitude must be a valid number" })
    .min(-180)
    .max(180),
  accuracy: z
    .number({ invalid_type_error: "Accuracy must be a valid number" })
    .min(0, "Accuracy cannot be negative"),
});

export const attendanceFilterSchema = z.object({
  role: z.enum(["ALL", "TRAINER", "CUSTOMER"]).optional().default("ALL"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD")
    .optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must be formatted as YYYY-MM")
    .optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;

