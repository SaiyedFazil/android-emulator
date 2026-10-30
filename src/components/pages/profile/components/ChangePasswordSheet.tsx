"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ME_QUERY_KEY } from "@/hooks/use-me";
import { getApiError } from "@/lib/api/api-error";
import { meApi } from "@/lib/api/me/me-api";
import { loginErrorMessage } from "@/lib/auth/login-errors";
import { changePasswordSchema, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { SESSIONS_QUERY_KEY } from "@/components/pages/profile/components/Devices";

type Values = { currentPassword: string; password: string; confirmPassword: string };

const INITIAL: Values = { currentPassword: "", password: "", confirmPassword: "" };

/** Backend refusals shown on a field, with the message to show. */
const FIELD_ERRORS: Record<string, [keyof Values, string | null]> = {
  AUTH_PASSWORD_INCORRECT: ["currentPassword", "That isn't your current password."],
  AUTH_PASSWORD_UNCHANGED: ["password", "Choose a password different from your current one."],
  AUTH_PASSWORD_WEAK: ["password", null],
};

export function ChangePasswordSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = React.useState<string | null>(null);
  const change = useMutation({
    mutationFn: (values: Values) => meApi.changePassword(values.currentPassword, values.password),
  });

  const formik = useFormik<Values>({
    initialValues: INITIAL,
    validationSchema: changePasswordSchema,
    onSubmit: async (values, helpers) => {
      setFormError(null);
      try {
        await change.mutateAsync(values);
      } catch (error) {
        const { code, message, details } = getApiError(error);
        const onField = code ? FIELD_ERRORS[code] : undefined;
        if (onField) {
          helpers.setFieldError(onField[0], onField[1] ?? message);
        } else if (code === "AUTH_ACCOUNT_LOCKED") {
          setFormError(loginErrorMessage(`${code}:${String(details?.retryAfterSeconds ?? "")}`));
        } else {
          setFormError(message);
        }
        return;
      }
      toast.success("Password changed", { description: "Your other devices were signed out." });
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      close();
    },
  });

  const close = () => {
    formik.resetForm();
    setFormError(null);
    onOpenChange(false);
  };

  const errorOf = (field: keyof Values) =>
    formik.touched[field] ? formik.errors[field] : undefined;
  const passwordInput = (name: keyof Values, autoComplete: string, placeholder?: string) => (
    <>
      <Input
        id={name}
        type="password"
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...formik.getFieldProps(name)}
        aria-invalid={errorOf(name) ? true : undefined}
        aria-describedby={errorOf(name) ? `${name}-error` : undefined}
        className="h-9"
      />
      {errorOf(name) ? (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {errorOf(name)}
        </p>
      ) : null}
    </>
  );

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent className="w-full sm:max-w-md">
        <form onSubmit={formik.handleSubmit} noValidate className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Change password</SheetTitle>
            <SheetDescription>
              Your other devices are signed out; this one stays signed in.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
            {formError ? (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              {passwordInput("currentPassword", "current-password")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">New password</Label>
              {passwordInput(
                "password",
                "new-password",
                `At least ${PASSWORD_MIN_LENGTH} characters`
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              {passwordInput("confirmPassword", "new-password")}
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Changing…" : "Change password"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
