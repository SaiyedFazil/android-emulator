/**
 * The backend rotates the refresh token on every use and ends the session when a used one comes
 * back (no grace window). One page load can refresh from several places with the same token: the
 * proxy, the browser's `/auth/session`, other tabs. They must share one backend call.
 *
 * Kept on `globalThis`: Next bundles the proxy and the route handlers as separate module instances
 * in one Node process. With several frontend replicas, use sticky sessions.
 */

/** How long one refresh result is shared: covers one page load. */
const SHARE_WINDOW_MS = 120_000;

interface SharedRefresh {
  promise: Promise<unknown>;
  expiresAt: number;
}

const globalForRefresh = globalThis as typeof globalThis & {
  __emulatorRefreshes?: Map<string, SharedRefresh>;
};
const refreshes = (globalForRefresh.__emulatorRefreshes ??= new Map<string, SharedRefresh>());

/** Runs `run` at most once per refresh token within the window; concurrent callers share it. */
export function refreshOnce<T>(
  refreshToken: string,
  run: () => Promise<T>,
  now: number = Date.now()
): Promise<T> {
  for (const [token, entry] of refreshes) {
    if (entry.expiresAt <= now) refreshes.delete(token);
  }

  const existing = refreshes.get(refreshToken);
  if (existing) return existing.promise as Promise<T>;

  const promise = run();
  const entry: SharedRefresh = { promise, expiresAt: now + SHARE_WINDOW_MS };
  refreshes.set(refreshToken, entry);
  // A failed refresh is not shared: the next caller tries again.
  promise.catch(() => {
    if (refreshes.get(refreshToken) === entry) refreshes.delete(refreshToken);
  });
  return promise;
}
