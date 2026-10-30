import type { Me } from "@/types/auth.types";

/**
 * The signed-in user's profile (`GET /me`), kept in localStorage so a reload doesn't fetch it again.
 * Versioned: when `Me` changes shape, bump it and old copies are ignored instead of misread.
 * It holds no secrets (no tokens), and it is removed whenever the session ends.
 */
const STORAGE_KEY = "emulator-console.me";

/** The stored profile, only if it belongs to `userId` (another account's copy is ignored). */
export function readStoredMe(userId: string | undefined): Me | undefined {
  if (!userId || typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const me = raw ? (JSON.parse(raw) as Partial<Me> | null) : null;
    return me?.id === userId && typeof me.email === "string" ? (me as Me) : undefined;
  } catch {
    // Storage blocked (private mode, disabled) or a broken value: fetch instead.
    return undefined;
  }
}

export function storeMe(me: Me): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(me));
  } catch {
    // Storage full or blocked: the profile is simply fetched on the next load.
  }
}

/** Called whenever the session ends: sign-out, a refused session, the sign-in page. */
export function clearStoredMe(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, or storage blocked.
  }
}
