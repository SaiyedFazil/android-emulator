import { NextResponse, type NextRequest } from "next/server";

import { handlers } from "@/auth";
import { AUTH_BASE_PATH } from "@/auth.config";
import { readSessionInProxy } from "@/lib/auth/proxy-session";
import { areaOf, areaRoleOf, resolveAccess } from "@/lib/auth/roles";

/**
 * Routing by session, before a page renders: signed-out users go to sign in, signed-in users stay
 * in their own area. It only redirects; the API enforces access. The session is read through the
 * app's own Auth.js handler, so a refreshed cookie is saved to the browser and passed on to the
 * page in the same request.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Auth.js's own endpoints, and pages reached from emailed links, need no session.
  if (
    pathname === AUTH_BASE_PATH ||
    pathname.startsWith(`${AUTH_BASE_PATH}/`) ||
    areaOf(pathname) === "auth-flow"
  ) {
    return NextResponse.next();
  }

  const { session, setCookies, cookieHeader } = await readSessionInProxy({
    handler: handlers.GET,
    requestUrl: request.url,
    headers: request.headers,
  });
  const role = session?.user ? areaRoleOf(session.user.role) : null;
  const access = resolveAccess(role, pathname, search);

  let response: NextResponse;
  if ("redirect" in access) {
    response = NextResponse.redirect(new URL(access.redirect, request.url));
  } else {
    const headers = new Headers(request.headers);
    headers.set("cookie", cookieHeader);
    response = NextResponse.next({ request: { headers } });
  }
  for (const cookie of setCookies) response.headers.append("set-cookie", cookie);
  return response;
}

export const config = {
  // Everything except Next's assets and files with an extension (favicon, images, fonts).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
