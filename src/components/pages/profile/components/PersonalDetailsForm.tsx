"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

import { TimezoneSelect } from "@/components/custom/TimezoneSelect";
import {
  profileFormValues,
  profilePatch,
  type ProfileFormValues,
} from "@/components/pages/profile/utils/profile.utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ME_QUERY_KEY, useMe } from "@/hooks/use-me";
import { getApiError } from "@/lib/api/api-error";
import { meApi, type ProfileFields } from "@/lib/api/me/me-api";
import type { Me } from "@/types/auth.types";
import { profileSchema } from "@/lib/validation";

const EMPTY: ProfileFormValues = { firstName: "", lastName: "", phone: "", timezone: "UTC" };

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

export function PersonalDetailsForm() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const save = useMutation({
    mutationFn: async (patch: Partial<ProfileFields>) => (await meApi.updateMe(patch)).data,
    // Every profile query (["me", userId]); `useMe` stores the new copy.
    onSuccess: (updated) => queryClient.setQueriesData<Me>({ queryKey: ME_QUERY_KEY }, updated),
  });

  const formik = useFormik<ProfileFormValues>({
    initialValues: me ? profileFormValues(me) : EMPTY,
    enableReinitialize: true,
    validationSchema: profileSchema,
    onSubmit: async (values, helpers) => {
      if (!me) return;
      const patch = profilePatch(me, values);
      if (Object.keys(patch).length === 0) return;
      try {
        const updated = await save.mutateAsync(patch);
        helpers.resetForm({ values: profileFormValues(updated) });
        toast.success("Profile updated");
      } catch (error) {
        toast.error(getApiError(error).message);
      }
    },
  });

  if (!me) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>How your name and contact details appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const errorOf = (field: keyof ProfileFormValues) =>
    formik.touched[field] ? formik.errors[field] : undefined;
  const field = (name: keyof ProfileFormValues) => ({
    id: name,
    ...formik.getFieldProps(name),
    "aria-invalid": errorOf(name) ? true : undefined,
    "aria-describedby": errorOf(name) ? `${name}-error` : undefined,
    className: "h-9",
  });

  return (
    <Card>
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex flex-col gap-(--card-spacing)"
      >
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>How your name and contact details appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input {...field("firstName")} autoComplete="given-name" />
            <FieldError id="firstName-error" message={errorOf("firstName")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input {...field("lastName")} autoComplete="family-name" />
            <FieldError id="lastName-error" message={errorOf("lastName")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={me.email} readOnly disabled className="h-9" />
            <p className="text-xs text-muted-foreground">
              Ask an administrator to change your email.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">
              Phone <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              {...field("phone")}
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
            <FieldError id="phone-error" message={errorOf("phone")} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="timezone">Time zone</Label>
            <TimezoneSelect
              id="timezone"
              value={formik.values.timezone}
              onChange={(timezone) => formik.setFieldValue("timezone", timezone)}
            />
            <p className="text-xs text-muted-foreground">
              For emails and reports. Times on screen follow this device&apos;s time zone.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={!formik.dirty || formik.isSubmitting}
            onClick={() => formik.resetForm()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!formik.dirty || formik.isSubmitting}>
            {formik.isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
