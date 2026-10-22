"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, RotateCw, SearchX, Smartphone, Square, UserRound } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import { DataTable, type DataTableColumnDef } from "@/components/custom/data-table";
import { EmptyState } from "@/components/custom/EmptyState";
import { FilterChips } from "@/components/custom/FilterChips";
import { RowActions } from "@/components/custom/RowActions";
import { SearchField } from "@/components/custom/SearchField";
import { EMULATOR_STATUS, STATUS_DOT_CLASS, StatusBadge } from "@/components/custom/StatusBadge";
import { HOSTS } from "@/components/pages/admin/hosts/constants/host.constants";
import { getMember, getOrganization } from "@/components/pages/admin/utils/admin.selectors";
import { CopyAddress } from "@/components/pages/emulators/components/CopyAddress";
import {
  PAGE_SIZE_OPTIONS,
  STATUS_FILTERS,
  type StatusFilter,
} from "@/components/pages/emulators/constants/emulator.constants";
import { formatAddress } from "@/components/pages/emulators/utils/emulator.utils";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { FleetEmulator } from "@/types/admin.types";

interface FleetRow {
  emulator: FleetEmulator;
  orgName: string;
  ownerName: string;
  hostName: string;
}

const HOST_NAME = Object.fromEntries(HOSTS.map((h) => [h.id, h.name]));
const STATUS_ORDER = { running: 0, booting: 1, stopped: 2, offline: 3 };

// TODO(api): force stop and restart call the fleet control API; for now they confirm.
function FleetRowActions({ row, showOrganization }: { row: FleetRow; showOrganization: boolean }) {
  const router = useRouter();
  const { emulator } = row;
  const up = emulator.status === "running" || emulator.status === "booting";
  const confirm = (action: string) => () =>
    toast(`${action} requested`, { description: `${emulator.name} · ${row.orgName}` });
  return (
    <RowActions
      label={emulator.name}
      actions={[
        { label: "Force stop", icon: <Square />, disabled: !up, onSelect: confirm("Force stop") },
        {
          label: "Restart",
          icon: <RotateCw />,
          disabled: emulator.status === "offline",
          onSelect: confirm("Restart"),
        },
        {
          label: "Open owner",
          icon: <UserRound />,
          separatorBefore: true,
          onSelect: () => router.push(`/admin/users/${emulator.ownerId}`),
        },
        ...(showOrganization
          ? [
              {
                label: "Open organization",
                icon: <Building2 />,
                onSelect: () => router.push(`/admin/organizations/${emulator.orgId}`),
              },
            ]
          : []),
      ]}
    />
  );
}

function columnsFor(showOrganization: boolean, showOwner: boolean): DataTableColumnDef<FleetRow>[] {
  return [
    {
      id: "emulator",
      accessorFn: (row) => row.emulator.name,
      header: ({ column }) => <ColumnHeader column={column} title="Emulator" />,
      cell: ({ row }) => (
        <div className="flex max-w-55 min-w-0 flex-col">
          <span className="truncate font-medium">{row.original.emulator.name}</span>
          <span className="truncate font-mono text-[11px] text-muted-foreground in-data-card-header:text-current in-data-card-header:opacity-75">
            {row.original.emulator.serial}
          </span>
        </div>
      ),
      meta: { label: "Emulator", minWidth: 180 },
    },
    ...(showOrganization
      ? [
          {
            id: "organization",
            accessorFn: (row: FleetRow) => row.orgName,
            header: ({ column }) => <ColumnHeader column={column} title="Organization" />,
            cell: ({ row }) => (
              <Link
                href={`/admin/organizations/${row.original.emulator.orgId}`}
                className="block max-w-50 truncate hover:underline"
                title={row.original.orgName}
              >
                {row.original.orgName}
              </Link>
            ),
            meta: { label: "Organization" },
          } satisfies DataTableColumnDef<FleetRow>,
        ]
      : []),
    ...(showOwner
      ? [
          {
            id: "owner",
            accessorFn: (row: FleetRow) => row.ownerName,
            header: ({ column }) => <ColumnHeader column={column} title="Owner" />,
            cell: ({ row }) => (
              <Link
                href={`/admin/users/${row.original.emulator.ownerId}`}
                className="whitespace-nowrap hover:underline"
              >
                {row.original.ownerName}
              </Link>
            ),
            meta: { label: "Owner" },
          } satisfies DataTableColumnDef<FleetRow>,
        ]
      : []),
    {
      id: "host",
      accessorFn: (row) => row.hostName,
      header: ({ column }) => <ColumnHeader column={column} title="Host" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs whitespace-nowrap">{row.original.hostName}</span>
      ),
      meta: { label: "Host" },
    },
    {
      id: "android",
      accessorFn: (row) => row.emulator.apiLevel,
      header: ({ column }) => <ColumnHeader column={column} title="Android" />,
      cell: ({ row }) => (
        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
          Android {row.original.emulator.androidVersion}
          <span className="font-mono text-[11px] text-muted-foreground">
            API {row.original.emulator.apiLevel}
          </span>
        </span>
      ),
      meta: { label: "Android" },
    },
    {
      id: "status",
      accessorFn: (row) => STATUS_ORDER[row.emulator.status],
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.emulator.status} />,
      meta: { label: "Status" },
    },
    {
      id: "address",
      accessorFn: (row) => formatAddress(row.emulator),
      enableSorting: false,
      header: ({ column }) => <ColumnHeader column={column} title="Address" />,
      cell: ({ row }) => <CopyAddress address={formatAddress(row.original.emulator)} />,
      meta: { label: "Address", minWidth: 190 },
    },
    {
      id: "lastActive",
      accessorFn: (row) => row.emulator.lastActive,
      header: ({ column }) => <ColumnHeader column={column} title="Last active" />,
      cell: ({ row }) => (
        <time
          dateTime={row.original.emulator.lastActive}
          title={formatDateTime(row.original.emulator.lastActive)}
          className="whitespace-nowrap text-muted-foreground"
        >
          {formatRelativeTime(row.original.emulator.lastActive, SAMPLE_NOW)}
        </time>
      ),
      meta: { label: "Last active" },
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <FleetRowActions row={row.original} showOrganization={showOrganization} />,
      meta: {
        headerClassName: "sticky right-0 z-10 w-12",
        cellClassName:
          "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
      },
    },
  ];
}

