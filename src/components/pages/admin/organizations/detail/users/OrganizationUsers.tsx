"use client";

import * as React from "react";
import { Activity, MailPlus, SearchX, UserX, Users } from "lucide-react";

import { DataTable } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/EmptyState";
import { SearchField } from "@/components/custom/SearchField";
import { StatCard } from "@/components/custom/StatCard";
import {
  ORGANIZATION_USER_COLUMNS,
  type MemberRow,
} from "@/components/pages/admin/organizations/detail/users/OrganizationUsersColumns";
import { memberEmulatorsRunning, membersOf } from "@/components/pages/admin/utils/admin.selectors";

export function OrganizationUsers({ orgId }: { orgId: string }) {
  const rows = React.useMemo<MemberRow[]>(
    () =>
      membersOf(orgId).map((member) => ({ member, running: memberEmulatorsRunning(member.id) })),
    [orgId]
  );
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? rows.filter(({ member }) =>
          [member.name, member.email].some((value) => value.toLowerCase().includes(q))
        )
      : rows;
  }, [rows, query]);
  const count = (status: string) => rows.filter((r) => r.member.status === status).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Members"
          value={rows.length}
          icon={<Users />}
          hint="Everyone in this organization"
        />
        <StatCard
          label="Active now"
          value={rows.filter((r) => r.running > 0).length}
          icon={<Activity />}
          hint="Running at least one emulator"
        />
        <StatCard
          label="Invited"
          value={count("invited")}
          icon={<MailPlus />}
          hint="Haven't joined yet"
        />
        <StatCard
          label="Suspended"
          value={count("suspended")}
          icon={<UserX />}
          hint="Can't sign in"
        />
      </div>

      <DataTable
        columns={ORGANIZATION_USER_COLUMNS}
        data={filtered}
        disablePagination
        hidePagination
        customLeftToolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            label="Search members"
            placeholder="Search by name or email…"
          />
        }
        emptyStateContent={
          <EmptyState
            icon={<SearchX />}
            title="No members match"
            description="Try a different name or email."
            className="py-6"
          />
        }
      />
    </div>
  );
}
