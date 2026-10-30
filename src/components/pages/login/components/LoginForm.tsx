"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import { getSession, signIn } from "next-auth/react";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";

import {
  AuthField,
  AuthHeading,
  FormAlert,
  PasswordField,
  SubmitButton,
} from "@/components/pages/login/components/AuthFormParts";
import { Reveal } from "@/components/pages/login/components/Reveal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { loginErrorMessage } from "@/lib/auth/login-errors";
import { areaRoleOf, safeNext } from "@/lib/auth/roles";
import { loginSchema } from "@/lib/validation";

interface LoginValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

/** After accepting an invitation or resetting the password, the user lands here to sign in. */
function PasswordSetNotice() {
  const params = useSearchParams();
  const passwordSet = params.get("welcome") === "1" || params.get("reset") === "1";
  return (
    <FormAlert tone="success">
      {passwordSet ? (
        <>
          <span className="font-semibold">Your password is set.</span> Sign in to continue.
        </>
      ) : null}
    </FormAlert>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [redirecting, setRedirecting] = React.useState(false);

  const formik = useFormik<LoginValues>({
    initialValues: { identifier: "", password: "", rememberMe: false },
    validationSchema: loginSchema,
    validateOnBlur: false,
    onSubmit: async ({ identifier, password, rememberMe }) => {
      setServerError(null);
      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        rememberMe: String(rememberMe),
        redirect: false,
      });
      if (!result?.ok || result.error) {
        setServerError(loginErrorMessage(result?.code));
        return;
      }
      const session = await getSession();
      if (!session?.user) {
        setServerError(loginErrorMessage(undefined));
        return;
      }
      setRedirecting(true);
      // Read `?next=` at submit time: the form itself then needs no Suspense boundary.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(safeNext(areaRoleOf(session.user.role), next));
    },
  });

  const submitted = formik.submitCount > 0;
  const missing = {
    identifier: submitted && Boolean(formik.errors.identifier),
    password: submitted && Boolean(formik.errors.password),
  };

  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    formik.handleChange(event);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <AuthHeading
        title="Welcome back"
        description="Sign in to manage and monitor your emulators."
      />

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col">
        <React.Suspense fallback={null}>
          <PasswordSetNotice />
        </React.Suspense>

        <FormAlert tone="error">
          {serverError ??
            (missing.identifier || missing.password ? (
              <>
                <span className="font-semibold">Missing details.</span> Enter your email or username
                and your password.
              </>
            ) : null)}
        </FormAlert>

        <div className="flex flex-col gap-4.5">
          <AuthField
            id="identifier"
            name="identifier"
            label="Email or username"
            icon={<UserRound className="size-4.5 shrink-0" />}
            autoComplete="username"
            spellCheck={false}
            placeholder="you@company.com or username"
            value={formik.values.identifier}
            onChange={onFieldChange}
            aria-invalid={missing.identifier || undefined}
            delay={150}
          />

          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={onFieldChange}
            aria-invalid={missing.password || undefined}
            labelAction={
              <Link
                href="/forgot-password"
                className="rounded-sm text-[13px] font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Forgot password?
              </Link>
            }
            delay={200}
          />

          <Reveal delay={250} className="flex items-center gap-2.5">
            <Checkbox
              id="remember"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onCheckedChange={(checked) => formik.setFieldValue("rememberMe", checked === true)}
              className="size-4.5 rounded-[5px]"
            />
            <Label htmlFor="remember" className="font-normal">
              Remember me
            </Label>
          </Reveal>

          <SubmitButton
            busy={formik.isSubmitting || redirecting}
            busyLabel="Signing in…"
            delay={300}
          >
            Sign in
            <ArrowRight className="size-4.25 transition-transform group-hover/submit:translate-x-0.5" />
          </SubmitButton>
        </div>
      </form>

      <Reveal
        delay={380}
        className="flex items-center justify-center gap-2 border-t pt-5.5 text-[13px] text-muted-foreground"
      >
        <ShieldCheck className="size-3.75 shrink-0 text-primary" />
        <p>
          <span className="font-medium text-foreground">Need access?</span> Contact your
          administrator.
        </p>
      </Reveal>
    </div>
  );
}
