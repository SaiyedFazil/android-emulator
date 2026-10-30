const SECONDS_PER_MINUTE = 60;

/** What the sign-in form shows for a `CredentialsSignin` code (see `loginFailureCode`). */
export function loginErrorMessage(code: string | undefined): string {
  const [name, value] = (code ?? "").split(":");
  switch (name) {
    case "AUTH_INVALID_CREDENTIALS":
      return "That email, username or password isn't right.";
    case "AUTH_ACCOUNT_LOCKED": {
      const seconds = Number(value);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        return "Too many attempts. Try again later.";
      }
      const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
      return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
    }
    case "AUTH_ACCOUNT_SUSPENDED":
      return "This account is suspended. Contact your administrator.";
    case "TOO_MANY_REQUESTS":
      return "Too many sign-in attempts. Wait a minute and try again.";
    case "AUTH_UNAVAILABLE":
      return "Sign-in is unavailable right now. Try again shortly.";
    default:
      return "Couldn't sign in. Try again.";
  }
}
