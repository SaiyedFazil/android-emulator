"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { AtSign } from "lucide-react";

import {
  AuthField,
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
import { signOutAction } from "@/lib/auth/auth-actions";
import { LOGIN_PATH } from "@/lib/auth/roles";
import { acceptInvitationSchema, PASSWORD_MIN_LENGTH } from "@/lib/validation";

/** Backend codes shown on a field rather than above the form. */
const FIELD_ERRORS: Record<string, "username" | "password"> = {
  USERNAME_TAKEN: "username",
  AUTH_PASSWORD_WEAK: "password",
};

function InvalidInvitation() {
  return (
    <AuthNotice
      title="This invitation has expired"
      description="This link has expired or was already used. Ask your administrator for a new invite."
      action={{ href: LOGIN_PATH, label: "Go to sign in" }}
    />
  );
}

export function AcceptInviteForm() {
  const router = useRouter();
  const token = useLinkToken();
  const [linkSpent, setLinkSpent] = React.useState(false);

  const invitation = useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => (await authApi.verifyInvitation(token!)).data,
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  const accept = useMutation({
    mutationFn: (values: { username: string; password: string }) =>
      authApi.acceptInvitation({ token: token!, ...values }),
  });

  const formik = useFormik({
    initialValues: { username: "", password: "", confirmPassword: "" },
    validationSchema: acceptInvitationSchema,
    validateOnBlur: false,
    onSubmit: async ({ username, password }, helpers) => {
      try {
        await accept.mutateAsync({ username: username.trim().toLowerCase(), password });
      } catch (error) {
        const { code, message } = getApiError(error);
        if (code === "AUTH_LINK_INVALID") setLinkSpent(true);
        if (code && FIELD_ERRORS[code]) {
          helpers.setFieldError(
            FIELD_ERRORS[code],
            code === "USERNAME_TAKEN" ? "That username is taken. Choose another." : message
          );
        }
        return;
      }
      // Start clean: a session from another account in this browser must not carry over.
      await signOutAction();
      router.replace("/login?welcome=1");
    },
  });

  if (token === undefined || (token && invitation.isPending)) return <CheckingLink />;
  if (token === null || linkSpent || getApiError(invitation.error).code === "AUTH_LINK_INVALID") {
    return <InvalidInvitation />;
  }
  if (invitation.isError) {
    return (
      <AuthNotice
        title="Couldn't check your invitation"
        description={getApiError(invitation.error).message}
      />
    );
  }

  const submitted = formik.submitCount > 0;
  const { code: acceptCode, message: acceptMessage } = getApiError(accept.error);
  const serverError =
    accept.isError && !(acceptCode && FIELD_ERRORS[acceptCode]) ? acceptMessage : null;
  const invited = invitation.data;

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <AuthHeading
        title={`Welcome, ${invited?.firstName}`}
        description={
          <>
            Choose a username and password for{" "}
            <span className="font-medium text-foreground">{invited?.email}</span>
            {invited?.organizationName ? ` at ${invited.organizationName}` : ""}.
          </>
        }
      />

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col">
        <FormAlert tone="error">{serverError}</FormAlert>

        <div className="flex flex-col gap-4.5">
          <AuthField
            id="username"
            name="username"
            label="Username"
            icon={<AtSign className="size-4.5 shrink-0" />}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. john.doe"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={submitted ? formik.errors.username : undefined}
            delay={150}
          />
          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={submitted ? formik.errors.password : undefined}
            delay={200}
          />
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Enter it again"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={submitted ? formik.errors.confirmPassword : undefined}
            delay={250}
          />

          <SubmitButton busy={formik.isSubmitting} busyLabel="Setting up…" delay={300}>
            Activate account
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
