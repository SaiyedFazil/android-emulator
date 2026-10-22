import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import {
  getPlan,
  membersOf,
  monthlyRevenue,
  organizationStatus,
  organizationUsage,
  subscriptionFor,
} from "@/components/pages/admin/utils/admin.selectors";
import type { Organization, OrgStatus, Plan, PlanId } from "@/types/admin.types";

export interface OrgRow {
  org: Organization;
  status: OrgStatus;
  plan: Plan;
  members: number;
  usage: { inUse: number; limit: number };
  mrr: number;
}

export type OrgStatusFilter = "all" | OrgStatus;
export type PlanFilter = "all" | PlanId;

export const ORG_STATUS_FILTERS: OrgStatusFilter[] = [
  "all",
  "active",
  "trialing",
  "past_due",
  "suspended",
];

export function toOrgRows(): OrgRow[] {
  return ORGANIZATIONS.map((org) => {
    const subscription = subscriptionFor(org.id);
    return {
      org,
      status: organizationStatus(org),
      plan: getPlan(subscription.planId),
      members: membersOf(org.id).length,
      usage: organizationUsage(org.id),
      mrr: monthlyRevenue(subscription),
    };
  });
}

export function countOrgStatuses(rows: OrgRow[]): Record<OrgStatusFilter, number> {
  const counts = { all: rows.length, active: 0, trialing: 0, past_due: 0, suspended: 0 };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

/** Search matches name, slug, id or billing email. */
export function filterOrganizations(
  rows: OrgRow[],
  query: string,
  status: OrgStatusFilter,
  planId: PlanFilter
): OrgRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter(
    ({ org, status: s, plan }) =>
      (status === "all" || s === status) &&
      (planId === "all" || plan.id === planId) &&
      (!q ||
        [org.name, org.slug, org.id, org.billingEmail].some((value) =>
          value.toLowerCase().includes(q)
        ))
  );
}
