"use client";

import Link from "next/link";
import { CalendarPlus, CircleX, Layers, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeader } from "@/components/custom/ColumnHeader";
import type { DataTableColumnDef } from "@/components/custom/data-table";
import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { PlanBadge } from "@/components/custom/PlanBadge";
import { RowActions } from "@/components/custom/RowActions";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { SUBSCRIPTION_STATUS } from "@/components/pages/admin/constants/status.constants";
import { formatDate, formatPrice } from "@/lib/format";
import type { Organization, Plan, Subscription } from "@/types/admin.types";

export interface SubscriptionRow {
  subscription: Subscription;
  org: Organization;
  plan: Plan;
  amount: number | null;
}

const STATUS_ORDER = { past_due: 0, trialing: 1, active: 2, canceled: 3 };

// TODO(api): each action calls the subscriptions API; for now they confirm.
function SubscriptionRowActions({ row }: { row: SubscriptionRow }) {
  const { subscription, org } = row;
  const confirm = (message: string) => () => toast(message, { description: org.name });
  const live = subscription.status !== "canceled";
  return (
    <RowActions
      label={org.name}
      actions={[
        {
          label: "Change plan",
          icon: <Layers />,
          disabled: !live,
          onSelect: confirm("Change plan"),
        },
        ...(subscription.status === "trialing"
          ? [
              {
                label: "Extend trial",
                icon: <CalendarPlus />,
                onSelect: confirm("Trial extended by 7 days"),
              },
            ]
          : []),
        subscription.cancelAtPeriodEnd
          ? {
              label: "Resume",
              icon: <RotateCcw />,
              separatorBefore: true,
              onSelect: confirm("Subscription resumed"),
            }
          : {
              label: "Cancel at period end",
              icon: <CircleX />,
              destructive: true,
              separatorBefore: true,
              disabled: !live,
              onSelect: confirm("Cancellation scheduled"),
            },
      ]}
    />
  );
}

function RenewalCell({ subscription }: { subscription: Subscription }) {
  if (subscription.status === "canceled")
    return <span className="text-muted-foreground">Ended</span>;
  const date = subscription.trialEndsAt ?? subscription.renewsAt;
  if (!date) return <span className="text-muted-foreground">—</span>;
  const label = subscription.trialEndsAt
    ? "Trial ends"
    : subscription.cancelAtPeriodEnd
      ? "Ends"
      : "Renews";
  return (
    <span className="flex flex-col whitespace-nowrap">
      <span>{formatDate(date)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  );
}

export const SUBSCRIPTION_COLUMNS: DataTableColumnDef<SubscriptionRow>[] = [
  {
    id: "organization",
    accessorFn: (row) => row.org.name,
    header: ({ column }) => <ColumnHeader column={column} title="Organization" />,
    cell: ({ row }) => (
      <Link
        href={`/admin/organizations/${row.original.org.id}/billing`}
        className="group flex max-w-[260px] min-w-0 items-center gap-3 outline-none"
      >
        <EntityAvatar name={row.original.org.name} kind="org" size="sm" />
        <span
          className="truncate font-medium group-hover:underline group-focus-visible:underline"
          title={row.original.org.name}
        >
          {row.original.org.name}
        </span>
      </Link>
    ),
    meta: { label: "Organization", minWidth: 220 },
  },
  {
    id: "plan",
    accessorFn: (row) => row.plan.concurrentEmulators,
    header: ({ column }) => <ColumnHeader column={column} title="Plan" />,
    cell: ({ row }) => <PlanBadge plan={row.original.plan} />,
    meta: { label: "Plan" },
  },
  {
    id: "status",
    accessorFn: (row) => STATUS_ORDER[row.subscription.status],
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = SUBSCRIPTION_STATUS[row.original.subscription.status];
      return (
        <span className="flex flex-wrap items-center gap-1.5">
          <ToneBadge tone={status.tone} label={status.label} />
          {row.original.subscription.cancelAtPeriodEnd ? (
            <ToneBadge tone="warning" label="Cancelling" dot={false} />
          ) : null}
        </span>
      );
    },
    meta: { label: "Status" },
  },
  {
    id: "cycle",
    accessorFn: (row) => row.subscription.billingCycle,
    header: ({ column }) => <ColumnHeader column={column} title="Cycle" />,
    cell: ({ row }) => (row.original.subscription.billingCycle === "yearly" ? "Yearly" : "Monthly"),
    meta: { label: "Cycle" },
  },
  {
    id: "amount",
    accessorFn: (row) => row.amount ?? Number.MAX_SAFE_INTEGER,
    header: ({ column }) => <ColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => (
      <span className="font-mono whitespace-nowrap tabular">
        {formatPrice(row.original.amount)}
        {row.original.amount !== null ? (
          <span className="font-sans text-xs text-muted-foreground">
            /{row.original.subscription.billingCycle === "yearly" ? "yr" : "mo"}
          </span>
        ) : null}
      </span>
    ),
    meta: { label: "Amount" },
  },
  {
    id: "started",
    accessorFn: (row) => row.subscription.startedAt,
    header: ({ column }) => <ColumnHeader column={column} title="Started" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.subscription.startedAt)}
      </span>
    ),
    meta: { label: "Started" },
  },
  {
    id: "renewal",
    accessorFn: (row) => row.subscription.trialEndsAt ?? row.subscription.renewsAt ?? "",
    header: ({ column }) => <ColumnHeader column={column} title="Renews / ends" />,
    cell: ({ row }) => <RenewalCell subscription={row.original.subscription} />,
    meta: { label: "Renews / ends" },
  },
  {
    id: "payment",
    accessorFn: (row) => row.org.paymentMethod?.brand ?? "",
    enableSorting: false,
    header: ({ column }) => <ColumnHeader column={column} title="Payment method" />,
    cell: ({ row }) =>
      row.original.org.paymentMethod ? (
        <span className="whitespace-nowrap">
          {row.original.org.paymentMethod.brand}{" "}
          <span className="font-mono text-xs text-muted-foreground">
            •••• {row.original.org.paymentMethod.last4}
          </span>
        </span>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
    meta: { label: "Payment method" },
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SubscriptionRowActions row={row.original} />,
    meta: {
      headerClassName: "sticky right-0 z-10 w-12",
      cellClassName: "sticky right-0 z-10 w-12 bg-card shadow-[-10px_0_10px_-10px_rgb(0_0_0/0.2)]",
    },
  },
];
