import * as Yup from "yup";

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export const loginSchema = Yup.object({
  identifier: Yup.string().trim().required("Enter your email or username."),
  password: Yup.string().required("Enter your password."),
  rememberMe: Yup.boolean().required(),
});
