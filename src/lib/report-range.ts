import { addDays, differenceInCalendarDays, format, isValid, parseISO, subYears } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type ReportPeriod = "week" | "month" | "year" | "custom";
export interface ReportRange {
  period: ReportPeriod;
  start: string;
  end: string;
  today: string;
  label: string;
  error?: string;
}
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISO(value);
  return isValid(date) && format(date, "yyyy-MM-dd") === value;
}

export function resolveReportRange(params: Record<string, string | string[] | undefined>, timezone: string, now = new Date()): ReportRange {
  const local = toZonedTime(now, timezone);
  const today = format(local, "yyyy-MM-dd");
  const period: ReportPeriod = ["week", "month", "year", "custom"].includes(String(params.period)) ? params.period as ReportPeriod : "month";
  let start = format(addDays(local, -29), "yyyy-MM-dd");
  let end = today;
  if (period === "week") start = format(addDays(local, -6), "yyyy-MM-dd");
  if (period === "year") start = format(addDays(subYears(local, 1), 1), "yyyy-MM-dd");
  let error: string | undefined;
  if (period === "custom") {
    if (!validDate(params.start) || !validDate(params.end)) error = "Choose a valid start and end date.";
    else if (params.start > params.end) error = "The end date must be on or after the start date.";
    else if (params.end > today) error = "Choose an end date on or before today.";
    else if (differenceInCalendarDays(parseISO(params.end), parseISO(params.start)) > 3660) error = "Choose a date range of 10 years or less.";
    else { start = params.start; end = params.end; }
  }
  return { period, start, end, today, error, label: `${format(parseISO(start), "d MMM yyyy")} – ${format(parseISO(end), "d MMM yyyy")}` };
}

export function reportDateBounds(range: Pick<ReportRange, "start" | "end">, timezone: string) {
  return {
    start: fromZonedTime(`${range.start}T00:00:00`, timezone),
    endExclusive: fromZonedTime(`${format(addDays(parseISO(range.end), 1), "yyyy-MM-dd")}T00:00:00`, timezone),
  };
}
