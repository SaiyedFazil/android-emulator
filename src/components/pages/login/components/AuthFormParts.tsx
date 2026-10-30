"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

import { Reveal } from "@/components/pages/login/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * The pieces every sign-in page form shares (sign in, forgot and reset password, accept invite),
 * so the four look and behave alike.
 */

/** The bordered box holds the icon, the input and (for a password) the eye button. */
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

export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Reveal delay={50}>
        <h1 className="text-[26px] leading-tight font-semibold tracking-tight lg:text-3xl">
          {title}
        </h1>
      </Reveal>
      <Reveal delay={100}>
        <p className="text-sm leading-relaxed text-muted-foreground lg:text-[15px]">
          {description}
        </p>
      </Reveal>
    </div>
  );
}

/** A page with no form: a message and, optionally, one way on (e.g. back to sign in). */
export function AuthNotice({
  title,
  description,
  action,
}: {
  title: string;
  description: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <AuthHeading title={title} description={description} />
      {action ? (
        <Reveal delay={150}>
          <Button asChild variant="outline" className="h-12 w-full rounded-[10px] text-[15px]">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Shown while an emailed link is being checked. */
export function CheckingLink() {
  return (
    <AuthNotice
      title="Checking your link…"
      description={
        <span className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          One moment.
        </span>
      }
    />
  );
}

/** An error or success box above the fields; animates in and out as `children` comes and goes. */
export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.div key={tone} {...ALERT_MOTION} className="overflow-hidden">
          <div
            role={tone === "error" ? "alert" : "status"}
            className={cn(
              "mb-4.5 flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13.5px] leading-snug",
              tone === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            <Icon className="mt-px size-4.5 shrink-0" />
            <span>{children}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type FieldProps = Omit<React.ComponentProps<typeof Input>, "className"> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Shown under the field and marks it invalid. */
  error?: string;
  /** Beside the label, e.g. a "Forgot password?" link. */
  labelAction?: React.ReactNode;
  /** Inside the box after the input, e.g. the eye button. */
  trailing?: React.ReactNode;
  delay: number;
};

export function AuthField({
  id,
  label,
  icon,
  error,
  labelAction,
  trailing,
  delay,
  ...input
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <Reveal delay={delay} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-[13px]">
          {label}
        </Label>
        {labelAction}
      </div>
      <div className={cn(FIELD_CLASS, trailing ? "pr-1" : null)}>
        {icon}
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={INPUT_CLASS}
          {...input}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} className="text-[12.5px] leading-snug text-destructive">
          {error}
        </p>
      ) : null}
    </Reveal>
  );
}

/** A password field with a show/hide toggle. */
export function PasswordField(props: Omit<FieldProps, "icon" | "trailing" | "type">) {
  const [shown, setShown] = React.useState(false);
  return (
    <AuthField
      {...props}
      type={shown ? "text" : "password"}
      icon={<LockKeyhole className="size-4.5 shrink-0" />}
      trailing={
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          aria-controls={props.id}
          className="size-10 text-muted-foreground hover:text-foreground"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={shown ? "hide" : "show"}
              initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {shown ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </motion.span>
          </AnimatePresence>
        </Button>
      }
    />
  );
}

export function SubmitButton({
  busy,
  busyLabel,
  children,
  delay,
}: {
  busy: boolean;
  busyLabel: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
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
              {busyLabel}
            </motion.span>
          ) : (
            <motion.span key="idle" {...SWAP} className="flex items-center gap-2">
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </Reveal>
  );
}
