"use client";

import * as React from "react";
import { MailPlus, SearchX } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/EmptyState";
import { FilterChips } from "@/components/custom/FilterChips";
import { PageHeader } from "@/components/custom/PageHeader";
import { SearchField } from "@/components/custom/SearchField";
import { MEMBER_STATUS } from "@/components/pages/admin/constants/status.constants";
import { MEMBERS } from "@/components/pages/admin/users/constants/member.constants";
import { USER_COLUMNS, type UserRow } from "@/components/pages/admin/users/UsersColumns";
import {
  getOrganization,
  memberEmulatorsRunning,
} from "@/components/pages/admin/utils/admin.selectors";
import { Button } from "@/components/ui/button";
import type { MemberStatus } from "@/types/admin.types";

type StatusFilter = "all" | MemberStatus;
const STATUS_FILTERS: StatusFilter[] = ["all", "active", "invited", "suspended"];
const DOT_CLASS: Record<MemberStatus, string> = {
  active: "bg-status-running",
  invited: "bg-primary",
  suspended: "bg-status-offline",
};

export function Users() {
  const rows = React.useMemo<UserRow[]>(
    () =>
      MEMBERS.map((member) => ({
        member,
        orgName: getOrganization(member.orgId)?.name ?? member.orgId,
        running: memberEmulatorsRunning(member.id),
      })),
    []
  );
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const counts = React.useMemo(() => {
    const result = { all: rows.length, active: 0, invited: 0, suspended: 0 };
    for (const row of rows) result[row.member.status] += 1;
    return result;
  }, [rows]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (status === "all" || row.member.status === status) &&
        (!q ||
          [row.member.name, row.member.email, row.orgName].some((value) =>
            value.toLowerCase().includes(q)
          ))
    );
  }, [rows, query, status]);
  const firstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Everyone with an account, across every organization."
        actions={
          <Button size="lg" onClick={() => toast("Invite user", { description: "Coming soon" })}>
            <MailPlus />
            Invite user
          </Button>
        }
      />
      <DataTable
        columns={USER_COLUMNS}
        data={filtered}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageSizeOptions={[10, 25, 50]}
        customLeftToolbar={
          <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <SearchField
              value={query}
              onChange={(next) => {
                setQuery(next);
                firstPage();
              }}
              label="Search users"
              placeholder="Search by name, email or organization…"
            />
            <FilterChips
              value={status}
              onChange={(next) => {
                setStatus(next);
                firstPage();
              }}
              label="Filter by status"
              options={STATUS_FILTERS.map((filter) => ({
                value: filter,
                label: filter === "all" ? "All" : MEMBER_STATUS[filter].label,
                count: counts[filter],
                dotClassName: filter === "all" ? undefined : DOT_CLASS[filter],
              }))}
            />
          </div>
        }
        emptyStateContent={
          <EmptyState
            icon={<SearchX />}
            title="No users match"
            description="Try a different search or status."
            className="py-6"
          />
        }
      />
    </div>
  );
}
