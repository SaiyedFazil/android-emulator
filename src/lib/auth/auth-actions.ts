"use server";

import { AuthError, CredentialsSignin } from "next-auth";

import { signIn, signOut } from "@/auth";

export type SignInResult = { ok: true } | { ok: false; code: string };

/**
 * Signs in on the Next server (Auth.js `signIn`, which calls the backend and sets the HttpOnly
 * session cookie). As a Server Action it is one request, protected against cross-site use by
 * Next.js itself. A refusal returns the `CredentialsSignin` code the form turns into a message.
 */
export async function signInAction(credentials: {
  identifier: string;
  password: string;
  rememberMe: boolean;
}): Promise<SignInResult> {
  try {
    await signIn("credentials", {
      identifier: credentials.identifier,
      password: credentials.password,
      rememberMe: String(credentials.rememberMe),
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof CredentialsSignin) return { ok: false, code: error.code };
    if (error instanceof AuthError) return { ok: false, code: "SIGN_IN_FAILED" };
    throw error;
  }
}

/** Ends the session in this browser: Auth.js clears the session cookie. */
export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
}
