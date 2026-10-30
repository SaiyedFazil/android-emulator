import dayjs, { type ConfigType } from "@/lib/dayjs";

const DATE_FORMAT = "MMM D, YYYY";
const DATE_TIME_FORMAT = "MMM D, YYYY, h:mm A";
const MONTH_YEAR_FORMAT = "MMMM YYYY";
const JUST_NOW_SECONDS = 60;

/** "2 minutes ago", "3 days ago" — under a minute reads "just now". The same in every time zone. */
export function formatRelativeTime(value: ConfigType, now: ConfigType): string {
  const time = dayjs(value);
  return Math.abs(time.diff(now, "second")) < JUST_NOW_SECONDS ? "just now" : time.from(now);
}

/**
 * A date in the viewer's time zone. Without one (prerender, before hydration) it is the UTC date,
 * so server and browser render the same text until `<LocalTime>` switches to the viewer's zone.
 */
function inZone(value: ConfigType, timeZone: string | null | undefined) {
  return timeZone ? dayjs(value).tz(timeZone) : dayjs.utc(value);
}

/** "Oct 19, 2026, 2:30 PM" in `timeZone`; "Oct 19, 2026, 9:00 AM UTC" without one. */
export function formatDateTime(value: ConfigType, timeZone?: string | null): string {
  const text = inZone(value, timeZone).format(DATE_TIME_FORMAT);
  return timeZone ? text : `${text} UTC`;
}

/** "Oct 19, 2026" — the calendar date in `timeZone` (UTC without one). */
export function formatDate(value: ConfigType, timeZone?: string | null): string {
  return inZone(value, timeZone).format(DATE_FORMAT);
}

/** "October 2026" in `timeZone` (UTC without one). */
export function formatMonthYear(value: ConfigType, timeZone?: string | null): string {
  return inZone(value, timeZone).format(MONTH_YEAR_FORMAT);
}

// TODO(api): a single currency until billing supports more.
export const CURRENCY = "USD";

const money = (fractionDigits: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
const wholeDollars = money(0);
const withCents = money(2);
const compactMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Amounts are integer cents: 4900 → "$49", 4950 → "$49.50", compact 1290000 → "$12.9K". */
export function formatCurrency(cents: number, options: { compact?: boolean } = {}): string {
  const dollars = cents / 100;
  if (options.compact) return compactMoney.format(dollars);
  return (cents % 100 === 0 ? wholeDollars : withCents).format(dollars);
}

/** A plan price; `null` means it is negotiated per customer. */
export function formatPrice(cents: number | null): string {
  return cents === null ? "Custom" : formatCurrency(cents);
}
