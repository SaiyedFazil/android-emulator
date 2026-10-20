// TODO(api): sample timestamps are fixed relative to this instant so prerendered and hydrated
// output match. Once data is live, format against the real current time instead.
export const SAMPLE_NOW = new Date("2026-10-19T09:00:00.000Z");

/** ISO timestamp `minutes` before SAMPLE_NOW — for building sample data. */
export function minutesAgo(minutes: number): string {
  return new Date(SAMPLE_NOW.getTime() - minutes * 60_000).toISOString();
}
