"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name, e.g. "Search organizations". */
  label: string;
  placeholder: string;
  className?: string;
}

export function SearchField({ value, onChange, label, placeholder, className }: SearchFieldProps) {
  return (
    <label
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-muted-foreground shadow-xs transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 xl:max-w-sm",
        className
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X />
        </Button>
      ) : null}
    </label>
  );
}
