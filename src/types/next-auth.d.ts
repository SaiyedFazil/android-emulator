import type { SessionTokens } from "@/lib/auth/backend-auth";
import type { AuthUser } from "@/types/auth.types";

declare module "next-auth" {
  /** What `authorize` returns after a successful sign-in. */
  interface User {
    profile?: AuthUser;
    tokens?: SessionTokens;
  }

  /** What `GET /auth/session` and `useSession()` give the browser. */
  interface Session {
    accessToken: string;
    user: AuthUser;
  }
}

// Declared in @auth/core; next-auth/jwt only re-exports it.
declare module "@auth/core/jwt" {
  /** The encrypted cookie's content. */
  interface JWT {
    profile?: AuthUser;
    tokens?: SessionTokens;
  }
}
