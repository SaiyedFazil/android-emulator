import { EntityAvatar } from "@/components/custom/EntityAvatar";
import { PlanBadge } from "@/components/custom/PlanBadge";
import { ToneBadge } from "@/components/custom/ToneBadge";
import { ORG_STATUS } from "@/components/pages/admin/constants/status.constants";
import { OrganizationActions } from "@/components/pages/admin/organizations/detail/OrganizationActions";
import {
  getMember,
  getPlan,
  organizationStatus,
  subscriptionFor,
} from "@/components/pages/admin/utils/admin.selectors";
import { formatDate } from "@/lib/format";
import type { Organization } from "@/types/admin.types";

export function OrganizationHeader({ org }: { org: Organization }) {
  const status = ORG_STATUS[organizationStatus(org)];
  const plan = getPlan(subscriptionFor(org.id).planId);
  const owner = getMember(org.ownerId);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <EntityAvatar name={org.name} kind="org" size="lg" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1
            className="truncate text-2xl font-semibold tracking-tight md:text-[26px]"
            title={org.name}
          >
            {org.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ToneBadge tone={status.tone} label={status.label} />
            <PlanBadge plan={plan} />
            <span className="hidden sm:inline">·</span>
            <span>Owner {owner?.name ?? "—"}</span>
            <span aria-hidden="true">·</span>
            <span>Since {formatDate(org.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <OrganizationActions id={org.id} name={org.name} suspended={org.suspended} />
      </div>
    </div>
  );
}
