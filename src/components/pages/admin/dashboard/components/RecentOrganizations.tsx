import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ChartCard } from "@/components/custom/ChartCard";
import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { PlanBadge } from "@/components/custom/PlanBadge";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { ORG_STATUS } from "@/components/pages/admin/constants/status.constants";
import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import {
  getPlan,
  organizationStatus,
  subscriptionFor,
} from "@/components/pages/admin/utils/admin.selectors";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import { SAMPLE_NOW } from "@/lib/sample-time";

export function RecentOrganizations({ className }: { className?: string }) {
  const recent = [...ORGANIZATIONS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <ChartCard
      title="Recent organizations"
      description="The newest customers"
      action={
        <Button variant="link" size="sm" asChild className="px-0">
          <Link href="/admin/organizations">
            View all
            <ArrowRight />
          </Link>
        </Button>
      }
      className={className}
      contentClassName="px-0"
    >
      <ul className="divide-y">
        {recent.map((org) => {
          const status = ORG_STATUS[organizationStatus(org)];
          return (
            <li key={org.id}>
              <Link
                href={`/admin/organizations/${org.id}`}
                className="flex items-center gap-3 px-(--card-spacing) py-3 transition-colors outline-none hover:bg-row-hover focus-visible:bg-row-hover"
              >
                <EntityAvatar name={org.name} kind="org" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium" title={org.name}>
                    {org.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Joined {formatRelativeTime(org.createdAt, SAMPLE_NOW)} · {org.country}
                  </span>
                </span>
                <span className="hidden sm:inline-flex">
                  <PlanBadge plan={getPlan(subscriptionFor(org.id).planId)} />
                </span>
                <ToneBadge tone={status.tone} label={status.label} />
              </Link>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
