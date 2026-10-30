import axios, { type InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

import { loginUrlForCurrentPage } from "@/lib/auth/login-url";

/**
 * The browser's API client (client components only). Every call goes straight from the browser to
 * the API with the access token, so it shows in the Network tab. The refresh token never leaves
 * the Next server: a new access token comes from `GET /auth/session`, which refreshes there.
 */

/** The current access token; `AuthProvider` keeps it in step with the session. */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** One session read for every request that needs a token at the same moment. */
let pendingSessionRead: Promise<string | null> | null = null;

function readAccessToken(): Promise<string | null> {
  pendingSessionRead ??= getSession()
    .then((session) => session?.accessToken || null)
    .catch(() => null)
    .finally(() => {
      pendingSessionRead = null;
    });
  return pendingSessionRead;
}

let signingOut = false;

/**
 * Ends the session in this browser (clears the cookie) and loads `url`. Only the first call runs,
 * so a sign-out the user asked for and a refused token never race each other.
 */
export async function signOutTo(url: string): Promise<void> {
  if (signingOut) return;
  signingOut = true;
  setAccessToken(null);
  await signOut({ redirectTo: url });
}

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

const REQUEST_TIMEOUT_MS = 30_000;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  accessToken ??= await readAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }
  const config = error.config as RetriableConfig;

  // Most likely the access token expired: read the session once (the server refreshes it) and
  // retry this request once. Safe for writes too: the API refuses a bad token before any handler.
  if (!config._authRetried) {
    config._authRetried = true;
    const failedAuthorization = config.headers.Authorization;
    const token = await readAccessToken();
    if (token && `Bearer ${token}` !== failedAuthorization) {
      setAccessToken(token);
      config.headers.Authorization = `Bearer ${token}`;
      return api.request(config);
    }
  }

  // No session, the token didn't change (revoked, suspended), or the retry was refused too:
  // sign in again, coming back to this page afterwards.
  await signOutTo(loginUrlForCurrentPage(window.location));
  throw error;
});

export default api;
