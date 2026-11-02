"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCw, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/custom/data-table";
import { DataTableSkeleton } from "@/components/custom/data-table/DataTableSkeleton";
import { PageHeader } from "@/components/custom/PageHeader";
import { ConfirmActionDialog } from "@/components/pages/admin/team/components/ConfirmActionDialog";
import { InviteAdminSheet } from "@/components/pages/admin/team/components/InviteAdminSheet";
import { TEAM_QUERY_KEY } from "@/components/pages/admin/team/constants/team.constants";
import { fullName, teamColumns, type TeamAction } from "@/components/pages/admin/team/TeamColumns";
import { Button } from "@/components/ui/button";
import { getApiError } from "@/lib/api/api-error";
import { adminTeamApi } from "@/lib/api/admin-team/admin-team-api";
import { useSession } from "@/lib/auth/session-client";
import type { TeamMember } from "@/types/admin.types";

/** Actions that sign someone out or remove them are confirmed first. */
type Confirmable = Extract<TeamAction, "suspend" | "remove">;

/** Runs an action and says what happened. */
async function runAction(action: TeamAction, member: TeamMember): Promise<void> {
  const name = fullName(member);
  switch (action) {
    case "make-admin":
    case "make-support": {
      const role = action === "make-admin" ? "ADMIN" : "SUPPORT";
      await adminTeamApi.changeRole(member.uuid, role);
      toast.success(`${name} is now ${role === "ADMIN" ? "Admin" : "Support"}`, {
        description: "They were signed out and sign in again with the new role.",
      });
      break;
    }
    case "resend-invite":
      await adminTeamApi.resendInvite(member.uuid);
      toast.success("Invitation resent", { description: member.email });
      break;
    case "suspend":
      await adminTeamApi.changeStatus(member.uuid, "SUSPENDED");
      toast.success(`${name} suspended`, { description: "Signed out everywhere." });
      break;
    case "reactivate":
      await adminTeamApi.changeStatus(member.uuid, "ACTIVE");
      toast.success(`${name} reactivated`);
      break;
    case "remove":
      await adminTeamApi.remove(member.uuid);
      toast.success(`${name} removed`);
      break;
  }
}

const CONFIRM: Record<
  Confirmable,
  (member: TeamMember) => {
    title: string;
    description: string;
    confirmLabel: string;
    destructive: boolean;
  }
> = {
  suspend: (member) => ({
    title: `Suspend ${fullName(member)}?`,
    description:
      "They're signed out everywhere at once and can't sign in until you reactivate them.",
    confirmLabel: "Suspend",
    destructive: false,
  }),
  remove: (member) => ({
    title: `Remove ${fullName(member)}?`,
    description: `They lose access at once. Inviting ${member.email} again restores the account with a new invitation.`,
    confirmLabel: "Remove",
    destructive: true,
  }),
};

export function Team() {
  const queryClient = useQueryClient();
  const [inviting, setInviting] = React.useState(false);
  // Kept while the dialog closes, so its text stays during the fade-out.
  const [confirming, setConfirming] = React.useState<{
    action: Confirmable;
    member: TeamMember;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const { data: session } = useSession();
  const viewerUuid = session?.user.uuid;
  // Only the owner changes the team; the API refuses everyone else anyway.
  const canManage = session?.user.role === "OWNER";

  const team = useQuery({
    queryKey: TEAM_QUERY_KEY,
    queryFn: async () => (await adminTeamApi.getTeam()).data,
  });

  const act = useMutation({
    mutationFn: ({ action, member }: { action: TeamAction; member: TeamMember }) =>
      runAction(action, member),
    onSuccess: () => {
      setConfirmOpen(false);
      void queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },
    onError: (error) => toast.error(getApiError(error).message),
  });

  const { mutate } = act;
  const onAction = React.useCallback(
    (action: TeamAction, member: TeamMember) => {
      if (action === "suspend" || action === "remove") {
        setConfirming({ action, member });
        setConfirmOpen(true);
      } else {
        mutate({ action, member });
      }
    },
    [mutate]
  );

  const columns = React.useMemo(
    () => teamColumns({ viewerUuid, canManage, onAction }),
    [viewerUuid, canManage, onAction]
  );
  const dialog = confirming ? CONFIRM[confirming.action](confirming.member) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description={
          canManage
            ? "People who can sign in to the admin console, and what they can do."
            : "People who can sign in to the admin console. Only the owner can invite or change them."
        }
        actions={
          canManage ? (
            <Button size="lg" onClick={() => setInviting(true)}>
              <UserPlus />
              Invite admin
            </Button>
          ) : null
        }
      />
      <div className="min-w-0">
        {team.isPending ? (
          <DataTableSkeleton rows={4} />
        ) : team.isError ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6">
            <p className="text-sm text-destructive">{getApiError(team.error).message}</p>
            <Button variant="outline" size="sm" onClick={() => void team.refetch()}>
              <RotateCw />
              Try again
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={team.data} disablePagination hidePagination />
        )}
      </div>
      {canManage ? (
        <>
          <InviteAdminSheet open={inviting} onOpenChange={setInviting} />
          <ConfirmActionDialog
            open={confirmOpen}
            title={dialog?.title ?? ""}
            description={dialog?.description ?? ""}
            confirmLabel={dialog?.confirmLabel ?? ""}
            destructive={dialog?.destructive}
            pending={act.isPending}
            onConfirm={() => confirming && mutate(confirming)}
            onOpenChange={(open) => {
              if (!open && !act.isPending) setConfirmOpen(false);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
