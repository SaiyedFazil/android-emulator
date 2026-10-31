import type { SessionTokens } from "@/lib/auth/backend-auth";
import type { ApiRole } from "@/types/auth.types";

/**
 * Who is signed in, as the session carries it: only what routing and the profile cache need.
 * The profile itself comes from `GET /me`.
 */
interface SessionUser {
  uuid: string;
  role: ApiRole;
}

declare module "next-auth" {
  /** What `authorize` returns after a successful sign-in (`id` is Auth.js's own, internal). */
  interface User {
    uuid?: string;
    role?: ApiRole;
    tokens?: SessionTokens;
  }

  /** What `GET /auth/session` gives the browser. */
  interface Session {
    accessToken: string;
    user: SessionUser;
  }
}

// Declared in @auth/core; next-auth/jwt only re-exports it.
declare module "@auth/core/jwt" {
  /** The encrypted cookie's content. */
  interface JWT {
    user?: SessionUser;
    tokens?: SessionTokens;
  }
}
