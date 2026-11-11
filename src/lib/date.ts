import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const DEFAULT_GYM_TIMEZONE = "Asia/Kolkata";

/**
 * Returns today's date formatted as YYYY-MM-DD in the gym's local timezone.
 */
export function getGymTodayDate(timezone: string = DEFAULT_GYM_TIMEZONE): string {
  const zoned = toZonedTime(new Date(), timezone);
  return format(zoned, "yyyy-MM-dd");
}

/**
 * Returns current month formatted as YYYY-MM in the gym's local timezone.
 */
export function getGymCurrentMonth(timezone: string = DEFAULT_GYM_TIMEZONE): string {
  const zoned = toZonedTime(new Date(), timezone);
  return format(zoned, "yyyy-MM");
}

/**
 * Formats a Date into a human-readable string.
 */
export function formatDate(date: Date | string | null | undefined, fmt: string = "dd MMM yyyy"): string {
  if (!date) return "—";
  return format(new Date(date), fmt);
}

