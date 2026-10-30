/**
 * Reads `?token=` from an emailed link (invitation, password reset) and removes it from the address
 * bar at once, keeping the router's history state, so the token is not left in the history or
 * shown on screen. Returns null when there is none.
 */
export function consumeLinkToken(win: {
  location: { href: string };
  history: { state: unknown; replaceState(data: unknown, unused: string, url: string): void };
}): string | null {
  const url = new URL(win.location.href);
  const token = url.searchParams.get("token");
  if (token === null) return null;
  url.searchParams.delete("token");
  win.history.replaceState(win.history.state, "", url.pathname + url.search + url.hash);
  return token || null;
}
