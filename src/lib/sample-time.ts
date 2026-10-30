import dayjs from "@/lib/dayjs";

// TODO(api): sample timestamps are fixed relative to this instant so prerendered and hydrated
// output match. Live data formats against the real current time instead (`useNow`).
export const SAMPLE_NOW = dayjs.utc("2026-10-19T09:00:00.000Z");

/** ISO timestamp `minutes` before SAMPLE_NOW — for building sample data. */
export function minutesAgo(minutes: number): string {
  return SAMPLE_NOW.subtract(minutes, "minute").toISOString();
}

/** ISO timestamp `days` before SAMPLE_NOW. */
export function daysAgo(days: number): string {
  return SAMPLE_NOW.subtract(days, "day").toISOString();
}

/** ISO timestamp `days` after SAMPLE_NOW — renewals, trial ends, due dates. */
export function daysFromNow(days: number): string {
  return SAMPLE_NOW.add(days, "day").toISOString();
}
