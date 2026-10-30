import { NextRequest } from "next/server";
import type { Session } from "next-auth";

import dayjs from "@/lib/dayjs";

type SessionHandler = (request: NextRequest) => Promise<Response>;

/**
 * Request headers the session read needs: the cookie, the host (for URLs behind nginx), and the
 * browser's details that a refresh forwards to the backend.
 */
const FORWARDED_HEADERS = [
  "cookie",
  "host",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-for",
  "user-agent",
];

export interface ProxySession {
  /** The session, or null when there is none or it could not be read (fail closed). */
  session: Session | null;
  /** Set-Cookie headers from Auth.js (re-issued, refreshed or cleared cookie): add them to the response. */
  setCookies: string[];
  /** The request's Cookie header with `setCookies` applied, for the rest of this request. */
  cookieHeader: string;
}

/**
 * Reads the session in the proxy exactly as the browser's `GET /auth/session` does, through the
 * app's own Auth.js handler. An expired access token is refreshed here, and the rotated tokens come
 * back as Set-Cookie headers, which the proxy (unlike a Server Component) can save.
 */
export async function readSessionInProxy({
  handler,
  requestUrl,
  headers,
}: {
  handler: SessionHandler;
  requestUrl: string;
  headers: Headers;
}): Promise<ProxySession> {
  const incomingCookies = headers.get("cookie") ?? "";
  const forwarded = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = headers.get(name);
    if (value) forwarded.set(name, value);
  }

  try {
    const response = await handler(
      new NextRequest(new URL("/auth/session", requestUrl), { headers: forwarded })
    );
    const setCookies = response.headers.getSetCookie();
    const session = response.ok ? ((await response.json()) as Session | null) : null;
    return { session, setCookies, cookieHeader: applySetCookies(incomingCookies, setCookies) };
  } catch {
    return { session: null, setCookies: [], cookieHeader: incomingCookies };
  }
}

/** Applies Set-Cookie headers to a Cookie request header: set, replace, or delete when expired. */
export function applySetCookies(
  cookieHeader: string,
  setCookies: string[],
  now: number = dayjs().valueOf()
): string {
  const cookies = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator > 0) {
      cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
  }

  for (const setCookie of setCookies) {
    const [pair, ...attributes] = setCookie.split(";");
    const separator = pair.indexOf("=");
    if (separator <= 0) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();

    const expired = attributes.some((attribute) => {
      const [rawKey, ...rest] = attribute.split("=");
      const key = rawKey.trim().toLowerCase();
      const attributeValue = rest.join("=").trim();
      if (key === "max-age") return Number(attributeValue) <= 0;
      if (key === "expires") return !dayjs(attributeValue).isAfter(now);
      return false;
    });

    if (expired) cookies.delete(name);
    else cookies.set(name, value);
  }

  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}
