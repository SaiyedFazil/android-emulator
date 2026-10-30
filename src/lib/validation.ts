import * as Yup from "yup";

// ---------------------------------------------------------------------------
// Shared rules (the backend's own)
// ---------------------------------------------------------------------------

/** Passwords are 8 characters to 72 UTF-8 bytes (bcrypt's limit). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

/** 3-30 of `a-z 0-9 . _ -`, starting and ending with a letter or digit (checked lowercased). */
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,28})[a-z0-9]$/;

const EMAIL_MAX_LENGTH = 254;

export const passwordSchema = Yup.string()
  .required("Enter a password.")
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .test(
    "max-bytes",
    "That password is too long. Use a shorter one.",
    (value) => !value || new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES
  );

/** Repeats the `password` field of the same form. */
const confirmPasswordSchema = Yup.string()
  .required("Enter the password again.")
  .oneOf([Yup.ref("password")], "The passwords don't match.");

const emailSchema = Yup.string()
  .trim()
  .required("Enter your email address.")
  .max(EMAIL_MAX_LENGTH, "That email address is too long.")
  .email("Enter a valid email address.");

const usernameSchema = Yup.string()
  .trim()
  .lowercase()
  .required("Choose a username.")
  .min(3, "Use 3 to 30 characters.")
  .max(30, "Use 3 to 30 characters.")
  .matches(
    USERNAME_PATTERN,
    "Use letters, digits, dots, underscores or hyphens; start and end with a letter or digit."
  );

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export const loginSchema = Yup.object({
  identifier: Yup.string().trim().required("Enter your email or username."),
  password: Yup.string().required("Enter your password."),
  rememberMe: Yup.boolean().required(),
});

// ---------------------------------------------------------------------------
// Forgot and reset password, accept invitation
// ---------------------------------------------------------------------------

export const forgotPasswordSchema = Yup.object({ email: emailSchema });

export const resetPasswordSchema = Yup.object({
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

export const acceptInvitationSchema = Yup.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});
