"use client";

import * as React from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Plan } from "@/types/admin.types";

interface PlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The plan to edit; `null` creates a new one. */
  plan: Plan | null;
}

// TODO(api): saves through the plans API; changing a price applies to new periods only.
export function PlanSheet({ open, onOpenChange, plan }: PlanSheetProps) {
  const editing = plan !== null;
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim() || "Plan";
    toast.success(editing ? "Plan updated" : "Plan created", { description: name });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        {/* Remount per plan so the fields start from that plan's values. */}
        <form key={plan?.id ?? "new"} onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{editing ? `Edit ${plan.name}` : "New plan"}</SheetTitle>
            <SheetDescription>
              Plans differ by how many emulators an organization can run at once.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                name="name"
                defaultValue={plan?.name}
                required
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                name="description"
                defaultValue={plan?.description}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-price">Monthly price (USD)</Label>
                <Input
                  id="plan-price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Custom"
                  defaultValue={plan?.priceMonthly != null ? plan.priceMonthly / 100 : undefined}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">Leave empty for custom pricing.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-emulators">Concurrent emulators</Label>
                <Input
                  id="plan-emulators"
                  name="emulators"
                  type="number"
                  min={1}
                  required
                  defaultValue={plan?.concurrentEmulators}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="plan-visible">Offer to new organizations</Label>
                <p className="text-xs text-muted-foreground">
                  Hidden plans stay on existing subscriptions but can&apos;t be picked at sign-up.
                </p>
              </div>
              <Switch id="plan-visible" name="visible" defaultChecked={plan?.visible ?? true} />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Create plan"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
