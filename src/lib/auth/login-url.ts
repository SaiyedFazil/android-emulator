import { areaOf, LOGIN_PATH } from "@/lib/auth/roles";

/**
 * The sign-in page, bringing the user back to where they were (`?next=`) after a forced sign-out
 * (session ended, token refused). Pages outside the console and admin areas need no way back.
 */
export function loginUrlForCurrentPage(location: { pathname: string; search: string }): string {
  const { pathname, search } = location;
  const area = areaOf(pathname);
  if (area !== "console" && area !== "admin") return LOGIN_PATH;
  return `${LOGIN_PATH}?next=${encodeURIComponent(pathname + search)}`;
}
