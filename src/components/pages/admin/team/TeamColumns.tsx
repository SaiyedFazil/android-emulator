"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MailPlus, ShieldCheck, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { RowActions } from "@/components/custom/RowActions";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { ADMIN_ACCESS } from "@/components/pages/admin/constants/status.constants";
import { LastActiveCell, TwoFactorCell } from "@/components/pages/admin/shared/MemberCells";
import { CURRENT_ADMIN_ID } from "@/components/pages/admin/team/constants/access.constants";
import type { AdminMember } from "@/types/admin.types";

const ACCESS_ORDER = { owner: 0, admin: 1, support: 2 };

// TODO(auth): access changes and removals call the admin-team API.
function TeamRowActions({ admin }: { admin: AdminMember }) {
  const confirm = (message: string) => () => toast(message, { description: admin.email });
  const protectedRow = admin.access === "owner" || admin.id === CURRENT_ADMIN_ID;
  return (
    <RowActions
      label={admin.name}
      actions={[
        {
          label: "Change access",
          icon: <ShieldCheck />,
          disabled: protectedRow,
          onSelect: confirm("Change access"),
        },
        ...(admin.status === "invited"
          ? [{ label: "Resend invite", icon: <MailPlus />, onSelect: confirm("Invite resent") }]
          : []),
        {
          label: "Remove admin",
          icon: <UserMinus />,
          destructive: true,
          separatorBefore: true,
          disabled: protectedRow,
          onSelect: confirm("Removal requested"),
        },
      ]}
    />
  );
}

export const TEAM_COLUMNS: ColumnDef<AdminMember>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Admin" />,
    cell: ({ row }) => (
      <div className="flex max-w-[280px] min-w-0 items-center gap-3">
        <EntityAvatar name={row.original.name} size="sm" />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 truncate font-medium">
            {row.original.name}
            {row.original.id === CURRENT_ADMIN_ID ? (
              <span className="rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                You
              </span>
            ) : null}
          </span>
          <span className="truncate text-xs text-muted-foreground [[data-card-header]_&]:text-current [[data-card-header]_&]:opacity-75">
            {row.original.email}
          </span>
        </span>
      </div>
    ),
    meta: { label: "Admin", minWidth: 220 },
  },
  {
    id: "access",
    accessorFn: (admin) => ACCESS_ORDER[admin.access],
    header: ({ column }) => <ColumnHeader column={column} title="Access" />,
    cell: ({ row }) => {
      const access = ADMIN_ACCESS[row.original.access];
      return <ToneBadge tone={access.tone} label={access.label} dot={false} />;
    },
    meta: { label: "Access" },
  },
  {
    id: "twoFactor",
    accessorFn: (admin) => (admin.twoFactor ? 1 : 0),
    header: ({ column }) => <ColumnHeader column={column} title="2FA" />,
    cell: ({ row }) => <TwoFactorCell enabled={row.original.twoFactor} />,
    meta: { label: "2FA" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <ToneBadge
        tone={row.original.status === "active" ? "success" : "info"}
        label={row.original.status === "active" ? "Active" : "Invited"}
      />
    ),
    meta: { label: "Status" },
  },
  {
    id: "lastActive",
    accessorFn: (admin) => admin.lastActiveAt ?? "",
    header: ({ column }) => <ColumnHeader column={column} title="Last active" />,
    cell: ({ row }) => <LastActiveCell at={row.original.lastActiveAt} />,
    meta: { label: "Last active" },
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TeamRowActions admin={row.original} />,
    meta: {
      headerClassName: "sticky right-0 z-10 w-12",
      cellClassName: "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
    },
  },
];
