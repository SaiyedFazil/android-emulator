"use client";

import * as React from "react";
import { Plus, SearchX } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/EmptyState";
import { PageHeader } from "@/components/custom/PageHeader";
import { OrganizationsToolbar } from "@/components/pages/admin/organizations/components/OrganizationsToolbar";
import { ORGANIZATION_COLUMNS } from "@/components/pages/admin/organizations/OrganizationsColumns";
import {
  countOrgStatuses,
  filterOrganizations,
  toOrgRows,
  type OrgStatusFilter,
  type PlanFilter,
} from "@/components/pages/admin/organizations/utils/organization.utils";
import { Button } from "@/components/ui/button";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function Organizations() {
  const rows = React.useMemo(() => toOrgRows(), []);
  const counts = React.useMemo(() => countOrgStatuses(rows), [rows]);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<OrgStatusFilter>("all");
  const [plan, setPlan] = React.useState<PlanFilter>("all");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const filtered = React.useMemo(
    () => filterOrganizations(rows, query, status, plan),
    [rows, query, status, plan]
  );

  // Any filter change starts again from the first page.
  const firstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));
  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setPlan("all");
    firstPage();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organizations"
        description="Every customer, its plan and how much of it they use."
        actions={
          <Button
            size="lg"
            onClick={() => toast("New organization", { description: "Coming soon" })}
          >
            <Plus />
            New organization
          </Button>
        }
      />

      <DataTable
        columns={ORGANIZATION_COLUMNS}
        data={filtered}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        customLeftToolbar={
          <OrganizationsToolbar
            query={query}
            onQueryChange={(next) => {
              setQuery(next);
              firstPage();
            }}
            status={status}
            onStatusChange={(next) => {
              setStatus(next);
              firstPage();
            }}
            plan={plan}
            onPlanChange={(next) => {
              setPlan(next);
              firstPage();
            }}
            counts={counts}
          />
        }
        emptyStateContent={
          <EmptyState
            icon={<SearchX />}
            title="No organizations match"
            description="Try a different search, status or plan."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
            className="py-6"
          />
        }
      />
    </div>
  );
}
