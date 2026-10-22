/**
 * Who may open which part of the app. Pure functions with no imports, shared by the sign-in
 * form today and by `proxy.ts` and the Data Access Layer once sessions exist.
 */

export type Role = "user" | "admin";
export type Area = "public" | "console" | "admin";

export const LOGIN_PATH = "/login";

export const ROLE_HOME: Record<Role, string> = {
  user: "/dashboard",
  admin: "/admin/dashboard",
};

const ROLE_AREA: Record<Role, Area> = { user: "console", admin: "admin" };

export function areaOf(pathname: string): Area {
  if (pathname === LOGIN_PATH) return "public";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  return "console";
}

/** Signed out → sign in first; signed in → only your own area (and never back to `/login`). */
export function resolveAccess(
  role: Role | null,
  pathname: string
): { allow: true } | { redirect: string } {
  const area = areaOf(pathname);
  if (role === null) {
    return area === "public"
      ? { allow: true }
      : { redirect: `${LOGIN_PATH}?next=${encodeURIComponent(pathname)}` };
  }
  return area === ROLE_AREA[role] ? { allow: true } : { redirect: ROLE_HOME[role] };
}

const SAME_ORIGIN = "http://localhost";

/** The `?next=` target after sign-in, if it is a same-site path in the role's area. */
export function safeNext(role: Role, next: string | null): string {
  if (!next || !next.startsWith("/")) return ROLE_HOME[role];
  // Judge the URL the browser will actually visit, not the raw string: browsers drop tabs and
  // newlines and read "\" as "/", so "/\t/evil.example" is really "//evil.example".
  const url = new URL(next, SAME_ORIGIN);
  if (url.origin !== SAME_ORIGIN) return ROLE_HOME[role];
  return areaOf(url.pathname) === ROLE_AREA[role]
    ? url.pathname + url.search + url.hash
    : ROLE_HOME[role];
}

// TODO(auth): the role comes from the session. Until then the sign-in demo picks it from the
// identifier, so both areas are reachable.
export function demoRoleFor(identifier: string): Role {
  return identifier.toLowerCase().includes("admin") ? "admin" : "user";
}
