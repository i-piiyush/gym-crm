import { z } from "zod";
import { emailSchema, idSchema, radiusSchema } from "./common.schema";

export const createGymSchema = z
  .object({
    name: z.string().trim().min(2, "Gym name must be at least 2 characters").max(100),
    address: z.string().trim().min(5, "Address must be at least 5 characters").max(300),
    latitude: z
      .number({ invalid_type_error: "Latitude is required and must be a number" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number({ invalid_type_error: "Longitude is required and must be a number" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    attendanceRadiusMeters: radiusSchema,
    timezone: z.string().default("Asia/Kolkata"),
    maxCustomers: z.number().int().min(5).max(500).default(50),
    receiptPrefix: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,8}$/, "Receipt prefix must be 2 to 8 alphanumeric characters")
      .default("REC"),
    ownerEmail: emailSchema,
  })
  .refine((data) => !(data.latitude === 0 && data.longitude === 0), {
    message: "Coordinates (0,0) are invalid.",
    path: ["latitude"],
  });

export const updateGymSchema = z
  .object({
    id: idSchema,
    name: z.string().trim().min(2, "Gym name must be at least 2 characters").max(100),
    address: z.string().trim().min(5, "Address must be at least 5 characters").max(300),
    latitude: z
      .number({ invalid_type_error: "Latitude is required and must be a number" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number({ invalid_type_error: "Longitude is required and must be a number" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    attendanceRadiusMeters: radiusSchema,
    receiptPrefix: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,8}$/, "Receipt prefix must be 2 to 8 alphanumeric characters"),
    status: z.enum(["ACTIVE", "SUSPENDED"]),
  })
  .refine((data) => !(data.latitude === 0 && data.longitude === 0), {
    message: "Coordinates (0,0) are invalid.",
    path: ["latitude"],
  });

export const gymStatusSchema = z.object({
  gymId: idSchema,
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const ownerInviteActionSchema = z.object({
  gymId: idSchema,
  email: emailSchema,
});

export type CreateGymInput = z.infer<typeof createGymSchema>;
export type UpdateGymInput = z.infer<typeof updateGymSchema>;
export type GymStatusInput = z.infer<typeof gymStatusSchema>;
export type OwnerInviteActionInput = z.infer<typeof ownerInviteActionSchema>;

