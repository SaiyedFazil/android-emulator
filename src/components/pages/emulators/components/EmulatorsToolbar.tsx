"use client";

import { Search, X } from "lucide-react";

import { EMULATOR_STATUS, STATUS_DOT_CLASS } from "@/components/custom/StatusBadge";
import {
  STATUS_FILTERS,
  type StatusFilter,
} from "@/components/pages/emulators/constants/emulator.constants";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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
      <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-muted-foreground shadow-xs transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 xl:max-w-sm">
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search emulators"
          placeholder="Search by name, serial, model or IP…"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => onQueryChange("")}
          >
            <X />
          </Button>
        ) : null}
      </label>

      <div className="-mx-1 overflow-x-auto px-1 pb-1 xl:pb-0">
        <ToggleGroup
          type="single"
          value={status}
          onValueChange={(value) => value && onStatusChange(value as StatusFilter)}
          aria-label="Filter by status"
          spacing={1}
          className="rounded-lg bg-muted p-1"
        >
          {STATUS_FILTERS.map((filter) => (
            <ToggleGroupItem
              key={filter}
              value={filter}
              size="sm"
              className="gap-1.5 px-2.5 text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              {filter !== "all" ? (
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", STATUS_DOT_CLASS[filter])}
                />
              ) : null}
              {filter === "all" ? "All" : EMULATOR_STATUS[filter].label}
              <span className="font-mono text-[11px] text-muted-foreground">{counts[filter]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
