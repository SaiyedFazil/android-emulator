import * as React from "react";

import dayjs from "@/lib/dayjs";
import { currentZoneName } from "@/lib/timezones";

const subscribe = () => () => {};
const getTimeZone = () => currentZoneName(dayjs.tz.guess());
const getServerTimeZone = () => null;

/**
 * The viewer's own time zone (from their machine, e.g. "Asia/Kolkata"). Null during prerender and
 * hydration: the server can't know it, so dates render in UTC first and switch after mount.
 */
export function useTimeZone(): string | null {
  return React.useSyncExternalStore(subscribe, getTimeZone, getServerTimeZone);
}
