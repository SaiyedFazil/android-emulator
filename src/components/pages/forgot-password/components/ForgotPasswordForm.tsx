"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { ArrowLeft, Mail } from "lucide-react";

import {
  AuthField,
  AuthHeading,
  AuthNotice,
  FormAlert,
  SubmitButton,
} from "@/components/pages/login/components/AuthFormParts";
import { Reveal } from "@/components/pages/login/components/Reveal";
import { getApiError } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/auth/auth-api";
import { LOGIN_PATH } from "@/lib/auth/roles";
import { forgotPasswordSchema } from "@/lib/validation";

export function ForgotPasswordForm() {
  const request = useMutation({
    mutationFn: async (email: string) => (await authApi.forgotPassword(email)).data,
  });

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    validateOnBlur: false,
    onSubmit: async ({ email }) => {
      await request.mutateAsync(email.trim()).catch(() => undefined);
    },
  });

  if (request.isSuccess) {
    // The same answer whether or not the address has an account.
    return (
      <AuthNotice
        title="Check your email"
        description={
          <>
            {request.data.message} The link works once and expires soon. Check your spam folder if
            it doesn&apos;t arrive within a few minutes.
          </>
        }
        action={{ href: LOGIN_PATH, label: "Back to sign in" }}
      />
    );
  }

  const emailError = formik.submitCount > 0 ? formik.errors.email : undefined;

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <AuthHeading
        title="Forgot your password?"
        description="Enter the email address you sign in with and we'll send you a link to set a new one."
      />

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col">
        <FormAlert tone="error">
          {request.isError ? getApiError(request.error).message : null}
        </FormAlert>

        <div className="flex flex-col gap-4.5">
          <AuthField
            id="email"
            name="email"
            type="email"
            label="Email address"
            icon={<Mail className="size-4.5 shrink-0" />}
            autoComplete="email"
            spellCheck={false}
            placeholder="you@company.com"
            value={formik.values.email}
            onChange={(event) => {
              request.reset();
              formik.handleChange(event);
            }}
            error={emailError}
            delay={150}
          />

          <SubmitButton busy={formik.isSubmitting} busyLabel="Sending…" delay={200}>
            Send reset link
          </SubmitButton>
        </div>
      </form>

      <Reveal delay={260} className="flex justify-center border-t pt-5.5">
        <Link
          href={LOGIN_PATH}
          className="flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </Reveal>
    </div>
  );
}
