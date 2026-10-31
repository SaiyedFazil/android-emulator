import axios, { type InternalAxiosRequestConfig } from "axios";

import { signOutAction } from "@/lib/auth/auth-actions";
import { loginUrlForCurrentPage } from "@/lib/auth/login-url";
import { clearStoredMe } from "@/lib/auth/me-storage";
import { getAccessToken, readSession } from "@/lib/auth/session-client";

/**
 * The browser's API client (client components only). Every call goes straight from the browser to
 * the API with the access token, so it shows in the Network tab. The refresh token never leaves
 * the Next server: a new access token comes from reading the session, which refreshes there.
 */

let signingOut = false;

/**
 * Ends the session in this browser (the server clears the cookie) and loads `url`. Only the first
 * call runs, so a sign-out the user asked for and a refused token never race each other.
 */
export async function signOutTo(url: string): Promise<void> {
  if (signingOut) return;
  signingOut = true;
  clearStoredMe();
  // The page is left either way; a failed call only leaves an already-dead cookie behind.
  await signOutAction().catch(() => undefined);
  window.location.assign(url);
}

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

const REQUEST_TIMEOUT_MS = 30_000;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }
  const config = error.config as RetriableConfig;

  // Most likely the access token expired: get a fresh one and retry this request once. Another
  // request may already have refreshed it; otherwise read the session (the server refreshes it).
  // Safe for writes too: the API refuses a bad token before any handler runs.
  if (!config._authRetried) {
    config._authRetried = true;
    const failedAuthorization = config.headers.Authorization;
    let token = await getAccessToken();
    if (!token || `Bearer ${token}` === failedAuthorization) {
      token = (await readSession())?.accessToken ?? null;
    }
    if (token && `Bearer ${token}` !== failedAuthorization) {
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
