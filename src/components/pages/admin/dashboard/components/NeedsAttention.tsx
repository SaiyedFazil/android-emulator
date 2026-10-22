import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  CreditCard,
  Gauge,
  Server,
} from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { EmptyState } from "@/components/custom/EmptyState";
import type { AttentionItem, AttentionKind } from "@/components/pages/admin/utils/admin.selectors";
import { cn } from "@/lib/utils";

const KIND: Record<AttentionKind, { icon: React.ReactNode; className: string }> = {
  past_due: {
    icon: <Clock />,
    className: "bg-status-booting-soft text-status-booting-foreground",
  },
  failed_payment: {
    icon: <CreditCard />,
    className: "bg-status-offline-soft text-status-offline-foreground",
  },
  host: { icon: <Server />, className: "bg-status-offline-soft text-status-offline-foreground" },
  at_limit: { icon: <Gauge />, className: "bg-status-booting-soft text-status-booting-foreground" },
};

/** Items beyond this sit behind "Show more", so the card doesn't outgrow its neighbours. */
const VISIBLE = 5;

function Row({ item }: { item: AttentionItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-center gap-3 px-(--card-spacing) py-2.5 text-sm transition-colors outline-none hover:bg-row-hover focus-visible:bg-row-hover"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
            KIND[item.kind].className
          )}
        >
          {KIND[item.kind].icon}
        </span>
        <span className="min-w-0 flex-1">{item.title}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
}

export function NeedsAttention({
  items,
  className,
}: {
  items: AttentionItem[];
  className?: string;
}) {
  const shown = items.slice(0, VISIBLE);
  const more = items.slice(VISIBLE);

  return (
    <ChartCard
      title="Needs attention"
      description={
        items.length ? `${items.length} item${items.length === 1 ? "" : "s"} to review` : undefined
      }
      className={className}
      contentClassName="px-0"
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<CircleCheck />}
          title="All clear"
          description="No payments, hosts or limits need you."
        />
      ) : (
        <>
          <ul className="divide-y">
            {shown.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
          {more.length ? (
            <details className="group border-t">
              <summary className="flex cursor-pointer list-none items-center justify-center gap-1 px-(--card-spacing) py-2.5 text-sm font-medium text-primary transition-colors outline-none hover:bg-row-hover focus-visible:bg-row-hover [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show {more.length} more</span>
                <span className="hidden group-open:inline">Show less</span>
                <ChevronDown
                  className="size-4 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="divide-y border-t">
                {more.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </ChartCard>
  );
}
