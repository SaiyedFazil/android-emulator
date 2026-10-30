import * as React from "react";

import dayjs, { type Dayjs } from "@/lib/dayjs";

/** How often relative times ("2 minutes ago") move on. */
const TICK_MS = 30_000;

function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, TICK_MS);
  return () => window.clearInterval(timer);
}

const getTick = () => Math.floor(dayjs().valueOf() / TICK_MS);
const getServerTick = () => null;

/**
 * The current time for relative dates, moving on every 30 s. Null during prerender and hydration,
 * so nothing time-based is rendered on the server (Cache Components) or differs on hydration.
 */
export function useNow(): Dayjs | null {
  const tick = React.useSyncExternalStore(subscribe, getTick, getServerTick);
  return React.useMemo(() => (tick === null ? null : dayjs(tick * TICK_MS)), [tick]);
}
