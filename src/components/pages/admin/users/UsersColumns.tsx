"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Building2, Eye, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import type { DataTableColumnDef } from "@/components/custom/data-table";
import { RowActions } from "@/components/custom/RowActions";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { MEMBER_STATUS, ORG_ROLE } from "@/components/pages/admin/constants/status.constants";
import {
  LastActiveCell,
  PersonCell,
  RunningCell,
} from "@/components/pages/admin/shared/MemberCells";
import { formatDate } from "@/lib/format";
import type { Member } from "@/types/admin.types";

export interface UserRow {
  member: Member;
  orgName: string;
  running: number;
}

const ROLE_ORDER = { owner: 0, admin: 1, member: 2 };

// TODO(api): password resets and suspensions call the users API.
function UserRowActions({ row }: { row: UserRow }) {
  const router = useRouter();
  const { member } = row;
  const confirm = (message: string) => () => toast(message, { description: member.name });
  return (
    <RowActions
      label={member.name}
      actions={[
        {
          label: "View user",
          icon: <Eye />,
          onSelect: () => router.push(`/admin/users/${member.id}`),
        },
        {
          label: "Open organization",
          icon: <Building2 />,
          onSelect: () => router.push(`/admin/organizations/${member.orgId}/users`),
        },
        {
          label: "Reset password",
          icon: <KeyRound />,
          separatorBefore: true,
          disabled: member.status === "invited",
          onSelect: confirm("Password reset email sent"),
        },
        {
          label: member.status === "suspended" ? "Reactivate" : "Suspend",
          icon: <Ban />,
          destructive: member.status !== "suspended",
          onSelect: confirm(
            member.status === "suspended" ? "Reactivation requested" : "Suspension requested"
          ),
        },
      ]}
    />
  );
}

export const USER_COLUMNS: DataTableColumnDef<UserRow>[] = [
  {
    id: "person",
    accessorFn: (row) => row.member.name,
    header: ({ column }) => <ColumnHeader column={column} title="User" />,
    cell: ({ row }) => <PersonCell member={row.original.member} />,
    meta: { label: "User", minWidth: 240 },
  },
  {
    id: "organization",
    accessorFn: (row) => row.orgName,
    header: ({ column }) => <ColumnHeader column={column} title="Organization" />,
    cell: ({ row }) => (
      <Link
        href={`/admin/organizations/${row.original.member.orgId}`}
        className="block max-w-[200px] truncate hover:underline"
        title={row.original.orgName}
      >
        {row.original.orgName}
      </Link>
    ),
    meta: { label: "Organization" },
  },
  {
    id: "role",
    accessorFn: (row) => ROLE_ORDER[row.member.orgRole],
    header: ({ column }) => <ColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = ORG_ROLE[row.original.member.orgRole];
      return <ToneBadge tone={role.tone} label={role.label} dot={false} />;
    },
    meta: { label: "Role" },
  },
  {
    id: "status",
    accessorFn: (row) => row.member.status,
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = MEMBER_STATUS[row.original.member.status];
      return <ToneBadge tone={status.tone} label={status.label} />;
    },
    meta: { label: "Status" },
  },
  {
    accessorKey: "running",
    header: ({ column }) => <ColumnHeader column={column} title="Emulators now" />,
    cell: ({ row }) => <RunningCell running={row.original.running} />,
    meta: { label: "Emulators now" },
  },
  {
    id: "lastActive",
    accessorFn: (row) => row.member.lastActiveAt ?? "",
    header: ({ column }) => <ColumnHeader column={column} title="Last active" />,
    cell: ({ row }) => <LastActiveCell at={row.original.member.lastActiveAt} />,
    meta: { label: "Last active" },
  },
  {
    id: "joined",
    accessorFn: (row) => row.member.joinedAt,
    header: ({ column }) => <ColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => (
      <time
        dateTime={row.original.member.joinedAt}
        className="whitespace-nowrap text-muted-foreground"
      >
        {formatDate(row.original.member.joinedAt)}
      </time>
    ),
    meta: { label: "Joined" },
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <UserRowActions row={row.original} />,
    meta: {
      headerClassName: "sticky right-0 z-10 w-12",
      cellClassName: "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
    },
  },
];
