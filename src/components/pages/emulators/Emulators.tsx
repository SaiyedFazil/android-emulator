"use client";

import * as React from "react";
import { Plus, SearchX } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/custom/data-table";
import { PageHeader } from "@/components/custom/PageHeader";
import { EmulatorsToolbar } from "@/components/pages/emulators/components/EmulatorsToolbar";
import {
  EMULATORS,
  PAGE_SIZE_OPTIONS,
  type StatusFilter,
} from "@/components/pages/emulators/constants/emulator.constants";
import { EMULATOR_COLUMNS } from "@/components/pages/emulators/EmulatorsColumns";
import { countByStatus, filterEmulators } from "@/components/pages/emulators/utils/emulator.utils";
import { Button } from "@/components/ui/button";

export function Emulators() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const counts = React.useMemo(() => countByStatus(EMULATORS), []);
  const rows = React.useMemo(() => filterEmulators(EMULATORS, query, status), [query, status]);

  // A new filter always starts from the first page.
  const changeQuery = (next: string) => {
    setQuery(next);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };
  const changeStatus = (next: StatusFilter) => {
    setStatus(next);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };
  const clearFilters = () => {
    changeQuery("");
    changeStatus("all");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Emulators"
        description="Every emulator connected to your hosts."
        actions={
          <Button size="lg" onClick={() => toast("New emulator", { description: "Coming soon" })}>
            <Plus />
            New emulator
          </Button>
        }
      />

      <DataTable
        columns={EMULATOR_COLUMNS}
        data={rows}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        customLeftToolbar={
          <EmulatorsToolbar
            query={query}
            onQueryChange={changeQuery}
            status={status}
            onStatusChange={changeStatus}
            counts={counts}
          />
        }
        emptyStateContent={
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">No emulators match</p>
              <p className="text-xs text-muted-foreground">
                Try a different search or status filter.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        }
      />
    </div>
  );
}
