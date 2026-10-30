import type { NextAuthConfig } from "next-auth";

const SECONDS_PER_DAY = 24 * 60 * 60;

/** Auth.js settings without providers; `auth.ts` adds the sign-in provider and callbacks. */
export const authConfig = {
  basePath: "/auth",
  // Build URLs from the request's host (X-Forwarded-Host behind nginx), so AUTH_URL is optional.
  trustHost: true,
  session: {
    strategy: "jwt",
    // The cookie's lifetime; the session itself ends with the backend's refresh token.
    maxAge: Number(process.env.AUTH_SESSION_MAX_AGE_DAYS || 30) * SECONDS_PER_DAY,
  },
  pages: { signIn: "/login", error: "/login" },
  providers: [],
} satisfies NextAuthConfig;
