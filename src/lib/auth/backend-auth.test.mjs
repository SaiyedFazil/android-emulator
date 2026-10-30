// Run with `npm test` (Node's built-in runner; Node strips the TypeScript types on import).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.NEXT_PUBLIC_API_URL = "http://api.test/api/v1";
const {
  BackendAuthError,
  forwardedClientHeaders,
  isSessionOver,
  loginFailureCode,
  loginWithBackend,
  refreshWithBackend,
  tokenState,
  toSessionTokens,
} = await import("./backend-auth.ts");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Replaces fetch with one answer and records the calls. */
function answer(status, body) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(body === undefined ? null : JSON.stringify(body), { status });
  };
  return calls;
}

const PAIR = {
  accessToken: "access",
  accessTokenExpiresIn: 900,
  refreshToken: "refresh",
  refreshTokenExpiresAt: "2026-11-29T00:00:00.000Z",
  persistent: true,
};

test("forwardedClientHeaders copies only the user agent and the forwarded client IP", () => {
  const headers = new Headers({
    "user-agent": "Firefox",
    "x-forwarded-for": "203.0.113.7",
    cookie: "secret",
    authorization: "Bearer x",
  });
  assert.deepEqual(forwardedClientHeaders(headers), {
    "user-agent": "Firefox",
    "x-forwarded-for": "203.0.113.7",
  });
  assert.deepEqual(forwardedClientHeaders(new Headers()), {});
});

test("loginWithBackend posts the credentials with the client's headers and returns data", async () => {
  const calls = answer(200, { message: "Success", data: { tokens: PAIR, user: { id: "u1" } } });

  const result = await loginWithBackend(
    { identifier: "ada", password: "pw", rememberMe: true },
    { "user-agent": "Firefox", "x-forwarded-for": "203.0.113.7" }
  );

  assert.deepEqual(result, { tokens: PAIR, user: { id: "u1" } });
  assert.equal(calls[0].url, "http://api.test/api/v1/auth/login");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    identifier: "ada",
    password: "pw",
    rememberMe: true,
  });
  assert.equal(calls[0].init.headers["user-agent"], "Firefox");
  assert.equal(calls[0].init.headers["x-forwarded-for"], "203.0.113.7");
  assert.equal(calls[0].init.headers["content-type"], "application/json");
});

test("refreshWithBackend sends the refresh token as a Bearer header, without a body", async () => {
  const calls = answer(200, { message: "Success", data: { tokens: PAIR } });

  assert.deepEqual(await refreshWithBackend("refresh", {}), PAIR);
  assert.equal(calls[0].url, "http://api.test/api/v1/auth/refresh");
  assert.equal(calls[0].init.headers.authorization, "Bearer refresh");
  assert.equal(calls[0].init.body, undefined);
});

test("an error answer becomes a BackendAuthError with the status, code and details", async () => {
  answer(429, {
    statusCode: 429,
    message: "Too many failed sign-ins. Try again later.",
    error: "AUTH_ACCOUNT_LOCKED",
    details: { retryAfterSeconds: 601 },
  });

  await assert.rejects(
    refreshWithBackend("refresh", {}),
    (error) =>
      error instanceof BackendAuthError &&
      error.status === 429 &&
      error.code === "AUTH_ACCOUNT_LOCKED" &&
      error.details.retryAfterSeconds === 601
  );
});

test("an unreachable API becomes a BackendAuthError without a status", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  await assert.rejects(
    refreshWithBackend("refresh", {}),
    (error) => error instanceof BackendAuthError && error.status === null
  );
});

test("toSessionTokens counts the access token's lifetime on this server's clock", () => {
  assert.deepEqual(toSessionTokens(PAIR, 1_000_000), {
    accessToken: "access",
    accessTokenExpiresAt: 1_000_000 + 900_000,
    refreshToken: "refresh",
    refreshTokenExpiresAt: Date.parse("2026-11-29T00:00:00.000Z"),
  });
});

test("tokenState refreshes in the last minute and ends with the refresh token", () => {
  const tokens = { accessTokenExpiresAt: 900_000, refreshTokenExpiresAt: 5_000_000 };
  assert.equal(tokenState(tokens, 0), "valid");
  assert.equal(tokenState(tokens, 839_999), "valid");
  assert.equal(tokenState(tokens, 840_000), "refresh");
  assert.equal(tokenState(tokens, 2_000_000), "refresh");
  assert.equal(tokenState(tokens, 5_000_000), "expired");
});

test("loginFailureCode turns each backend answer into a sign-in code", () => {
  const failure = (status, code, details) => new BackendAuthError("x", status, code, details);

  assert.equal(
    loginFailureCode(failure(401, "AUTH_INVALID_CREDENTIALS")),
    "AUTH_INVALID_CREDENTIALS"
  );
  assert.equal(loginFailureCode(failure(403, "AUTH_ACCOUNT_SUSPENDED")), "AUTH_ACCOUNT_SUSPENDED");
  assert.equal(
    loginFailureCode(failure(429, "AUTH_ACCOUNT_LOCKED", { retryAfterSeconds: 601 })),
    "AUTH_ACCOUNT_LOCKED:601"
  );
  assert.equal(loginFailureCode(failure(429, "AUTH_ACCOUNT_LOCKED")), "AUTH_ACCOUNT_LOCKED");
  assert.equal(loginFailureCode(failure(429, "Too Many Requests")), "TOO_MANY_REQUESTS");
  assert.equal(loginFailureCode(failure(503, "AUTH_UNAVAILABLE")), "AUTH_UNAVAILABLE");
  assert.equal(loginFailureCode(failure(500, "Internal Server Error")), "AUTH_UNAVAILABLE");
  assert.equal(loginFailureCode(failure(null, null)), "AUTH_UNAVAILABLE");
  assert.equal(loginFailureCode(failure(400, "Bad Request")), "SIGN_IN_FAILED");
  assert.equal(loginFailureCode(new Error("boom")), "SIGN_IN_FAILED");
});

test("isSessionOver is true only when the backend refused the session", () => {
  const failure = (status) => new BackendAuthError("x", status, null);

  assert.equal(isSessionOver(failure(401)), true);
  assert.equal(isSessionOver(failure(403)), true);
  assert.equal(isSessionOver(failure(429)), false);
  assert.equal(isSessionOver(failure(503)), false);
  assert.equal(isSessionOver(failure(null)), false);
  assert.equal(isSessionOver(new Error("boom")), false);
});
