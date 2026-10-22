"use client";

import * as React from "react";
import Link from "next/link";
import { Ban, Download, Eye, Receipt, RefreshCw, SearchX, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import { DataTable, type DataTableColumnDef } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/EmptyState";
import { FilterChips } from "@/components/custom/FilterChips";
import { RowActions } from "@/components/custom/RowActions";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { INVOICE_STATUS } from "@/components/pages/admin/constants/status.constants";
import { getOrganization } from "@/components/pages/admin/utils/admin.selectors";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice, InvoiceStatus } from "@/types/admin.types";

type StatusFilter = "all" | InvoiceStatus;
const STATUS_FILTERS: StatusFilter[] = ["all", "paid", "open", "failed", "refunded", "void"];
const DOT_CLASS: Record<InvoiceStatus, string> = {
  paid: "bg-status-running",
  open: "bg-primary",
  failed: "bg-status-offline",
  refunded: "bg-status-stopped",
  void: "bg-status-stopped",
};

// TODO(api): invoice actions call the billing provider; for now they confirm.
function InvoiceRowActions({ invoice }: { invoice: Invoice }) {
  const confirm = (message: string) => () => toast(message, { description: invoice.number });
  return (
    <RowActions
      label={invoice.number}
      actions={[
        { label: "View invoice", icon: <Eye />, onSelect: confirm("Opening invoice") },
        { label: "Download PDF", icon: <Download />, onSelect: confirm("Download started") },
        ...(invoice.status === "failed"
          ? [{ label: "Retry charge", icon: <RefreshCw />, onSelect: confirm("Charge retried") }]
          : []),
        ...(invoice.status === "paid"
          ? [
              {
                label: "Refund",
                icon: <Undo2 />,
                destructive: true,
                separatorBefore: true,
                onSelect: confirm("Refund requested"),
              },
            ]
          : []),
        ...(invoice.status === "open"
          ? [
              {
                label: "Void",
                icon: <Ban />,
                destructive: true,
                separatorBefore: true,
                onSelect: confirm("Invoice voided"),
              },
            ]
          : []),
      ]}
    />
  );
}

function DateCell({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-muted-foreground">—</span>;
  return (
    <time dateTime={iso} className="whitespace-nowrap text-muted-foreground">
      {formatDate(iso)}
    </time>
  );
}

function columnsFor(showOrganization: boolean): DataTableColumnDef<Invoice>[] {
  return [
    {
      accessorKey: "number",
      header: ({ column }) => <ColumnHeader column={column} title="Invoice" />,
      cell: ({ row }) => (
        <span className="font-mono text-[13px] whitespace-nowrap">{row.original.number}</span>
      ),
      meta: { label: "Invoice" },
    },
    ...(showOrganization
      ? [
          {
            id: "organization",
            accessorFn: (invoice: Invoice) => getOrganization(invoice.orgId)?.name ?? "",
            header: ({ column }) => <ColumnHeader column={column} title="Organization" />,
            cell: ({ row }) => {
              const name = getOrganization(row.original.orgId)?.name ?? row.original.orgId;
              return (
                <Link
                  href={`/admin/organizations/${row.original.orgId}/billing`}
                  className="block max-w-[220px] truncate hover:underline"
                  title={name}
                >
                  {name}
                </Link>
              );
            },
            meta: { label: "Organization" },
          } satisfies DataTableColumnDef<Invoice>,
        ]
      : []),
    {
      accessorKey: "amount",
      header: ({ column }) => <ColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="font-mono whitespace-nowrap tabular">
          {formatCurrency(row.original.amount)}
        </span>
      ),
      meta: { label: "Amount" },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = INVOICE_STATUS[row.original.status];
        return <ToneBadge tone={status.tone} label={status.label} />;
      },
      meta: { label: "Status" },
    },
    {
      accessorKey: "issuedAt",
      header: ({ column }) => <ColumnHeader column={column} title="Issued" />,
      cell: ({ row }) => <DateCell iso={row.original.issuedAt} />,
      meta: { label: "Issued" },
    },
    {
      accessorKey: "dueAt",
      header: ({ column }) => <ColumnHeader column={column} title="Due" />,
      cell: ({ row }) => <DateCell iso={row.original.dueAt} />,
      meta: { label: "Due" },
    },
    {
      id: "paidAt",
      accessorFn: (invoice) => invoice.paidAt ?? "",
      header: ({ column }) => <ColumnHeader column={column} title="Paid" />,
      cell: ({ row }) => <DateCell iso={row.original.paidAt} />,
      meta: { label: "Paid" },
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
      meta: {
        headerClassName: "sticky right-0 z-10 w-12",
        cellClassName:
          "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
      },
    },
  ];
}

interface InvoicesTableProps {
  invoices: Invoice[];
  /** Adds the Organization column (the billing page; not inside one organization). */
  showOrganization?: boolean;
  /** Status chips above the table. */
  filters?: boolean;
}

export function InvoicesTable({
  invoices,
  showOrganization = false,
  filters = false,
}: InvoicesTableProps) {
  const sorted = React.useMemo(
    () => [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [invoices]
  );
  const columns = React.useMemo(() => columnsFor(showOrganization), [showOrganization]);
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const counts = React.useMemo(() => {
    const result = { all: sorted.length, paid: 0, open: 0, failed: 0, refunded: 0, void: 0 };
    for (const invoice of sorted) result[invoice.status] += 1;
    return result;
  }, [sorted]);
  const filtered = status === "all" ? sorted : sorted.filter((i) => i.status === status);

  if (sorted.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Receipt />}
          title="No invoices yet"
          description="Invoices appear after the first paid billing cycle."
        />
      </Card>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={filtered}
      pagination={pagination}
      onPaginationChange={setPagination}
      pageSizeOptions={[10, 25, 50]}
      hidePagination={sorted.length <= 10}
      customLeftToolbar={
        filters ? (
          <FilterChips
            value={status}
            onChange={(next) => {
              setStatus(next);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            label="Filter by status"
            options={STATUS_FILTERS.map((filter) => ({
              value: filter,
              label: filter === "all" ? "All" : INVOICE_STATUS[filter].label,
              count: counts[filter],
              dotClassName: filter === "all" ? undefined : DOT_CLASS[filter],
            }))}
          />
        ) : undefined
      }
      emptyStateContent={
        <EmptyState icon={<SearchX />} title="No invoices with this status" className="py-6" />
      }
    />
  );
}
