"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

import { TEAM_ROLE } from "@/components/pages/admin/constants/status.constants";
import { ACCESS_LEVELS } from "@/components/pages/admin/team/constants/access.constants";
import { TEAM_QUERY_KEY } from "@/components/pages/admin/team/constants/team.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getApiError } from "@/lib/api/api-error";
import { adminTeamApi } from "@/lib/api/admin-team/admin-team-api";
import { teamInviteSchema } from "@/lib/validation";
import type { TeamInvite, TeamRole } from "@/types/admin.types";

const INITIAL: TeamInvite = { firstName: "", lastName: "", email: "", role: "SUPPORT" };

const ROLES = ACCESS_LEVELS.filter(
  (level): level is (typeof ACCESS_LEVELS)[number] & { role: TeamRole } => level.role !== "OWNER"
);

/** The owner invites an admin or support member; a removed member's account is restored. */
export function InviteAdminSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = React.useState<string | null>(null);
  const invite = useMutation({ mutationFn: adminTeamApi.invite });

  const formik = useFormik<TeamInvite>({
    initialValues: INITIAL,
    validationSchema: teamInviteSchema,
    onSubmit: async (values, helpers) => {
      setFormError(null);
      const body = teamInviteSchema.cast(values) as TeamInvite;
      let invited;
      try {
        invited = (await invite.mutateAsync(body)).data;
      } catch (error) {
        const { code, message } = getApiError(error);
        if (code === "EMAIL_TAKEN") {
          helpers.setFieldError("email", "This email already has an account.");
        } else {
          setFormError(message);
        }
        return;
      }
      if (invited.restored) {
        toast.success("Account restored", {
          description:
            "This person had an account before. It was restored and a new invitation was sent.",
        });
      } else {
        toast.success("Invitation sent", {
          description: `${invited.email} · ${TEAM_ROLE[body.role].label}`,
        });
      }
      void queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
      close();
    },
  });

  const close = () => {
    formik.resetForm();
    setFormError(null);
    onOpenChange(false);
  };

  const errorOf = (field: keyof TeamInvite) =>
    formik.touched[field] ? formik.errors[field] : undefined;
  const textField = (
    name: "firstName" | "lastName" | "email",
    label: string,
    props: React.ComponentProps<typeof Input> = {}
  ) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`invite-${name}`}>{label}</Label>
      <Input
        id={`invite-${name}`}
        autoComplete="off"
        {...props}
        {...formik.getFieldProps(name)}
        aria-invalid={errorOf(name) ? true : undefined}
        aria-describedby={errorOf(name) ? `invite-${name}-error` : undefined}
        className="h-9"
      />
      {errorOf(name) ? (
        <p id={`invite-${name}-error`} className="text-xs text-destructive">
          {errorOf(name)}
        </p>
      ) : null}
    </div>
  );
  const level = ROLES.find((l) => l.role === formik.values.role);

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent className="w-full sm:max-w-md">
        <form onSubmit={formik.handleSubmit} noValidate className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Invite an admin</SheetTitle>
            <SheetDescription>
              They get an email to choose a username and password.
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
            <div className="grid gap-5 sm:grid-cols-2">
              {textField("firstName", "First name")}
              {textField("lastName", "Last name")}
            </div>
            {textField("email", "Work email", { type: "email", placeholder: "name@example.com" })}
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={formik.values.role}
                onValueChange={(value) => void formik.setFieldValue("role", value as TeamRole)}
              >
                <SelectTrigger id="invite-role" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((l) => (
                    <SelectItem key={l.role} value={l.role}>
                      {TEAM_ROLE[l.role].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {level ? <p className="text-xs text-muted-foreground">{level.summary}</p> : null}
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Sending…" : "Send invite"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
