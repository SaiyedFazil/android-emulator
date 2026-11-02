"use client";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import type { DataTableColumnDef } from "@/components/custom/data-table";
import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { TEAM_ROLE, USER_STATUS } from "@/components/pages/admin/constants/status.constants";
import { LastActiveCell } from "@/components/pages/admin/shared/MemberCells";
import { useNow } from "@/hooks/use-now";
import type { TeamMember } from "@/types/admin.types";

/** What the owner can do from a row's menu. */
export type TeamAction =
  "make-admin" | "make-support" | "resend-invite" | "suspend" | "reactivate" | "remove";

export interface TeamColumnsOptions {
  /** The signed-in user, marked "You". */
  viewerUuid: string | undefined;
  /** Only the owner gets the actions column. */
  canManage: boolean;
  onAction: (action: TeamAction, member: TeamMember) => void;
}

const ROLE_ORDER: Record<TeamMember["role"], number> = { OWNER: 0, ADMIN: 1, SUPPORT: 2 };

export const fullName = (member: TeamMember) => `${member.firstName} ${member.lastName}`;

function LiveLastActive({ at }: { at: string | null }) {
  return <LastActiveCell at={at} now={useNow()} />;
}

export function teamColumns({
  viewerUuid,
  canManage,
}: TeamColumnsOptions): DataTableColumnDef<TeamMember>[] {
  const columns: DataTableColumnDef<TeamMember>[] = [
    {
      id: "name",
      accessorFn: fullName,
      header: ({ column }) => <ColumnHeader column={column} title="Admin" />,
      cell: ({ row }) => (
        <div className="flex max-w-[280px] min-w-0 items-center gap-3">
          <EntityAvatar name={fullName(row.original)} size="sm" />
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5 truncate font-medium">
              {fullName(row.original)}
              {row.original.uuid === viewerUuid ? (
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
      id: "role",
      accessorFn: (member) => ROLE_ORDER[member.role],
      header: ({ column }) => <ColumnHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const role = TEAM_ROLE[row.original.role];
        return <ToneBadge tone={role.tone} label={role.label} dot={false} />;
      },
      meta: { label: "Role" },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = USER_STATUS[row.original.status];
        return <ToneBadge tone={status.tone} label={status.label} />;
      },
      meta: { label: "Status" },
    },
    {
      id: "lastActive",
      accessorFn: (member) => member.lastActiveAt ?? "",
      header: ({ column }) => <ColumnHeader column={column} title="Last active" />,
      cell: ({ row }) => <LiveLastActive at={row.original.lastActiveAt} />,
      meta: { label: "Last active" },
    },
  ];

  if (!canManage) return columns;
  return [
    ...columns,
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      // The row menu arrives with the write actions.
      cell: () => null,
      meta: {
        headerClassName: "sticky right-0 z-10 w-12",
        cellClassName:
          "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
      },
    },
  ];
}
