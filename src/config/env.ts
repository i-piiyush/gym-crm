import { z } from "zod";

const serverSchema = z
  .object({
    // Database
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL"),
    DIRECT_URL: z.string().url("DIRECT_URL must be a valid direct connection URL").optional(),

    // Clerk Server Secrets
    CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1, "CLERK_WEBHOOK_SIGNING_SECRET is required"),

    // Security Secrets (min 32 chars)
    QR_TOKEN_SECRET: z.string().min(32, "QR_TOKEN_SECRET must be at least 32 characters long"),
    RECEIPT_LINK_SECRET: z.string().min(32, "RECEIPT_LINK_SECRET must be at least 32 characters long"),
    CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters long"),

    // Super Admin Bootstrap
    SUPER_ADMIN_EMAILS: z
      .string()
      .min(1, "SUPER_ADMIN_EMAILS is required (comma-separated list)")
      .transform((val) =>
        val
          .split(",")
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean)
      ),

    // Regional Defaults
    DEFAULT_TIMEZONE: z.string().default("Asia/Kolkata"),
    DEFAULT_COUNTRY_CODE: z.string().default("+91"),

    // Dev-only Geolocation Simulator (strictly forbidden in production)
    ENABLE_GEO_SIMULATOR: z
      .string()
      .optional()
      .default("false")
      .transform((val) => val === "true" || val === "1"),

    // Payments
    PAYMENT_PROVIDER: z.enum(["demo", "razorpay"]).default("demo"),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

    // Email
    EMAIL_PROVIDER: z.enum(["gmail-smtp", "gmail-oauth"]).default("gmail-smtp"),
    GMAIL_SMTP_USER: z.string().email("GMAIL_SMTP_USER must be a valid email").optional(),
    GMAIL_SMTP_APP_PASSWORD: z.string().min(16, "GMAIL_SMTP_APP_PASSWORD must be a 16-character App Password").optional(),
    EMAIL_FROM_NAME_DEFAULT: z.string().default("Gym CRM"),
    GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  })
  .refine(
    (data) => {
      if (process.env.NODE_ENV === "production" && data.ENABLE_GEO_SIMULATOR) {
        return false;
      }
      return true;
    },
    {
      message: "FATAL CONFIGURATION ERROR: ENABLE_GEO_SIMULATOR cannot be enabled in production environments.",
      path: ["ENABLE_GEO_SIMULATOR"],
    }
  );

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().default("/"),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().default("/"),
  NEXT_PUBLIC_ENABLE_GEO_SIMULATOR: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true" || val === "1"),
});

/**
 * Validates environment variables and provides strict types.
 * Runs at startup to fail fast on configuration errors.
 */
function validateEnv() {
  const isServer = typeof window === "undefined";

  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/",
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/",
    NEXT_PUBLIC_ENABLE_GEO_SIMULATOR: process.env.NEXT_PUBLIC_ENABLE_GEO_SIMULATOR,
  });

  if (!clientResult.success) {
    console.error("❌ Invalid client environment variables:", clientResult.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables. Check terminal logs.");
  }

  if (isServer) {
    const serverResult = serverSchema.safeParse(process.env);
    if (!serverResult.success) {
      console.error("❌ Invalid server environment variables:", serverResult.error.flatten().fieldErrors);
      throw new Error("Invalid server environment variables. Check terminal logs.");
    }

    return {
      ...clientResult.data,
      ...serverResult.data,
      isServer: true as const,
    };
  }

  return {
    ...clientResult.data,
    isServer: false as const,
  };
}

export const env = validateEnv();
export type Env = ReturnType<typeof validateEnv>;
