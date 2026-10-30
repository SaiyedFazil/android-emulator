/**
 * The Next server's calls to the backend's sign-in and refresh endpoints. Server only (`auth.ts`):
 * they carry the refresh token, which never reaches the browser. Native `fetch`, so the proxy can
 * use them too.
 */
import type { ApiErrorBody, ApiResponse } from "@/types/api.types";
import type { AuthUser, TokenPair } from "@/types/auth.types";

/** Where the Next server reaches the API: its own address when set, else the browser's. */
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

/** A backend call that takes longer gives up, so a hung API can't hang every page. */
const BACKEND_TIMEOUT_MS = 10_000;
/** Refresh when less than this is left on the access token. */
const REFRESH_MARGIN_MS = 60_000;
const MS_PER_SECOND = 1000;

/** The browser's details the backend records on the session and rate-limits by. */
const CLIENT_HEADERS = ["user-agent", "x-forwarded-for"] as const;

export type ClientHeaders = Partial<Record<(typeof CLIENT_HEADERS)[number], string>>;

/** The tokens as the session keeps them, with expiries as epoch milliseconds. */
export interface SessionTokens {
  accessToken: string;
  /** Counted on this server's clock from `accessTokenExpiresIn`, so clock skew doesn't matter. */
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

export class BackendAuthError extends Error {
  /** The HTTP status, or null when the API could not be reached. */
  readonly status: number | null;
  /** The backend's `error`: a business code such as `AUTH_ACCOUNT_LOCKED`, or the status text. */
  readonly code: string | null;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number | null,
    code: string | null,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BackendAuthError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** The browser's `User-Agent` and `X-Forwarded-For` from the request the Next server received. */
export function forwardedClientHeaders(headers: Headers): ClientHeaders {
  const client: ClientHeaders = {};
  for (const name of CLIENT_HEADERS) {
    const value = headers.get(name);
    if (value) client[name] = value;
  }
  return client;
}

async function post<T>(
  path: string,
  { body, bearer, client }: { body?: unknown; bearer?: string; client: ClientHeaders }
): Promise<T> {
  if (!API_URL) {
    throw new Error("Set NEXT_PUBLIC_API_URL (and API_URL if the server needs another address).");
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        ...client,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new BackendAuthError(`The API could not be reached: ${reason}`, null, null);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload as Partial<ApiErrorBody> | null;
    throw new BackendAuthError(
      error?.message ?? response.statusText,
      response.status,
      error?.error ?? response.statusText,
      error?.details
    );
  }
  return (payload as ApiResponse<T>).data;
}

export function loginWithBackend(
  credentials: { identifier: string; password: string; rememberMe: boolean },
  client: ClientHeaders
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  return post("/auth/login", { body: credentials, client });
}

export async function refreshWithBackend(
  refreshToken: string,
  client: ClientHeaders
): Promise<TokenPair> {
  const { tokens } = await post<{ tokens: TokenPair }>("/auth/refresh", {
    bearer: refreshToken,
    client,
  });
  return tokens;
}

export function toSessionTokens(pair: TokenPair, receivedAt: number): SessionTokens {
  return {
    accessToken: pair.accessToken,
    accessTokenExpiresAt: receivedAt + pair.accessTokenExpiresIn * MS_PER_SECOND,
    refreshToken: pair.refreshToken,
    refreshTokenExpiresAt: Date.parse(pair.refreshTokenExpiresAt),
  };
}

/** Use the tokens as they are, refresh them first, or end the session (the refresh token expired). */
export function tokenState(
  tokens: Pick<SessionTokens, "accessTokenExpiresAt" | "refreshTokenExpiresAt">,
  now: number
): "valid" | "refresh" | "expired" {
  if (now >= tokens.refreshTokenExpiresAt) return "expired";
  return now < tokens.accessTokenExpiresAt - REFRESH_MARGIN_MS ? "valid" : "refresh";
}

/**
 * The `CredentialsSignin` code the login form receives for a failed sign-in. The lockout carries
 * its wait (`AUTH_ACCOUNT_LOCKED:601`); codes travel in the sign-in response, so nothing here says
 * more than the backend's own answer did.
 */
export function loginFailureCode(error: unknown): string {
  if (!(error instanceof BackendAuthError)) return "SIGN_IN_FAILED";
  if (error.status === null) return "AUTH_UNAVAILABLE";
  if (error.code === "AUTH_ACCOUNT_LOCKED") {
    const seconds = Number(error.details?.retryAfterSeconds);
    return Number.isFinite(seconds) ? `AUTH_ACCOUNT_LOCKED:${seconds}` : "AUTH_ACCOUNT_LOCKED";
  }
  if (error.code === "AUTH_INVALID_CREDENTIALS" || error.code === "AUTH_ACCOUNT_SUSPENDED") {
    return error.code;
  }
  if (error.status === 429) return "TOO_MANY_REQUESTS";
  if (error.status >= 500) return "AUTH_UNAVAILABLE";
  return "SIGN_IN_FAILED";
}

/**
 * True when the backend refused the session (401: revoked, expired, reused; 403: suspended), so it
 * must end. No network, 429 or 5xx keep it: the next read tries again.
 */
export function isSessionOver(error: unknown): boolean {
  return error instanceof BackendAuthError && (error.status === 401 || error.status === 403);
}
