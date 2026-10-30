"use client";

import { useQuery } from "@tanstack/react-query";

import { meApi } from "@/lib/api/me/me-api";

export const ME_QUERY_KEY = ["me"] as const;

/** The signed-in user's profile, fetched once and shared by every component that needs it. */
export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => (await meApi.getMe()).data,
  });
}
