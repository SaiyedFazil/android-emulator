import { AUDIT_EVENTS } from "@/components/pages/admin/audit-log/constants/audit.constants";
import { INVOICES } from "@/components/pages/admin/billing/constants/invoice.constants";
import { HOST_STATUS } from "@/components/pages/admin/constants/status.constants";
import { FLEET_EMULATORS } from "@/components/pages/admin/emulators/constants/fleet.constants";
import { HOSTS } from "@/components/pages/admin/hosts/constants/host.constants";
import { ORGANIZATIONS } from "@/components/pages/admin/organizations/constants/organization.constants";
import { PLANS } from "@/components/pages/admin/plans/constants/plan.constants";
import { cycleAmountFor } from "@/components/pages/admin/plans/utils/plan.utils";
import { SUBSCRIPTIONS } from "@/components/pages/admin/subscriptions/constants/subscription.constants";
import { MEMBERS } from "@/components/pages/admin/users/constants/member.constants";
import { formatCurrency } from "@/lib/format";
import { daysAgo } from "@/lib/sample-time";
import type {
  AuditEvent,
  FleetEmulator,
  Invoice,
  Member,
  Organization,
  OrgStatus,
  Plan,
  PlanId,
  Subscription,
} from "@/types/admin.types";

/* Everything the admin pages show that can be counted is counted here, from the sample data,
 * so the same number reads the same on every page. */

const isInUse = (e: FleetEmulator) => e.status === "running" || e.status === "booting";

const planById = new Map(PLANS.map((p) => [p.id, p]));
const orgById = new Map(ORGANIZATIONS.map((o) => [o.id, o]));
const memberById = new Map(MEMBERS.map((m) => [m.id, m]));
const subscriptionByOrg = new Map(SUBSCRIPTIONS.map((s) => [s.orgId, s]));

export function getPlan(id: PlanId): Plan {
  const plan = planById.get(id);
  if (!plan) throw new Error(`Unknown plan "${id}"`);
  return plan;
}

export function getOrganization(id: string): Organization | undefined {
  return orgById.get(id);
}

export function getMember(id: string): Member | undefined {
  return memberById.get(id);
}

export function subscriptionFor(orgId: string): Subscription {
  const subscription = subscriptionByOrg.get(orgId);
  if (!subscription) throw new Error(`No subscription for "${orgId}"`);
  return subscription;
}

/** An admin suspension wins; a canceled subscription leaves the organization suspended. */
export function organizationStatus(org: Organization): OrgStatus {
  if (org.suspended) return "suspended";
  const { status } = subscriptionFor(org.id);
  return status === "canceled" ? "suspended" : status;
}

/** One breakdown for every page: "Active" means status active, nothing broader. */
export function organizationStatusCounts(): Record<OrgStatus, number> {
  const counts: Record<OrgStatus, number> = { active: 0, trialing: 0, past_due: 0, suspended: 0 };
  for (const org of ORGANIZATIONS) counts[organizationStatus(org)] += 1;
  return counts;
}

/** What one billing cycle costs; `null` for a custom-priced plan without a negotiated amount. */
export function cycleAmount(subscription: Subscription): number | null {
  return cycleAmountFor(subscription, getPlan(subscription.planId).priceMonthly);
}

/** Contribution to MRR: paying (or past-due) subscriptions only, yearly spread over 12 months. */
export function monthlyRevenue(subscription: Subscription): number {
  if (subscription.status !== "active" && subscription.status !== "past_due") return 0;
  const amount = cycleAmount(subscription) ?? 0;
  return subscription.billingCycle === "yearly" ? Math.round(amount / 12) : amount;
}

export function totalMrr(): number {
  return SUBSCRIPTIONS.reduce((sum, s) => sum + monthlyRevenue(s), 0);
}

export function membersOf(orgId: string): Member[] {
  return MEMBERS.filter((m) => m.orgId === orgId);
}

export function emulatorsOf(orgId: string): FleetEmulator[] {
  return FLEET_EMULATORS.filter((e) => e.orgId === orgId);
}

