import { Skeleton } from "@/components/ui/skeleton";

export function DataTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading table">
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="h-11 bg-table-header" />
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-6 border-t px-4 py-3.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
