import { cn } from "@/lib/utils";

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  /** Monospace for ids, addresses and other machine values. */
  mono?: boolean;
}

/** Label / value pairs as a description list; long values wrap rather than overflow. */
export function DetailList({ items, columns = 1 }: { items: DetailItem[]; columns?: 1 | 2 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4", columns === 2 && "sm:grid-cols-2")}>
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-1">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              "text-sm [overflow-wrap:anywhere] text-foreground",
              item.mono && "font-mono text-[13px]"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
