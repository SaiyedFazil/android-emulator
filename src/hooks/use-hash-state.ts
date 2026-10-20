import * as React from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const getSnapshot = () => decodeURIComponent(window.location.hash.slice(1));
const getServerSnapshot = () => "";

/**
 * The URL hash as state (without the "#"). Setting it replaces the current history entry, so
 * Back still leaves the page, and it never scrolls. Empty during prerender and hydration.
 */
export function useHashState(): [string, (value: string) => void] {
  const hash = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setHash = React.useCallback((value: string) => {
    const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(value)}`;
    window.history.replaceState(window.history.state, "", url);
    // replaceState does not fire hashchange; notify subscribers ourselves.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return [hash, setHash];
}
