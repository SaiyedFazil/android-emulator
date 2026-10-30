"use client";

import { useTimeZone } from "@/hooks/use-time-zone";
import { formatDate, formatDateTime, formatMonthYear } from "@/lib/format";

const FORMATS = { date: formatDate, datetime: formatDateTime, "month-year": formatMonthYear };

/**
 * A timestamp shown in the viewer's own time zone, with the full local date and time on hover.
 * Prerendered pages can't know the zone, so the first paint is UTC and it switches after mount.
 * Pass `children` to show other text (e.g. "3 days ago") and keep the local tooltip.
 */
export function LocalTime({
  value,
  format = "datetime",
  className,
  children,
}: {
  /** ISO 8601 timestamp. */
  value: string;
  format?: keyof typeof FORMATS;
  className?: string;
  children?: React.ReactNode;
}) {
  const timeZone = useTimeZone();
  return (
    <time dateTime={value} title={formatDateTime(value, timeZone)} className={className}>
      {children ?? FORMATS[format](value, timeZone)}
    </time>
  );
}
