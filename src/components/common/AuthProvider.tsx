"use client";

import * as React from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { clearStoredMe } from "@/lib/auth/me-storage";
import { setAccessToken } from "@/lib/axios";

/**
 * Keeps the API client's access token in step with the session, and drops the stored profile as
 * soon as the session is gone (expired or ended elsewhere).
 */
function SessionSync() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    setAccessToken(session?.accessToken || null);
  }, [session?.accessToken]);

  React.useEffect(() => {
    if (status === "unauthenticated") clearStoredMe();
  }, [status]);

  return null;
}

/**
 * The session for client components. It is read in the browser (`GET /auth/session`), so pages
 * stay static shells; `proxy.ts` has already let only the right users in.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/auth">
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
