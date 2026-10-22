"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Eye, Layers } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import type { DataTableColumnDef } from "@/components/custom/data-table";
import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { PlanBadge } from "@/components/custom/PlanBadge";
import { RowActions } from "@/components/custom/RowActions";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { UsageMeter } from "@/components/custom/UsageMeter";
import { ORG_STATUS } from "@/components/pages/admin/constants/status.constants";
import type { OrgRow } from "@/components/pages/admin/organizations/utils/organization.utils";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS_ORDER = { active: 0, trialing: 1, past_due: 2, suspended: 3 };

// TODO(api): plan changes and suspensions call the admin API; for now they confirm.
function OrganizationRowActions({ row }: { row: OrgRow }) {
  const router = useRouter();
  const { org } = row;
  return (
    <RowActions
      label={org.name}
      actions={[
        {
          label: "View",
          icon: <Eye />,
          onSelect: () => router.push(`/admin/organizations/${org.id}`),
        },
        {
          label: "Change plan",
          icon: <Layers />,
          onSelect: () => toast("Change plan", { description: org.name }),
        },
        {
          label: row.status === "suspended" ? "Reactivate" : "Suspend",
          icon: <Ban />,
          destructive: row.status !== "suspended",
          separatorBefore: true,
          onSelect: () =>
            toast(row.status === "suspended" ? "Reactivation requested" : "Suspension requested", {
              description: org.name,
            }),
        },
      ]}
    />
  );
}

export const ORGANIZATION_COLUMNS: DataTableColumnDef<OrgRow>[] = [
  {
    id: "organization",
    accessorFn: (row) => row.org.name,
    header: ({ column }) => <ColumnHeader column={column} title="Organization" />,
    cell: ({ row }) => (
      <Link
        href={`/admin/organizations/${row.original.org.id}`}
        className="group flex max-w-[280px] min-w-0 items-center gap-3 outline-none"
      >
        <EntityAvatar name={row.original.org.name} kind="org" size="sm" />
        <span className="flex min-w-0 flex-col">
          <span
            className="truncate font-medium group-hover:underline group-focus-visible:underline"
            title={row.original.org.name}
          >
            {row.original.org.name}
          </span>
          <span className="truncate font-mono text-[11px] text-muted-foreground [[data-card-header]_&]:text-current [[data-card-header]_&]:opacity-75">
            {row.original.org.id}
          </span>
        </span>
      </Link>
    ),
    meta: { label: "Organization", minWidth: 240 },
  },
  {
    id: "plan",
    accessorFn: (row) => row.plan.concurrentEmulators,
    header: ({ column }) => <ColumnHeader column={column} title="Plan" />,
    cell: ({ row }) => <PlanBadge plan={row.original.plan} />,
    meta: { label: "Plan" },
  },
  {
    accessorKey: "members",
    header: ({ column }) => <ColumnHeader column={column} title="Members" />,
    cell: ({ row }) => <span className="font-mono tabular">{row.original.members}</span>,
    meta: { label: "Members" },
  },
  {
    id: "usage",
    accessorFn: (row) => row.usage.inUse / Math.max(1, row.usage.limit),
    header: ({ column }) => <ColumnHeader column={column} title="Emulators in use" />,
    cell: ({ row }) => (
      <UsageMeter
        used={row.original.usage.inUse}
        limit={row.original.usage.limit}
        size="sm"
        className="w-36"
      />
    ),
    meta: { label: "Emulators in use", minWidth: 170 },
  },
  {
    accessorKey: "mrr",
    header: ({ column }) => <ColumnHeader column={column} title="MRR" />,
    cell: ({ row }) => (
      <span className="font-mono whitespace-nowrap tabular">
        {formatCurrency(row.original.mrr)}
      </span>
    ),
    meta: { label: "MRR" },
  },
  {
    accessorKey: "status",
    sortFn: (a, b) => STATUS_ORDER[a.original.status] - STATUS_ORDER[b.original.status],
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = ORG_STATUS[row.original.status];
      return <ToneBadge tone={status.tone} label={status.label} />;
    },
    meta: { label: "Status" },
  },
  {
    id: "created",
    accessorFn: (row) => row.org.createdAt,
    header: ({ column }) => <ColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <time
        dateTime={row.original.org.createdAt}
        className="whitespace-nowrap text-muted-foreground"
      >
        {formatDate(row.original.org.createdAt)}
      </time>
    ),
    meta: { label: "Created" },
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <OrganizationRowActions row={row.original} />,
    meta: {
      headerClassName: "sticky right-0 z-10 w-12",
      cellClassName: "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
    },
  },
];
