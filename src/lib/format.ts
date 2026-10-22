const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "2 minutes ago", "yesterday", "3 days ago" — under a minute reads "just now". */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

// Pinned to UTC (and labelled) so prerendered HTML and every viewer agree, wherever they are.
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatDateTime(iso: string): string {
  return `${dateTime.format(new Date(iso))} UTC`;
}

const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

/** "Oct 19, 2026" — the UTC calendar date. */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
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
