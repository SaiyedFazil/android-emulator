"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { meApi } from "@/lib/api/me/me-api";
import { readStoredMe, storeMe } from "@/lib/auth/me-storage";
import { useSession } from "@/lib/auth/session-client";

/** Prefix of the profile query: `["me", userId]`. Invalidate or update it with this key. */
export const ME_QUERY_KEY = ["me"] as const;

/**
 * The signed-in user's profile, shared by every component that needs it. It is fetched once per
 * sign-in and kept in localStorage, so a reload reads it from there instead of calling `GET /me`.
 * Updating the query (a profile save, an invalidation after a password change) updates the stored
 * copy too. Keyed by the session's user, which is only known after mount, so server and first
 * client render agree.
 */
export function useMe() {
  const { data: session, status } = useSession();
  const userId = session?.user?.uuid;

  const query = useQuery({
    queryKey: [...ME_QUERY_KEY, userId],
    queryFn: async () => (await meApi.getMe()).data,
    enabled: status === "authenticated" && Boolean(userId),
    initialData: () => readStoredMe(userId),
    // Fresh until something changes it: no refetch on reload, focus or remount.
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (query.data) storeMe(query.data);
  }, [query.data]);

  return query;
}