/** Newest first. */
export function invoicesOf(orgId: string): Invoice[] {
  return INVOICES.filter((i) => i.orgId === orgId).sort((a, b) =>
    b.issuedAt.localeCompare(a.issuedAt)
  );
}

export function auditFor(orgId: string): AuditEvent[] {
  return AUDIT_EVENTS.filter((e) => e.orgId === orgId);
}

/** Concurrent emulators running or booting, against the plan's limit. */
export function organizationUsage(orgId: string): { inUse: number; limit: number } {
  return {
    inUse: emulatorsOf(orgId).filter(isInUse).length,
    limit: getPlan(subscriptionFor(orgId).planId).concurrentEmulators,
  };
}

export function memberEmulatorsRunning(memberId: string): number {
  return FLEET_EMULATORS.filter((e) => e.ownerId === memberId && isInUse(e)).length;
}

export function planSubscribers(planId: PlanId): number {
  return SUBSCRIPTIONS.filter((s) => s.planId === planId && s.status !== "canceled").length;
}

export function hostSlotsUsed(hostId: string): number {
  return FLEET_EMULATORS.filter((e) => e.hostId === hostId && isInUse(e)).length;
}

/** Slots in use across hosts that are reachable. */
export function fleetCapacity(): { used: number; total: number } {
  const reachable = HOSTS.filter((h) => h.status !== "offline");
  return {
    used: reachable.reduce((sum, h) => sum + hostSlotsUsed(h.id), 0),
    total: reachable.reduce((sum, h) => sum + h.slotsTotal, 0),
  };
}

/** A small seeded PRNG, so sample charts are identical on the server and in the browser. */
function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// TODO(api): daily concurrency comes from usage metrics; this sample ends at today's usage.
export function usageHistory(orgId: string, days = 14): { day: string; inUse: number }[] {
  const { inUse, limit } = organizationUsage(orgId);
  const ceiling = Math.max(limit, inUse);
  const random = seededRandom(orgId);
  return Array.from({ length: days }, (_, index) => {
    const today = index === days - 1;
    const value = today ? inUse : Math.min(ceiling, Math.round(inUse * (0.6 + random() * 0.5)));
    return { day: daysAgo(days - 1 - index).slice(0, 10), inUse: value };
  });
}

export type AttentionKind = "past_due" | "failed_payment" | "host" | "at_limit";

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  title: string;
  href: string;
}

/** What an admin should look at next, most urgent kinds first. */
export function needsAttention(): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const subscription of SUBSCRIPTIONS.filter((s) => s.status === "past_due")) {
    const org = orgById.get(subscription.orgId);
    if (!org) continue;
    items.push({
      id: `past-due-${org.id}`,
      kind: "past_due",
      title: `${org.name} is past due`,
      href: `/admin/organizations/${org.id}/billing`,
    });
  }
  for (const invoice of INVOICES.filter((i) => i.status === "failed")) {
    const org = orgById.get(invoice.orgId);
    if (!org) continue;
    items.push({
      id: `failed-${invoice.id}`,
      kind: "failed_payment",
      title: `Payment of ${formatCurrency(invoice.amount)} failed for ${org.name}`,
      href: "/admin/billing",
    });
  }
  for (const host of HOSTS.filter((h) => h.status === "degraded" || h.status === "offline")) {
    items.push({
      id: `host-${host.id}`,
      kind: "host",
      title: `${host.name} is ${HOST_STATUS[host.status].label.toLowerCase()}`,
      href: "/admin/hosts",
    });
  }
  for (const org of ORGANIZATIONS) {
    const { inUse, limit } = organizationUsage(org.id);
    if (inUse === 0 || inUse < limit) continue;
    items.push({
      id: `limit-${org.id}`,
      kind: "at_limit",
      title: `${org.name} is ${inUse > limit ? "over" : "at"} its limit (${inUse} / ${limit})`,
      href: `/admin/organizations/${org.id}`,
    });
  }
  return items;
}