interface FleetEmulatorsTableProps {
  emulators: FleetEmulator[];
  /** Adds the Organization column (the fleet page; not inside one organization). */
  showOrganization?: boolean;
  /** Hide the Owner column on a single user's page. */
  showOwner?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Emulators across one or many organizations, with search and status filters. */
export function FleetEmulatorsTable({
  emulators,
  showOrganization = false,
  showOwner = true,
  emptyTitle = "No emulators yet",
  emptyDescription = "Emulators appear here once members start them.",
}: FleetEmulatorsTableProps) {
  const rows = React.useMemo<FleetRow[]>(
    () =>
      emulators.map((emulator) => ({
        emulator,
        orgName: getOrganization(emulator.orgId)?.name ?? emulator.orgId,
        ownerName: getMember(emulator.ownerId)?.name ?? emulator.ownerId,
        hostName: HOST_NAME[emulator.hostId] ?? emulator.hostId,
      })),
    [emulators]
  );
  const columns = React.useMemo(
    () => columnsFor(showOrganization, showOwner),
    [showOrganization, showOwner]
  );
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const counts = React.useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: rows.length,
      running: 0,
      booting: 0,
      stopped: 0,
      offline: 0,
    };
    for (const row of rows) result[row.emulator.status] += 1;
    return result;
  }, [rows]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (status === "all" || row.emulator.status === status) &&
        (!q ||
          [row.emulator.name, row.emulator.serial, row.orgName, row.ownerName, row.hostName]
            .join(" ")
            .toLowerCase()
            .includes(q))
    );
  }, [rows, query, status]);

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Smartphone />} title={emptyTitle} description={emptyDescription} />
      </Card>
    );
  }

  const firstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));
  return (
    <DataTable
      columns={columns}
      data={filtered}
      pagination={pagination}
      onPaginationChange={setPagination}
      hidePagination={rows.length <= 10}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      customLeftToolbar={
        <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SearchField
            value={query}
            onChange={(next) => {
              setQuery(next);
              firstPage();
            }}
            label="Search emulators"
            placeholder={
              showOrganization
                ? "Search by emulator, organization, owner or host…"
                : showOwner
                  ? "Search by emulator, owner or host…"
                  : "Search by emulator or host…"
            }
          />
          <FilterChips
            value={status}
            onChange={(next) => {
              setStatus(next);
              firstPage();
            }}
            label="Filter by status"
            options={STATUS_FILTERS.map((filter) => ({
              value: filter,
              label: filter === "all" ? "All" : EMULATOR_STATUS[filter].label,
              count: counts[filter],
              dotClassName: filter === "all" ? undefined : STATUS_DOT_CLASS[filter],
            }))}
          />
        </div>
      }
      emptyStateContent={
        <EmptyState
          icon={<SearchX />}
          title="No emulators match"
          description="Try a different search or status filter."
          className="py-6"
        />
      }
    />
  );
}
