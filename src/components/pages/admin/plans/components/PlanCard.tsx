"use client";

import { Pencil, Smartphone, Trash2 } from "lucide-react";

import { LocalTime } from "@/components/custom/LocalTime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNow } from "@/hooks/use-now";
import { formatRelativeTime } from "@/lib/format";
import type { ApiPlan } from "@/types/admin.types";

interface PlanCardProps {
  plan: ApiPlan;
  /** The owner and admins edit and delete plans; support only reads them. */
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PlanCard({ plan, canManage, onEdit, onDelete }: PlanCardProps) {
  const now = useNow();

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight break-words">{plan.name}</h2>
        <p className="text-sm whitespace-pre-line text-muted-foreground">{plan.description}</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Smartphone className="size-4" aria-hidden="true" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-xl font-semibold tabular">
            {plan.emulatorLimit.toLocaleString("en-US")}
          </span>
          <span className="text-xs text-muted-foreground">Emulator limit</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
        <LocalTime value={plan.updatedAt} format="date" className="text-xs text-muted-foreground">
          {now ? `Updated ${formatRelativeTime(plan.updatedAt, now)}` : undefined}
        </LocalTime>
        {canManage ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Edit ${plan.name}`}>
              <Pencil />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              aria-label={`Delete ${plan.name}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
