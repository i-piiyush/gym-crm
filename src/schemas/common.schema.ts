import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

export const phoneSchema = z
  .string()
  .trim()
  .transform((val) => {
    if (!val) return null;
    const clean = val.replace(/[\s-]/g, "");
    if (!clean.startsWith("+")) {
      return `+91${clean}`;
    }
    return clean;
  })
  .refine(
    (val) => {
      if (!val) return true;
      return /^\+[1-9]\d{7,14}$/.test(val);
    },
    { message: "Please enter a valid phone number in E.164 format (e.g. +919876543210)" }
  )
  .nullable()
  .optional();

export const idSchema = z.string().min(1, "Identifier is required");

export const coordinatesSchema = z
  .object({
    latitude: z
      .number({ invalid_type_error: "Latitude must be a valid number" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number({ invalid_type_error: "Longitude must be a valid number" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
  })
  .refine(
    (coords) => !(coords.latitude === 0 && coords.longitude === 0),
    { message: "Coordinates (0, 0) are invalid (Null Island)" }
  );

export const radiusSchema = z
  .number({ invalid_type_error: "Radius must be a number" })
  .int("Radius must be an integer")
  .min(10, "Minimum geofence radius is 10 meters")
  .max(500, "Maximum geofence radius is 500 meters")
  .default(50);

