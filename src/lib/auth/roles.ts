/**
 * Who may open which part of the app. Pure functions with no runtime imports, shared by
 * `proxy.ts`, the sign-in form and the API client.
 */
import type { ApiRole } from "@/types/auth.types";

/** The frontend's two areas' audiences; not API roles (see `areaRoleOf`). */
export type Role = "user" | "admin";
export type Area = "public" | "auth-flow" | "console" | "admin";

export const LOGIN_PATH = "/login";

/** Pages reached from an emailed link: open whether or not someone is signed in. */
export const AUTH_FLOW_PATHS = ["/forgot-password", "/reset-password", "/accept-invite"];

export const ROLE_HOME: Record<Role, string> = {
  user: "/dashboard",
  admin: "/admin/dashboard",
};

const ROLE_AREA: Record<Role, Area> = { user: "console", admin: "admin" };

/** Platform staff use the admin area; organization users the console. */
export function areaRoleOf(role: ApiRole): Role {
  return role === "OWNER" || role === "ADMIN" || role === "SUPPORT" ? "admin" : "user";
}

export function areaOf(pathname: string): Area {
  if (pathname === LOGIN_PATH) return "public";
  if (AUTH_FLOW_PATHS.includes(pathname)) return "auth-flow";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  return "console";
}

/**
 * Signed out → sign in first (coming back to this page); signed in → only your own area, never
 * back to `/login`. The auth-flow pages are open to everyone.
 */
export function resolveAccess(
  role: Role | null,
  pathname: string,
  search = ""
): { allow: true } | { redirect: string } {
  const area = areaOf(pathname);
  if (area === "auth-flow") return { allow: true };
  if (role === null) {
    return area === "public"
      ? { allow: true }
      : { redirect: `${LOGIN_PATH}?next=${encodeURIComponent(pathname + search)}` };
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
