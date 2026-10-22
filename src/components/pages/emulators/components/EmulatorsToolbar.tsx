"use client";

import { FilterChips } from "@/components/custom/FilterChips";
import { SearchField } from "@/components/custom/SearchField";
import { EMULATOR_STATUS, STATUS_DOT_CLASS } from "@/components/custom/StatusBadge";
import {
  STATUS_FILTERS,
  type StatusFilter,
} from "@/components/pages/emulators/constants/emulator.constants";

interface EmulatorsToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}

export function EmulatorsToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  counts,
}: EmulatorsToolbarProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <SearchField
        value={query}
        onChange={onQueryChange}
        label="Search emulators"
        placeholder="Search by name, serial, model or IP…"
      />
      <FilterChips
        value={status}
        onChange={onStatusChange}
        label="Filter by status"
        options={STATUS_FILTERS.map((filter) => ({
          value: filter,
          label: filter === "all" ? "All" : EMULATOR_STATUS[filter].label,
          count: counts[filter],
          dotClassName: filter === "all" ? undefined : STATUS_DOT_CLASS[filter],
        }))}
      />
    </div>
  );
}
