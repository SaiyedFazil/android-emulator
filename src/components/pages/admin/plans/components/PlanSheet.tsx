"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

import { PLANS_QUERY_KEY } from "@/components/pages/admin/plans/constants/plan.constants";
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
import { Textarea } from "@/components/ui/textarea";
import { getApiError } from "@/lib/api/api-error";
import { plansApi } from "@/lib/api/plans/plans-api";
import { planSchema } from "@/lib/validation";
import type { ApiPlan, PlanInput } from "@/types/admin.types";

/** The form keeps the limit as typed; it is sent as a number. */
type Values = { name: string; description: string; emulatorLimit: string };

const valuesOf = (plan: ApiPlan | null): Values => ({
  name: plan?.name ?? "",
  description: plan?.description ?? "",
  emulatorLimit: plan ? String(plan.emulatorLimit) : "",
});

/** Only the fields that differ from the saved plan. */
function changesOf(saved: ApiPlan, input: PlanInput): Partial<PlanInput> {
  const changes: Partial<PlanInput> = {};
  if (input.name !== saved.name) changes.name = input.name;
  if (input.description !== saved.description) changes.description = input.description;
  if (input.emulatorLimit !== saved.emulatorLimit) changes.emulatorLimit = input.emulatorLimit;
  return changes;
}

interface PlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The plan to edit; `null` creates a new one. */
  plan: ApiPlan | null;
}

export function PlanSheet({ open, onOpenChange, plan }: PlanSheetProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = React.useState<string | null>(null);
  const editing = plan !== null;
  const save = useMutation({
    mutationFn: (input: Partial<PlanInput>) =>
      plan ? plansApi.updatePlan(plan.uuid, input) : plansApi.createPlan(input as PlanInput),
  });

  const formik = useFormik<Values>({
    initialValues: valuesOf(plan),
    enableReinitialize: true,
    validationSchema: planSchema,
    onSubmit: async (values, helpers) => {
      setFormError(null);
      const input = planSchema.cast(values) as PlanInput;
      // Editing sends only what changed; nothing changed (e.g. only spaces added) saves nothing.
      const body = plan ? changesOf(plan, input) : input;
      if (Object.keys(body).length === 0) {
        close();
        return;
      }
      let saved: ApiPlan;
      try {
        saved = (await save.mutateAsync(body)).data;
      } catch (error) {
        const { status, code, message } = getApiError(error);
        if (code === "PLAN_NAME_TAKEN") {
          helpers.setFieldError("name", "Another plan already has this name.");
        } else if (status === 404) {
          setFormError("This plan was deleted.");
          void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        } else {
          setFormError(message);
        }
        return;
      }
      toast.success(editing ? "Plan updated" : "Plan created", { description: saved.name });
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
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
  const fieldProps = (name: keyof Values) => ({
    id: `plan-${name}`,
    ...formik.getFieldProps(name),
    "aria-invalid": errorOf(name) ? true : undefined,
    "aria-describedby": errorOf(name) ? `plan-${name}-error` : undefined,
  });
  const fieldError = (name: keyof Values) =>
    errorOf(name) ? (
      <p id={`plan-${name}-error`} className="text-xs text-destructive">
        {errorOf(name)}
      </p>
    ) : null;

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent className="w-full sm:max-w-md">
        <form onSubmit={formik.handleSubmit} noValidate className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{plan ? `Edit ${plan.name}` : "New plan"}</SheetTitle>
            <SheetDescription>
              A plan sets how many emulators an organization can have.
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
              <Label htmlFor="plan-name">Name</Label>
              <Input {...fieldProps("name")} autoComplete="off" className="h-9" />
              {fieldError("name")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea {...fieldProps("description")} rows={4} />
              {fieldError("description")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-emulatorLimit">Emulator limit</Label>
              <Input
                {...fieldProps("emulatorLimit")}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                className="h-9"
              />
              {errorOf("emulatorLimit") ? (
                fieldError("emulatorLimit")
              ) : (
                <p className="text-xs text-muted-foreground">
                  How many emulators an organization on this plan can have.
                </p>
              )}
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting || (editing && !formik.dirty)}>
              {formik.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create plan"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
