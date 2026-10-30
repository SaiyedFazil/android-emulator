"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import { getSession, signIn } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Reveal } from "@/components/pages/login/components/Reveal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginErrorMessage } from "@/lib/auth/login-errors";
import { areaRoleOf, safeNext } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { loginSchema } from "@/lib/validation";

/** The bordered box holds the icon, the input and (for the password) the eye button. */
const FIELD_CLASS =
  "flex h-12 items-center gap-2.5 rounded-[10px] border border-input bg-card px-3.5 text-muted-foreground transition-[border-color,box-shadow] hover:border-ring/40 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20";
const INPUT_CLASS =
  "h-full rounded-none border-0 bg-transparent p-0 text-[15px] text-foreground focus-visible:ring-0 aria-invalid:ring-0 md:text-[14.5px] dark:bg-transparent";
const SWAP = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.15 },
};
const ALERT_MOTION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const;

interface LoginValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

/** After accepting an invitation or resetting the password, the user lands here to sign in. */
function PasswordSetNotice() {
  const params = useSearchParams();
  if (params.get("welcome") !== "1" && params.get("reset") !== "1") return null;
  return (
    <div
      role="status"
      className="mb-4.5 flex items-start gap-2.5 rounded-[10px] border border-primary/30 bg-primary/10 px-3.5 py-3 text-[13.5px] leading-snug text-primary"
    >
      <CircleCheck className="mt-px size-4.5 shrink-0" />
      <span>
        <span className="font-semibold">Your password is set.</span> Sign in to continue.
      </span>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
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
  const busy = formik.isSubmitting || redirecting;

  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    formik.handleChange(event);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Reveal delay={50}>
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight lg:text-3xl">
            Welcome back
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
            Sign in to manage and monitor your emulators.
          </p>
        </Reveal>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col">
        <React.Suspense fallback={null}>
          <PasswordSetNotice />
        </React.Suspense>

        <AnimatePresence initial={false}>
          {serverError || missing.identifier || missing.password ? (
            <motion.div key="error" {...ALERT_MOTION} className="overflow-hidden">
              <div
                role="alert"
                className="mb-4.5 flex items-start gap-2.5 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-[13.5px] leading-snug text-destructive"
              >
                <CircleAlert className="mt-px size-4.5 shrink-0" />
                {serverError ? (
                  <span>{serverError}</span>
                ) : (
                  <span>
                    <span className="font-semibold">Missing details.</span> Enter your email or
                    username and your password.
                  </span>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col gap-4.5">
          <Reveal delay={150} className="flex flex-col gap-2">
            <Label htmlFor="identifier" className="text-[13px]">
              Email or username
            </Label>
            <div className={FIELD_CLASS}>
              <UserRound className="size-4.5 shrink-0" />
              <Input
                id="identifier"
                name="identifier"
                autoComplete="username"
                spellCheck={false}
                placeholder="you@company.com or username"
                value={formik.values.identifier}
                onChange={onFieldChange}
                aria-invalid={missing.identifier || undefined}
                className={INPUT_CLASS}
              />
            </div>
          </Reveal>

          <Reveal delay={200} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-[13px]">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="rounded-sm text-[13px] font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Forgot password?
              </Link>
            </div>
            <div className={cn(FIELD_CLASS, "pr-1")}>
              <LockKeyhole className="size-4.5 shrink-0" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={onFieldChange}
                aria-invalid={missing.password || undefined}
                className={INPUT_CLASS}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                aria-controls="password"
                className="size-10 text-muted-foreground hover:text-foreground"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={showPassword ? "hide" : "show"}
                    initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </div>
          </Reveal>

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

          <Reveal delay={300}>
            <Button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="group/submit relative h-12 w-full overflow-hidden rounded-[10px] text-[15px] font-semibold after:pointer-events-none after:absolute after:inset-y-0 after:-left-3/5 after:w-2/5 after:-skew-x-20 after:bg-linear-to-r after:from-transparent after:via-shine after:to-transparent hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-90 motion-safe:hover:after:animate-sheen"
            >
              <AnimatePresence mode="wait" initial={false}>
                {busy ? (
                  <motion.span key="busy" {...SWAP} className="flex items-center gap-2.5">
                    <LoaderCircle className="size-4.25 animate-spin" />
                    Signing in…
                  </motion.span>
                ) : (
                  <motion.span key="idle" {...SWAP} className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="size-4.25 transition-transform group-hover/submit:translate-x-0.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Reveal>
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
