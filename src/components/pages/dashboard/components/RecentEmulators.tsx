import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StatusBadge } from "@/components/custom/StatusBadge";
import { formatAddress } from "@/components/pages/emulators/utils/emulator.utils";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";
import type { Emulator } from "@/types/emulator.types";

export function RecentEmulators({
  emulators,
  className,
}: {
  emulators: Emulator[];
  className?: string;
}) {
  const recent = [...emulators]
    .sort((a, b) => b.lastActive.localeCompare(a.lastActive))
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent emulators</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild className="text-primary">
            <Link href="/emulators">
              View all
              <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-140 text-[13px]">
          <thead>
            <tr className="bg-table-header text-left text-table-header-foreground">
              <th className="px-4 py-2.5 font-medium">Emulator</th>
              <th className="px-3 py-2.5 font-medium">Android</th>
              <th className="px-3 py-2.5 font-medium">Address</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((e) => (
              <tr key={e.id} className="border-t transition-colors hover:bg-row-hover">
                <td className="px-4 py-3">
                  <div className="flex max-w-55 flex-col">
                    <span className="truncate font-medium" title={e.name}>
                      {e.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{e.serial}</span>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">Android {e.androidVersion}</td>
                <td className="px-3 py-3 font-mono text-xs whitespace-nowrap text-foreground/80">
                  {formatAddress(e)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground">
                  {formatRelativeTime(e.lastActive, SAMPLE_NOW)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
