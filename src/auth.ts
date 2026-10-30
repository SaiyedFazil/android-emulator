import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import {
  BackendAuthError,
  forwardedClientHeaders,
  isSessionOver,
  loginFailureCode,
  loginWithBackend,
  refreshWithBackend,
  tokenState,
  toSessionTokens,
} from "@/lib/auth/backend-auth";
import { refreshOnce } from "@/lib/auth/refresh-once";

/** A refused sign-in; `code` reaches the login form (see `loginFailureCode`). */
class BackendSignInError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

/**
 * The session: both tokens live in Auth.js's encrypted, HttpOnly cookie. The browser only ever
 * receives the access token (`session.accessToken`); the refresh token stays on this server.
 * Configured per request so the backend calls carry the browser's User-Agent and IP.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(async (request) => {
  const client = request ? forwardedClientHeaders(request.headers) : {};

  return {
    ...authConfig,
    providers: [
      Credentials({
        credentials: { identifier: {}, password: {}, rememberMe: {} },
        async authorize(credentials, signInRequest) {
          try {
            const { tokens, user } = await loginWithBackend(
              {
                identifier: String(credentials.identifier ?? ""),
                password: String(credentials.password ?? ""),
                rememberMe: credentials.rememberMe === "true",
              },
              forwardedClientHeaders(signInRequest.headers)
            );
            return { id: user.id, profile: user, tokens: toSessionTokens(tokens, Date.now()) };
          } catch (error) {
            // A refusal is the backend's answer; anything else is a fault worth seeing.
            if (!(error instanceof BackendAuthError)) console.error("Sign-in failed:", error);
            throw new BackendSignInError(loginFailureCode(error));
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user?.profile && user.tokens) {
          return { sub: user.profile.id, profile: user.profile, tokens: user.tokens };
        }
        const { tokens } = token;
        if (!tokens) return null;

        const state = tokenState(tokens, Date.now());
        if (state === "valid") return token;
        // Returning null ends the session and clears the cookie.
        if (state === "expired") return null;

        try {
          const refreshed = await refreshOnce(tokens.refreshToken, async () =>
            toSessionTokens(await refreshWithBackend(tokens.refreshToken, client), Date.now())
          );
          return { ...token, tokens: refreshed };
        } catch (error) {
          if (isSessionOver(error)) return null;
          // No network, 429 or 5xx: keep the session; the next read tries again.
          console.error("Token refresh failed, keeping the session:", error);
          return token;
        }
      },
      session({ session, token }) {
        // Only what the browser needs: never the refresh token.
        return {
          expires: session.expires,
          accessToken: token.tokens?.accessToken ?? "",
          user: token.profile!,
        };
      },
    },
  };
});
