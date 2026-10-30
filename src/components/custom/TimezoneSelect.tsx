"use client";

import * as React from "react";
import { Check, ChevronDown, LocateFixed, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMounted } from "@/hooks/use-mounted";
import { useTimeZone } from "@/hooks/use-time-zone";
import dayjs from "@/lib/dayjs";
import { timeZoneOption, timeZoneOptions } from "@/lib/timezones";
import { cn } from "@/lib/utils";

/**
 * Pick any IANA time zone in the world, searchable by city, region, zone name ("India Standard
 * Time") or offset ("+05:30"). Offsets are worked out when the list opens, so daylight saving time
 * is always current.
 */
export function TimezoneSelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  /** IANA name, e.g. "Asia/Kolkata". */
  value: string;
  onChange: (zone: string) => void;
  disabled?: boolean;
}) {
  const mounted = useMounted();
  const deviceZone = useTimeZone();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Built when the list opens: hundreds of zones, each with its offset for today.
  const options = React.useMemo(() => (open ? timeZoneOptions(dayjs(), value) : []), [open, value]);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = options.filter((option) => {
    const text = `${option.label} ${option.value} ${option.longName}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });

  const choose = (zone: string) => {
    onChange(zone);
    setOpen(false);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    setQuery("");
    setActive(0);
  };

  // Keep the highlighted option in view while moving with the arrow keys.
  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => Math.min(Math.max(index + step, 0), Math.max(matches.length - 1, 0)));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (matches[active]) choose(matches[active].value);
    }
  };

  // The label needs today's offset, which only the browser should work out.
  const selectedLabel = mounted ? timeZoneOption(value, dayjs()).label : value;
  const listId = `${id ?? "timezone"}-list`;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-72 p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search city, region or offset…"
            aria-label="Search time zones"
            aria-controls={listId}
            aria-activedescendant={matches[active] ? `${listId}-${active}` : undefined}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {deviceZone && deviceZone !== value && !query ? (
          <button
            type="button"
            onClick={() => choose(deviceZone)}
            className="flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm text-primary hover:bg-accent"
          >
            <LocateFixed className="size-4 shrink-0" />
            <span className="truncate">Use this device&apos;s time zone ({deviceZone})</span>
          </button>
        ) : null}
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Time zones"
          className="max-h-72 overflow-y-auto p-1"
        >
          {matches.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              No time zone matches “{query}”.
            </li>
          ) : (
            matches.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={option.value === value}
                onClick={() => choose(option.value)}
                onMouseMove={() => setActive(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                  index === active && "bg-accent text-accent-foreground"
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{option.label}</span>
                  <span className="truncate text-xs text-muted-foreground">{option.longName}</span>
                </span>
                {option.value === value ? <Check className="size-4 shrink-0" /> : null}
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
