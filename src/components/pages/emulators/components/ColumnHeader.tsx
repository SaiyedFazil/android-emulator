import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

interface ColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  /** Also read by the data-table's mobile card grid as the field label. */
  title: string;
}

export function ColumnHeader<TData, TValue>({ column, title }: ColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span>{title}</span>;

  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      aria-label={`Sort by ${title}`}
      className="-mx-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-table-header-foreground/10 focus-visible:ring-2 focus-visible:ring-table-header-foreground/40 focus-visible:outline-none"
    >
      {title}
      <Icon className={sorted ? "size-3.5" : "size-3.5 opacity-50"} aria-hidden="true" />
    </button>
  );
}
