"use client";

import * as React from "react";

import { consumeLinkToken } from "@/lib/auth/link-token";

/**
 * The emailed link's token, taken out of the URL after hydration. `undefined` until it has been
 * read (prerender and first paint), then the token or `null` when the link has none.
 */
export function useLinkToken(): string | null | undefined {
  const [token, setToken] = React.useState<string | null | undefined>(undefined);
  // The URL loses the token on the first read, so keep it for the effect's second run in dev.
  const read = React.useRef<string | null | undefined>(undefined);

  React.useEffect(() => {
    read.current ??= consumeLinkToken(window);
    setToken(read.current);
  }, []);

  return token;
}
