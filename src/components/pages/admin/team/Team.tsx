"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCw, UserPlus } from "lucide-react";

import { DataTable } from "@/components/custom/data-table";
import { DataTableSkeleton } from "@/components/custom/data-table/DataTableSkeleton";
import { PageHeader } from "@/components/custom/PageHeader";
import { AccessLevels } from "@/components/pages/admin/team/components/AccessLevels";
import { InviteAdminSheet } from "@/components/pages/admin/team/components/InviteAdminSheet";
import { TEAM_QUERY_KEY } from "@/components/pages/admin/team/constants/team.constants";
import { teamColumns } from "@/components/pages/admin/team/TeamColumns";
import { Button } from "@/components/ui/button";
import { getApiError } from "@/lib/api/api-error";
import { adminTeamApi } from "@/lib/api/admin-team/admin-team-api";
import { useSession } from "@/lib/auth/session-client";

export function Team() {
  const [inviting, setInviting] = React.useState(false);
  const { data: session } = useSession();
  const viewerUuid = session?.user.uuid;
  // Only the owner changes the team; the API refuses everyone else anyway.
  const canManage = session?.user.role === "OWNER";

  const team = useQuery({
    queryKey: TEAM_QUERY_KEY,
    queryFn: async () => (await adminTeamApi.getTeam()).data,
  });

  const columns = React.useMemo(
    () => teamColumns({ viewerUuid, canManage, onAction: () => undefined }),
    [viewerUuid, canManage]
  );

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
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
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
        <AccessLevels />
      </div>
      {canManage ? <InviteAdminSheet open={inviting} onOpenChange={setInviting} /> : null}
    </div>
  );
}
