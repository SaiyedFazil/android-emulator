"use client";

import { Fragment } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  /** Draw a divider above this item. */
  separatorBefore?: boolean;
  disabled?: boolean;
}

/** The "…" menu at the end of a table row. `label` names the row, e.g. the emulator's name. */
export function RowActions({ label, actions }: { label: string; actions: RowAction[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${label}`}
          // Rows can be clickable; opening the menu shouldn't also trigger the row.
          onClick={(event) => event.stopPropagation()}
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        {actions.map((action) => (
          <Fragment key={action.label}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant={action.destructive ? "destructive" : "default"}
              disabled={action.disabled}
              onSelect={action.onSelect}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
