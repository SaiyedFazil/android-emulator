import * as React from "react";

const subscribe = () => () => {};

/** True only after hydration — for UI that depends on client-only state such as the theme. */
export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
