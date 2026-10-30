import { authApi } from "@/lib/api/auth/auth-api";
import { LOGIN_PATH } from "@/lib/auth/roles";
import { signOutTo } from "@/lib/axios";

/** Ends this device's session on the backend, then in this browser, and goes to sign in. */
export async function signOutOfApp(): Promise<void> {
  // The session ends in this browser either way; a failed call only leaves it to expire.
  await authApi.logout().catch(() => undefined);
  await signOutTo(LOGIN_PATH);
}
