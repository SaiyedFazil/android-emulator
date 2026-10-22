"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";

import { DataTable } from "@/components/custom/data-table";
import { PageHeader } from "@/components/custom/PageHeader";
import { AccessLevels } from "@/components/pages/admin/team/components/AccessLevels";
import { InviteAdminSheet } from "@/components/pages/admin/team/components/InviteAdminSheet";
import { ADMIN_TEAM } from "@/components/pages/admin/team/constants/team.constants";
import { TEAM_COLUMNS } from "@/components/pages/admin/team/TeamColumns";
import { Button } from "@/components/ui/button";

export function Team() {
  const [inviting, setInviting] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="People who can sign in to the admin console, and what they can do."
        actions={
          <Button size="lg" onClick={() => setInviting(true)}>
            <UserPlus />
            Invite admin
          </Button>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <DataTable columns={TEAM_COLUMNS} data={ADMIN_TEAM} disablePagination hidePagination />
        </div>
        <AccessLevels />
      </div>
      <InviteAdminSheet open={inviting} onOpenChange={setInviting} />
    </div>
  );
}
