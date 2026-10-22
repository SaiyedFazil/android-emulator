"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  /** Status dot colour class, e.g. `bg-status-running`. */
  dotClassName?: string;
}

interface FilterChipsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: FilterChipOption<T>[];
  /** Accessible name, e.g. "Filter by status". */
  label: string;
}

/** A single-choice segmented filter with counts; scrolls sideways when it doesn't fit. */
export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  label,
}: FilterChipsProps<T>) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 xl:pb-0">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && onChange(next as T)}
        aria-label={label}
        spacing={1}
        className="rounded-lg bg-muted p-1"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            size="sm"
            className="gap-1.5 px-2.5 text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
          >
            {option.dotClassName ? (
              <span
                aria-hidden="true"
                className={cn("size-1.5 rounded-full", option.dotClassName)}
              />
            ) : null}
            {option.label}
            {option.count !== undefined ? (
              <span className="font-mono text-[11px] text-muted-foreground">{option.count}</span>
            ) : null}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
