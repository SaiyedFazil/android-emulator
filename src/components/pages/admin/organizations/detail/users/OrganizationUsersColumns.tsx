"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, UserCog, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import { RowActions } from "@/components/custom/RowActions";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { MEMBER_STATUS, ORG_ROLE } from "@/components/pages/admin/constants/status.constants";
import {
  LastActiveCell,
  PersonCell,
  RunningCell,
  TwoFactorCell,
} from "@/components/pages/admin/shared/MemberCells";
import type { Member } from "@/types/admin.types";

export interface MemberRow {
  member: Member;
  running: number;
}

const ROLE_ORDER = { owner: 0, admin: 1, member: 2 };

// TODO(api): role changes, suspension and removal call the organizations API.
function MemberRowActions({ member }: { member: Member }) {
  const router = useRouter();
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
          label: "Change role",
          icon: <UserCog />,
          disabled: member.orgRole === "owner",
          onSelect: confirm("Change role"),
        },
        {
          label: member.status === "suspended" ? "Reactivate" : "Suspend",
          icon: <Ban />,
          disabled: member.orgRole === "owner",
          onSelect: confirm(
            member.status === "suspended" ? "Reactivation requested" : "Suspension requested"
          ),
        },
        {
          label: "Remove from organization",
          icon: <UserMinus />,
          destructive: true,
          separatorBefore: true,
          disabled: member.orgRole === "owner",
          onSelect: confirm("Removal requested"),
        },
      ]}
    />
  );
}

export const ORGANIZATION_USER_COLUMNS: ColumnDef<MemberRow>[] = [
  {
    id: "person",
    accessorFn: (row) => row.member.name,
    header: ({ column }) => <ColumnHeader column={column} title="Member" />,
    cell: ({ row }) => <PersonCell member={row.original.member} />,
    meta: { label: "Member", minWidth: 240 },
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
    id: "hours",
    accessorFn: (row) => row.member.hoursThisMonth,
    header: ({ column }) => <ColumnHeader column={column} title="Hours this month" />,
    cell: ({ row }) => (
      <span className="font-mono whitespace-nowrap tabular">
        {row.original.member.hoursThisMonth} h
        <span className="ml-1.5 font-sans text-xs text-muted-foreground">
          · {row.original.member.sessionsThisMonth} sessions
        </span>
      </span>
    ),
    meta: { label: "Hours this month" },
  },
  {
    id: "lastActive",
    accessorFn: (row) => row.member.lastActiveAt ?? "",
    header: ({ column }) => <ColumnHeader column={column} title="Last active" />,
    cell: ({ row }) => <LastActiveCell at={row.original.member.lastActiveAt} />,
    meta: { label: "Last active" },
  },
  {
    id: "twoFactor",
    accessorFn: (row) => (row.member.twoFactor ? 1 : 0),
    header: ({ column }) => <ColumnHeader column={column} title="2FA" />,
    cell: ({ row }) => <TwoFactorCell enabled={row.original.member.twoFactor} />,
    meta: { label: "2FA" },
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <MemberRowActions member={row.original.member} />,
    meta: {
      headerClassName: "sticky right-0 z-10 w-12",
      cellClassName: "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
    },
  },
];
