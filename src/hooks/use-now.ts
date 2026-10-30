import * as React from "react";

/** How often relative times ("2 minutes ago") move on. */
const TICK_MS = 30_000;

function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, TICK_MS);
  return () => window.clearInterval(timer);
}

const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => null;

/**
 * The current time for relative dates, moving on every 30 s. Null during prerender and hydration,
 * so nothing time-based is rendered on the server (Cache Components) or differs on hydration.
 */
export function useNow(): Date | null {
  const tick = React.useSyncExternalStore(subscribe, getTick, getServerTick);
  return React.useMemo(() => (tick === null ? null : new Date(tick * TICK_MS)), [tick]);
}
