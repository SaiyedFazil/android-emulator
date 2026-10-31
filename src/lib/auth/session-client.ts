"use client";

import * as React from "react";
import type { Session } from "next-auth";

import { AUTH_BASE_PATH } from "@/auth.config";
import { clearStoredMe } from "@/lib/auth/me-storage";

/**
 * The session in the browser: read once per page load (`GET /auth/session`), then shared by the
 * API client, `useMe` and the sign-in form. The Next server refreshes the tokens during that read
 * when they are due; the refresh token itself never comes here (HttpOnly cookie).
 *
 * Read again only when it must be: after signing in, and when the API refuses the access token
 * (`axios.ts`). Concurrent reads share one request.
 */

export type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; session: Session }
  | { status: "unauthenticated" };

const LOADING: SessionState = { status: "loading" };

let state: SessionState = LOADING;
let pendingRead: Promise<Session | null> | null = null;
const listeners = new Set<() => void>();

function setState(next: SessionState) {
  state = next;
  // No session: a stored profile belongs to a session that has ended.
  if (next.status === "unauthenticated") clearStoredMe();
  for (const listener of listeners) listener();
}

/** Reads the session from the Next server; callers at the same moment share one request. */
export function readSession(): Promise<Session | null> {
  pendingRead ??= fetch(`${AUTH_BASE_PATH}/session`, { cache: "no-store" })
    .then(async (response) => {
      const body = response.ok ? ((await response.json()) as Session | null) : null;
      const session = body?.user && body.accessToken ? body : null;
      setState(session ? { status: "authenticated", session } : { status: "unauthenticated" });
      return session;
    })
    .catch((error: unknown) => {
      // The Next server could not be reached: keep what we know and let the next call retry.
      console.error("Could not read the session:", error);
      return state.status === "authenticated" ? state.session : null;
    })
    .finally(() => {
      pendingRead = null;
    });
  return pendingRead;
}

/** The access token for an API call, reading the session first if this page hasn't yet. */
export async function getAccessToken(): Promise<string | null> {
  if (state.status === "authenticated") return state.session.accessToken;
  if (state.status === "unauthenticated") return null;
  return (await readSession())?.accessToken ?? null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getState = () => state;
const getServerState = () => LOADING;

/**
 * The session for client components. The first component that asks reads it; every other one
 * (and React's double mount in development) shares that read. `loading` during prerender.
 */
export function useSession(): { data: Session | null | undefined; status: SessionState["status"] } {
  const current = React.useSyncExternalStore(subscribe, getState, getServerState);

  React.useEffect(() => {
    if (state.status === "loading") void readSession();
  }, []);

  return {
    data:
      current.status === "authenticated"
        ? current.session
        : current.status === "unauthenticated"
          ? null
          : undefined,
    status: current.status,
  };
}
