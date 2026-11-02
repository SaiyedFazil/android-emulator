"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, RotateCw } from "lucide-react";
import { toast } from "sonner";

import { ConfirmActionDialog } from "@/components/custom/ConfirmActionDialog";
import { EmptyState } from "@/components/custom/EmptyState";
import { PageHeader } from "@/components/custom/PageHeader";
import { PlanCard } from "@/components/pages/admin/plans/components/PlanCard";
import { PlanSheet } from "@/components/pages/admin/plans/components/PlanSheet";
import { PLANS_QUERY_KEY } from "@/components/pages/admin/plans/constants/plan.constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiError } from "@/lib/api/api-error";
import { plansApi } from "@/lib/api/plans/plans-api";
import { useSession } from "@/lib/auth/session-client";
import type { ApiPlan } from "@/types/admin.types";

function PlanCardSkeleton() {
  return (
    <Card className="gap-5 p-5" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-8 w-full" />
    </Card>
  );
}

export function Plans() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const role = session?.user.role;
  // The owner and admins change plans; support only reads them. The API enforces it.
  const canManage = role === "OWNER" || role === "ADMIN";

  const [sheet, setSheet] = React.useState<{ open: boolean; plan: ApiPlan | null }>({
    open: false,
    plan: null,
  });
  // Kept while the dialog closes, so its text stays during the fade-out.
  const [deleting, setDeleting] = React.useState<ApiPlan | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const plans = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: async () => (await plansApi.getPlans()).data,
  });

  const remove = useMutation({
    mutationFn: (plan: ApiPlan) => plansApi.deletePlan(plan.uuid),
    onSuccess: (_, plan) => {
      setConfirmOpen(false);
      toast.success(`${plan.name} deleted`);
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getApiError(error).message);
      void queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    },
  });

  const openNew = () => setSheet({ open: true, plan: null });
  const newPlanButton = canManage ? (
    <Button size="lg" onClick={openNew}>
      <Plus />
      New plan
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plans"
        description="Each plan sets how many emulators an organization can have."
        actions={newPlanButton}
      />

      {plans.isPending ? (
        <div className="grid gap-4 pt-1 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : plans.isError ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6">
          <p className="text-sm text-destructive">{getApiError(plans.error).message}</p>
          <Button variant="outline" size="sm" onClick={() => void plans.refetch()}>
            <RotateCw />
            Try again
          </Button>
        </div>
      ) : plans.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Layers />}
            title="No plans yet"
            description={
              canManage
                ? "Create the first plan to set how many emulators an organization can have."
                : "The owner or an admin creates plans."
            }
            action={
              canManage ? (
                <Button variant="outline" onClick={openNew}>
                  <Plus />
                  New plan
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 pt-1 sm:grid-cols-2 xl:grid-cols-3">
          {plans.data.map((plan) => (
            <PlanCard
              key={plan.uuid}
              plan={plan}
              canManage={canManage}
              onEdit={() => setSheet({ open: true, plan })}
              onDelete={() => {
                setDeleting(plan);
                setConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {canManage ? (
        <>
          <PlanSheet
            open={sheet.open}
            onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
            plan={sheet.plan}
          />
          <ConfirmActionDialog
            open={confirmOpen}
            title={`Delete ${deleting?.name ?? "plan"}?`}
            description="This can't be undone."
            confirmLabel="Delete"
            destructive
            pending={remove.isPending}
            onConfirm={() => deleting && remove.mutate(deleting)}
            onOpenChange={(open) => {
              if (!open && !remove.isPending) setConfirmOpen(false);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
