"use client";

import { StatusBadge } from "@/components/custom/StatusBadge";
import { ColumnHeader } from "@/components/custom/ColumnHeader";
import type { DataTableColumnDef } from "@/components/custom/data-table";
import { CopyAddress } from "@/components/pages/emulators/components/CopyAddress";
import { EmulatorRowActions } from "@/components/pages/emulators/components/EmulatorRowActions";
import { formatAddress } from "@/components/pages/emulators/utils/emulator.utils";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Emulator, EmulatorStatus } from "@/types/emulator.types";

const STATUS_ORDER: Record<EmulatorStatus, number> = {
  running: 0,
  booting: 1,
  stopped: 2,
  offline: 3,
};

export const EMULATOR_COLUMNS: DataTableColumnDef<Emulator>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Emulator" />,
    cell: ({ row }) => (
      <div className="flex max-w-65 min-w-0 flex-col">
        <span className="truncate font-medium" title={row.original.name}>
          {row.original.name}
        </span>
        <span className="truncate font-mono text-[11px] text-muted-foreground in-data-card-header:text-current in-data-card-header:opacity-75">
          {row.original.serial}
        </span>
      </div>
    ),
    meta: { label: "Emulator", minWidth: 220 },
  },
  {
    accessorKey: "model",
    header: ({ column }) => <ColumnHeader column={column} title="Device" />,
    meta: { label: "Device" },
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.model}</span>,
  },
  {
    id: "android",
    accessorFn: (e) => e.apiLevel,
    header: ({ column }) => <ColumnHeader column={column} title="Android" />,
    meta: { label: "Android" },
    cell: ({ row }) => (
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        Android {row.original.androidVersion}
        <span className="font-mono text-[11px] text-muted-foreground">
          API {row.original.apiLevel}
        </span>
      </span>
    ),
  },
  {
    accessorKey: "status",
    sortFn: (a, b) => STATUS_ORDER[a.original.status] - STATUS_ORDER[b.original.status],
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    meta: { label: "Status" },
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "address",
    accessorFn: formatAddress,
    enableSorting: false,
    header: ({ column }) => <ColumnHeader column={column} title="Address" />,
    cell: ({ row }) => <CopyAddress address={formatAddress(row.original)} />,
    meta: { label: "Address", minWidth: 190 },
  },
  {
    accessorKey: "lastActive",
    header: ({ column }) => <ColumnHeader column={column} title="Last active" />,
    meta: { label: "Last active" },
    cell: ({ row }) => (
      <time
        dateTime={row.original.lastActive}
        title={formatDateTime(row.original.lastActive)}
        className="whitespace-nowrap text-muted-foreground"
      >
        {formatRelativeTime(row.original.lastActive, SAMPLE_NOW)}
      </time>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <EmulatorRowActions emulator={row.original} />,
    // Pinned to the right edge so the actions stay in view when the table scrolls sideways.
    meta: {
      headerClassName: "sticky right-0 z-10 w-12",
      cellClassName: "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
    },
  },
];
