"use client";

import * as React from "react";
import {
  flexRender,
  useTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowData,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { dataTableFeatures, type DataTableColumnDef } from "./data-table.features";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableMobileGrid } from "./DataTableMobileGrid";
import { cn } from "@/lib/utils";

/* Header styling for the desktop table.
 *
 * The colours come from the --table-header / --table-header-foreground tokens
 * (globals.css) rather than --primary, so the header stays the graphite of the
 * sidebar in both light and dark mode.
 *
 * The checkbox rules matter for the dark header. The shared Checkbox draws its
 * unchecked border from --input and its checked fill from --primary, both of
 * which are tuned for light surfaces and disappear against a charcoal header.
 * These re-point the select-all control at the header's own foreground colour,
 * so it stays visible whatever the header is set to. The attribute selectors
 * are deliberate — they out-specify the per-column checkbox classes in the
 * column definitions, which would otherwise win. */
const TABLE_HEADER_CLASS = [
  "bg-table-header! text-table-header-foreground!",
  "h-11 px-4 text-[13px]! font-medium! normal-case",
  "[&_[data-slot=checkbox]]:border-table-header-foreground",
  "[&_[data-slot=checkbox][data-state=checked]]:border-table-header-foreground",
  "[&_[data-slot=checkbox][data-state=checked]]:bg-table-header-foreground",
  "[&_[data-slot=checkbox][data-state=checked]]:text-table-header",
  "[&_[data-slot=checkbox][data-state=indeterminate]]:border-table-header-foreground",
  "[&_[data-slot=checkbox][data-state=indeterminate]]:bg-table-header-foreground",
  "[&_[data-slot=checkbox][data-state=indeterminate]]:text-table-header",
].join(" ");

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  pageCount?: number;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  meta?: Record<string, unknown>; // For custom metadata if needed
  searchKey?: string;
  /** Alignment of cell content. 'left' for left-aligned, 'center' for centered (default) */
  align?: "left" | "center";
  /** Optional callback to refresh the table data */
  onRefresh?: () => void;
  /** Whether the table is currently loading/refreshing */
  isLoading?: boolean;
  /** Optional custom content to render on the left side of the toolbar (e.g. custom search) */
  customLeftToolbar?: React.ReactNode;
  /** Optional loading overlay content to render over the table body only (e.g. search loading) */
  searchLoadingContent?: React.ReactNode;
  /** Optional custom empty state content to render inside the table body when no rows exist */
  emptyStateContent?: React.ReactNode;
  /** Total number of rows across all pages (for server-side pagination) */
  totalRows?: number;
  /** Hide the bottom pagination component completely */
  hidePagination?: boolean;
  /** Disable client-side pagination and show all rows without dividing them into pages */
  disablePagination?: boolean;
  /** Hide the built-in refresh button on mobile screens */
  hideRefreshOnMobile?: boolean;
  /** Extra classes for the built-in refresh button. Merged last, so an app can
   *  restyle it (the platform app renders it as a primary action) without
   *  changing the shared default every other table relies on. */
  refreshButtonClassName?: string;
  /** Disable the row hover highlight effect */
  disableRowHover?: boolean;
  /** Custom page size options for the pagination dropdown. Defaults to [25, 50, 75, 100] */
  pageSizeOptions?: number[];
  /** Optional function to determine custom row class names based on row data */
  getRowClassName?: (data: TData) => string;
  /** Optional callback when a row is clicked */
  onRowClick?: (data: TData) => void;
  /** Full-width content rendered directly beneath a row — a detail panel the
   *  row expands into. Return `null` for rows that have nothing to expand;
   *  omit the prop entirely and the table renders exactly as it always has.
   *  The caller owns the open/closed state, so it also decides when the panel
   *  appears and disappears. */
  renderExpandedRow?: (data: TData) => React.ReactNode;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageCount = -1,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  pagination: controlledPagination,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  searchKey,
  align = "left",
  onRefresh,
  isLoading = false,
  customLeftToolbar,
  searchLoadingContent,
  emptyStateContent,
  totalRows,
  hidePagination = false,
  disablePagination = false,
  hideRefreshOnMobile = false,
  refreshButtonClassName,
  disableRowHover = false,
  pageSizeOptions,
  meta,
  getRowClassName,
  onRowClick,
  renderExpandedRow,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const pagination = controlledPagination ?? internalPagination;

  // Update internal states when props change for manual control or sync
  const handlePaginationChange = (updaterOrValue: Updater<PaginationState>) => {
    const newPagination =
      typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;

    if (onPaginationChange) {
      onPaginationChange(newPagination);
    }
    setInternalPagination(newPagination);
  };

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const newSorting =
      typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    if (onSortingChange) {
      onSortingChange(newSorting);
    }
  };

  const handleColumnFiltersChange = (updaterOrValue: Updater<ColumnFiltersState>) => {
    const newFilters =
      typeof updaterOrValue === "function" ? updaterOrValue(columnFilters) : updaterOrValue;
    setColumnFilters(newFilters);
    if (onColumnFiltersChange) {
      onColumnFiltersChange(newFilters);
    }
  };

  // Auto-return to previous valid page if current page becomes empty (e.g., due to deletions).
  // This effect exists to push a corrected page index into state, so the compiler lint rule against
  // setting state in an effect does not apply to it.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (isLoading || disablePagination) return;

    if (manualPagination) {
      // For manual pagination, use pageCount if available
      if (pageCount > 0 && pagination.pageIndex >= pageCount) {
        handlePaginationChange({
          pageIndex: pageCount - 1,
          pageSize: pagination.pageSize,
        });
      } else if (pageCount === 0 && pagination.pageIndex > 0) {
        handlePaginationChange({
          pageIndex: 0,
          pageSize: pagination.pageSize,
        });
      } else if (pageCount === -1 && data.length === 0 && pagination.pageIndex > 0) {
        // Fallback if pageCount is not provided but we have no data
        handlePaginationChange({
          pageIndex: Math.max(0, pagination.pageIndex - 1),
          pageSize: pagination.pageSize,
        });
      }
    } else {
      // For client-side pagination, use table.getPageCount()
      // We can't safely call table.getPageCount() here before it's initialized,
      // but this effect runs after render, so it should be fine.
      // However, client-side pagination auto-handles bounds internally in react-table if configured,
      // but we will enforce it just in case.
      const currentCount = Math.ceil(data.length / pagination.pageSize);
      if (currentCount > 0 && pagination.pageIndex >= currentCount) {
        handlePaginationChange({
          pageIndex: currentCount - 1,
          pageSize: pagination.pageSize,
        });
      } else if (currentCount === 0 && pagination.pageIndex > 0) {
        handlePaginationChange({
          pageIndex: 0,
          pageSize: pagination.pageSize,
        });
      }
    }
    // We intentionally exclude handlePaginationChange to avoid infinite loops,
    // relying instead on the pagination state and data/loading changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    pageCount,
    pagination.pageIndex,
    pagination.pageSize,
    manualPagination,
    disablePagination,
    data.length,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      pagination,
    },
    meta,
    enableRowSelection: true,
    pageCount: manualPagination && !disablePagination ? pageCount : undefined,
    manualPagination: manualPagination || disablePagination,
    manualSorting: manualSorting,
    manualFiltering: manualFiltering,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onPaginationChange: handlePaginationChange,
  });
  const hasToolbarContent = customLeftToolbar || searchKey || onRefresh;

  return (
    <div className="space-y-4">
      {hasToolbarContent && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* Custom left toolbar content */}
            {customLeftToolbar}
            {/* Search Input Place Holder - if searchKey is provided */}
            {searchKey && (
              <Input
                placeholder="Filter..."
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="h-9 max-w-sm bg-card shadow-xs"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className={cn(
                  "h-9 cursor-pointer gap-2 px-3 shadow-xs transition-all hover:bg-muted/10! hover:text-foreground!",
                  hideRefreshOnMobile ? "hidden sm:flex" : "flex",
                  refreshButtonClassName
                )}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table View - visible on lg screens and above */}
      <div className="relative hidden overflow-x-auto rounded-xl border border-border bg-card shadow-xs lg:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} data-bone="true" className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        TABLE_HEADER_CLASS,
                        header.column.columnDef.meta?.headerClassName
                      )}
                      style={{
                        width:
                          header.column.getSize() !== 150 ? header.column.getSize() : undefined,
                        minWidth: header.column.columnDef.meta?.minWidth,
                      }}
                    >
                      <div data-bone-ignore="true" className="contents">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            {/* Search loading overlay - only covers table body */}
            {searchLoadingContent && (
              <TableRow className="bg-card hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="flex items-center justify-center py-16">
                    {searchLoadingContent}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!searchLoadingContent && (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const expandedContent = renderExpandedRow?.(row.original);

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          data-bone="true"
                          data-state={row.getIsSelected() && "selected"}
                          onClick={() => onRowClick?.(row.original)}
                          className={cn(
                            "border-b transition-colors duration-200",
                            onRowClick && "cursor-pointer",
                            disableRowHover ? "" : "hover:bg-row-hover!",
                            getRowClassName ? getRowClassName(row.original) : "bg-card"
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn("px-4 py-3", cell.column.columnDef.meta?.cellClassName)}
                            >
                              <div
                                data-bone-ignore="true"
                                className={`flex ${align === "left" ? "justify-start" : "justify-center"}`}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>

                        {expandedContent ? (
                          <TableRow
                            data-bone-ignore="true"
                            className="border-b bg-transparent hover:bg-transparent"
                          >
                            <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                              {expandedContent}
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow className="bg-card hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="p-0">
                      {emptyStateContent ? (
                        <div className="flex items-center justify-center py-12">
                          {emptyStateContent}
                        </div>
                      ) : (
                        <div className="flex h-24 items-center justify-center text-center">
                          No results.
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Grid View - visible on screens below lg */}
      <div className="relative lg:hidden">
        {searchLoadingContent && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card">
            {searchLoadingContent}
          </div>
        )}
        {table.getRowModel().rows?.length ? (
          <DataTableMobileGrid table={table} renderExpandedRow={renderExpandedRow} />
        ) : !searchLoadingContent && emptyStateContent ? (
          <div className="flex items-center justify-center py-12">{emptyStateContent}</div>
        ) : (
          <DataTableMobileGrid table={table} renderExpandedRow={renderExpandedRow} />
        )}
      </div>

      {!hidePagination && !disablePagination && (
        <DataTablePagination
          table={table}
          totalRows={totalRows}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
