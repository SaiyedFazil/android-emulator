"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { signOut } from "next-auth/react";

import {
  AuthHeading,
  AuthNotice,
  CheckingLink,
  FormAlert,
  PasswordField,
  SubmitButton,
} from "@/components/pages/login/components/AuthFormParts";
import { useLinkToken } from "@/hooks/use-link-token";
import { getApiError } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/auth/auth-api";
import { PASSWORD_MIN_LENGTH, resetPasswordSchema } from "@/lib/validation";

function InvalidResetLink() {
  return (
    <AuthNotice
      title="This link has expired"
      description="Reset links work once and only for a short time. Ask for a new one and use the latest email."
      action={{ href: "/forgot-password", label: "Send a new link" }}
    />
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useLinkToken();
  const [linkSpent, setLinkSpent] = React.useState(false);

  const link = useQuery({
    queryKey: ["reset-link", token],
    queryFn: async () => (await authApi.verifyResetLink(token!)).data,
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  const reset = useMutation({
    mutationFn: (password: string) => authApi.resetPassword(token!, password),
  });

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: resetPasswordSchema,
    validateOnBlur: false,
    onSubmit: async ({ password }, helpers) => {
      try {
        await reset.mutateAsync(password);
      } catch (error) {
        const { code } = getApiError(error);
        if (code === "AUTH_LINK_INVALID") setLinkSpent(true);
        if (code === "AUTH_PASSWORD_WEAK") {
          helpers.setFieldError("password", getApiError(error).message);
        }
        return;
      }
      // Every session of the account just ended; drop this browser's too, then sign in.
      await signOut({ redirect: false });
      router.replace("/login?reset=1");
    },
  });

  if (token === undefined || (token && link.isPending)) return <CheckingLink />;
  if (token === null || linkSpent || getApiError(link.error).code === "AUTH_LINK_INVALID") {
    return <InvalidResetLink />;
  }
  if (link.isError) {
    return (
      <AuthNotice
        title="Couldn't check your link"
        description={getApiError(link.error).message}
        action={{ href: "/forgot-password", label: "Send a new link" }}
      />
    );
  }

  const submitted = formik.submitCount > 0;
  const serverError =
    reset.isError && getApiError(reset.error).code !== "AUTH_PASSWORD_WEAK"
      ? getApiError(reset.error).message
      : null;

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <AuthHeading
        title="Set a new password"
        description={
          <>
            For <span className="font-medium text-foreground">{link.data?.email}</span>. You&apos;ll
            be signed out everywhere and can sign in with the new password.
          </>
        }
      />

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col">
        <FormAlert tone="error">{serverError}</FormAlert>

        <div className="flex flex-col gap-4.5">
          <PasswordField
            id="password"
            name="password"
            label="New password"
            autoComplete="new-password"
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={submitted ? formik.errors.password : undefined}
            delay={150}
          />
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Enter it again"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={submitted ? formik.errors.confirmPassword : undefined}
            delay={200}
          />

          <SubmitButton busy={formik.isSubmitting} busyLabel="Saving…" delay={250}>
            Set password
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
