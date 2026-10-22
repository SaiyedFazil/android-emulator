import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_equals,
  filterFn_inNumberRange,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type Column,
  type ColumnDef,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table";

/**
 * What the shared DataTable uses, declared once (TanStack Table v9 only loads the features a table
 * asks for). Column definitions, column headers, the pager and the mobile grid all take their types
 * from here.
 *
 * - `columnSizingFeature`: `column.getSize()` for header widths.
 * - `columnVisibilityFeature`: `row.getVisibleCells()` for rendering a row.
 * - The sort / filter function registries hold what the default `"auto"` choice can resolve to,
 *   which is why every one of them is listed even though no column names them explicitly.
 */
export const dataTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  // Per-column extras the DataTable reads (`meta` on a column definition).
  columnMeta: {} as {
    /** Field label used by the mobile card grid; falls back to the header title or column id. */
    label?: string;
    headerClassName?: string;
    cellClassName?: string;
    minWidth?: string | number;
  },

  filterFns: {
    arrIncludes: filterFn_arrIncludes,
    equals: filterFn_equals,
    includesString: filterFn_includesString,
    inNumberRange: filterFn_inNumberRange,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export type DataTableFeatures = typeof dataTableFeatures;

/** A column definition for the shared DataTable. */
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

/** A column of the shared DataTable, as a header renderer receives it. */
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  DataTableFeatures,
  TData,
  TValue
>;

/** The table instance the DataTable, its pager and its mobile grid pass around. */
export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;
