"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { isClientError } from "@/lib/api/api-error";

/** Data counts as fresh this long before a revisit fetches it again. */
const STALE_TIME_MS = 30_000;
/** Retries for a failed read; a 4xx answer is never retried. */
const MAX_RETRIES = 2;

/** One query cache per browser tab, for the API data that client components read. */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            retry: (failures, error) => failures < MAX_RETRIES && !isClientError(error),
          },
          mutations: { retry: false },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
