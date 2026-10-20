"use client";

import * as React from "react";
import { Table, flexRender } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableMobileGridProps<TData> {
  table: Table<TData>;
  /** Detail panel rendered at the foot of a card, mirroring the desktop
   *  table's expanded row. `null` for rows with nothing to expand. */
  renderExpandedRow?: (data: TData) => React.ReactNode;
}

export function DataTableMobileGrid<TData>({
  table,
  renderExpandedRow,
}: DataTableMobileGridProps<TData>) {
  const rows = table.getRowModel().rows;
  const headers = table.getFlatHeaders();

  // Get the primary column (first non-actions column) for the card header
  const getPrimaryHeader = () => {
    return headers.find((h) => h.id !== "actions" && h.id !== "select");
  };

  // Get action column if exists
  const getActionHeader = () => {
    return headers.find((h) => h.id === "actions");
  };

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card p-12">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MoreVertical className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => {
        const primaryHeader = getPrimaryHeader();
        const actionHeader = getActionHeader();
        const expandedContent = renderExpandedRow?.(row.original);

        // Get visible cells
        const visibleCells = row.getVisibleCells();
        const primaryCell = primaryHeader
          ? visibleCells.find((c) => c.column.id === primaryHeader.id)
          : null;
        const actionCell = actionHeader
          ? visibleCells.find((c) => c.column.id === actionHeader.id)
          : null;
        const remainingCells = visibleCells.filter(
          (c) =>
            c.column.id !== primaryHeader?.id &&
            c.column.id !== "actions" &&
            c.column.id !== "select"
        );

        return (
          <div
            key={row.id}
            className={cn(
              "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200",
              "border-border hover:border-primary/50",
              "shadow-xs hover:shadow-md",
              // An open detail panel needs the full width of the grid.
              expandedContent && "sm:col-span-2"
            )}
          >
            {/* Card Header - Primary Column.
             *
             * Mirrors the desktop table header, reading the same
             * --table-header pair so the two never drift apart. Opaque rather
             * than an alpha of --primary, which would composite over the card.
             *
             * data-card-header is the hook column definitions use to restyle
             * their cell for this dark band: cells are authored against a light
             * row, so a column whose cell hardcodes a dark colour targets
             * [[data-card-header]_&] to flip it here. */}
            <div
              data-card-header
              className="flex min-h-18 items-start justify-between gap-3 border-b border-border bg-table-header p-3.5 text-table-header-foreground"
            >
              <div className="min-w-0 flex-1">
                {/* Primary Column Label */}
                {primaryHeader && (
                  <p className="mb-1 text-[10px] font-bold tracking-wider uppercase">
                    {primaryHeader.column.columnDef.meta?.label ??
                      (typeof primaryHeader.column.columnDef.header === "function"
                        ? (() => {
                            // Extract title from the header component if possible
                            const headerContext = primaryHeader.getContext();
                            const headerElement = flexRender(
                              primaryHeader.column.columnDef.header,
                              headerContext
                            );
                            // Try to get the title prop from a custom header element
                            if (React.isValidElement(headerElement)) {
                              const props = headerElement.props as Record<string, unknown>;
                              if (props?.title && typeof props.title === "string") {
                                return props.title;
                              }
                            }
                            return primaryHeader.id
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase());
                          })()
                        : primaryHeader.column.columnDef.header || primaryHeader.id)}
                  </p>
                )}
                {/* Primary Column Value */}
                {primaryCell && (
                  <div className="text-sm font-semibold">
                    {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
                  </div>
                )}
              </div>
            </div>

            {/* Card Body - Other Columns */}
            <div className="flex-1 space-y-2.5 p-3.5">
              {remainingCells.map((cell) => {
                const header = headers.find((h) => h.id === cell.column.id);
                const headerLabel = (() => {
                  if (cell.column.columnDef.meta?.label) return cell.column.columnDef.meta.label;
                  if (!header) return cell.column.id;
                  if (typeof header.column.columnDef.header === "function") {
                    const headerContext = header.getContext();
                    const headerElement = flexRender(header.column.columnDef.header, headerContext);
                    if (React.isValidElement(headerElement)) {
                      const props = headerElement.props as Record<string, unknown>;
                      if (props?.title && typeof props.title === "string") {
                        return props.title;
                      }
                    }
                    return cell.column.id
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                  }
                  return header.column.columnDef.header || cell.column.id;
                })();

                return (
                  <div
                    key={cell.id}
                    className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1 py-1"
                  >
                    <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                      {headerLabel}
                    </span>
                    <div className="flex max-w-full items-center justify-start text-sm wrap-break-word text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Footer */}
            {actionCell && (
              <div className="flex items-center justify-center border-t border-border bg-muted/20 p-3">
                <div className="contents">
                  {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                </div>
              </div>
            )}

            {/* Expanded detail panel */}
            {expandedContent ? (
              <div className="border-t border-border">{expandedContent}</div>
            ) : null}

            {/* Selection indicator glow effect */}
            {row.getIsSelected() && (
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary" />
            )}
          </div>
        );
      })}
    </div>
  );
}
