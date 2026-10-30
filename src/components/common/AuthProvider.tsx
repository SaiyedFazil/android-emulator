"use client";

import * as React from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { setAccessToken } from "@/lib/axios";

/** Keeps the API client's access token in step with the session. */
function AccessTokenSync() {
  const { data: session } = useSession();

  React.useEffect(() => {
    setAccessToken(session?.accessToken || null);
  }, [session?.accessToken]);

  return null;
}

/**
 * The session for client components. It is read in the browser (`GET /auth/session`), so pages
 * stay static shells; `proxy.ts` has already let only the right users in.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/auth">
      <AccessTokenSync />
      {children}
    </SessionProvider>
  );
}
