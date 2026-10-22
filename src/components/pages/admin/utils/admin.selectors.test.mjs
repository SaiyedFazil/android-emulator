// Run with `npm test`. Guards the spec's rule that numbers on screen always add up: every count,
// usage figure and revenue number is derived from the same sample data.
import assert from "node:assert/strict";
import { test } from "node:test";

import { AUDIT_EVENTS } from "../audit-log/constants/audit.constants.ts";
import { FLEET_EMULATORS } from "../emulators/constants/fleet.constants.ts";
import { HOSTS } from "../hosts/constants/host.constants.ts";
import { ORGANIZATIONS } from "../organizations/constants/organization.constants.ts";
import { PLANS } from "../plans/constants/plan.constants.ts";
import { SUBSCRIPTIONS } from "../subscriptions/constants/subscription.constants.ts";
import { MEMBERS } from "../users/constants/member.constants.ts";
import {
  cycleAmount,
  fleetCapacity,
  getMember,
  hostSlotsUsed,
  invoicesOf,
  membersOf,
  monthlyRevenue,
  needsAttention,
  organizationStatus,
  organizationStatusCounts,
  organizationUsage,
  planSubscribers,
  subscriptionFor,
  totalMrr,
  usageHistory,
} from "./admin.selectors.ts";

const inUse = (e) => e.status === "running" || e.status === "booting";

test("organization status counts are one breakdown that adds up to every organization", () => {
  const counts = organizationStatusCounts();
  assert.equal(
    counts.active + counts.trialing + counts.past_due + counts.suspended,
    ORGANIZATIONS.length
  );
  for (const status of ["active", "trialing", "past_due", "suspended"]) {
    assert.equal(
      counts[status],
      ORGANIZATIONS.filter((o) => organizationStatus(o) === status).length
    );
  }
});

test("every organization has exactly one subscription", () => {
  for (const org of ORGANIZATIONS) {
    assert.equal(SUBSCRIPTIONS.filter((s) => s.orgId === org.id).length, 1, org.id);
  }
});

test("plan subscriber counts add up to the non-canceled subscriptions", () => {
  const total = PLANS.reduce((sum, plan) => sum + planSubscribers(plan.id), 0);
  assert.equal(total, SUBSCRIPTIONS.filter((s) => s.status !== "canceled").length);
});

test("MRR is the sum of each subscription's monthly revenue", () => {
  assert.equal(
    totalMrr(),
    SUBSCRIPTIONS.reduce((sum, s) => sum + monthlyRevenue(s), 0)
  );
  assert.ok(totalMrr() > 0);
});

test("Enterprise uses the negotiated amount and yearly revenue is spread over 12 months", () => {
  const meridian = subscriptionFor("org_meridian");
  assert.equal(meridian.planId, "enterprise");
  assert.equal(cycleAmount(meridian), 249000);
  const yearly = SUBSCRIPTIONS.find((s) => s.billingCycle === "yearly" && s.status === "active");
  assert.equal(monthlyRevenue(yearly), Math.round(cycleAmount(yearly) / 12));
});

test("trialing and canceled subscriptions bring in no revenue", () => {
  for (const s of SUBSCRIPTIONS.filter((x) => x.status === "trialing" || x.status === "canceled")) {
    assert.equal(monthlyRevenue(s), 0, s.id);
  }
});

test("organization usage is counted from running and booting fleet emulators", () => {
  for (const org of ORGANIZATIONS) {
    const expected = FLEET_EMULATORS.filter((e) => e.orgId === org.id && inUse(e)).length;
    assert.equal(organizationUsage(org.id).inUse, expected, org.id);
  }
});

test("the edge-case organizations are what the review focus expects", () => {
  assert.deepEqual(organizationUsage("org_helix"), { inUse: 11, limit: 10 });
  assert.equal(organizationStatus(ORGANIZATIONS.find((o) => o.id === "org_helix")), "past_due");
  assert.equal(organizationUsage("org_quartz").inUse, 0);
  assert.equal(invoicesOf("org_quartz").length, 0);
  assert.equal(organizationStatus(ORGANIZATIONS.find((o) => o.id === "org_quartz")), "trialing");
  assert.ok(ORGANIZATIONS.find((o) => o.id === "org_meridian").name.length > 30);
  assert.ok(ORGANIZATIONS.some((o) => organizationStatus(o) === "suspended"));
});

test("every member belongs to an existing organization, and emulator owners to the same one", () => {
  const orgIds = new Set(ORGANIZATIONS.map((o) => o.id));
  for (const m of MEMBERS) assert.ok(orgIds.has(m.orgId), m.id);
  for (const e of FLEET_EMULATORS) {
    assert.equal(getMember(e.ownerId)?.orgId, e.orgId, e.id);
  }
  assert.equal(getMember("usr_priya")?.orgId, "org_northwind");
  for (const org of ORGANIZATIONS) assert.ok(membersOf(org.id).length > 0, org.id);
});

test("host slots and fleet capacity agree with the emulators placed on them", () => {
  const used = HOSTS.reduce((sum, h) => sum + hostSlotsUsed(h.id), 0);
  assert.equal(used, FLEET_EMULATORS.filter(inUse).length);
  for (const host of HOSTS.filter((h) => h.status === "offline")) {
    assert.equal(hostSlotsUsed(host.id), 0, host.id);
  }
  for (const host of HOSTS) assert.ok(hostSlotsUsed(host.id) <= host.slotsTotal, host.id);
  assert.equal(fleetCapacity().used, used);
});

test("usage history is deterministic and ends at today's usage", () => {
  const first = usageHistory("org_northwind");
  assert.deepEqual(usageHistory("org_northwind"), first);
  assert.equal(first.length, 14);
  assert.equal(first.at(-1).inUse, organizationUsage("org_northwind").inUse);
  for (const point of usageHistory("org_lumen")) {
    assert.ok(point.inUse <= organizationUsage("org_lumen").limit);
  }
});

test("needs-attention items point at real admin pages", () => {
  const items = needsAttention();
  assert.ok(items.some((i) => i.kind === "past_due"));
  assert.ok(items.some((i) => i.kind === "failed_payment"));
  assert.ok(items.some((i) => i.kind === "host"));
  assert.ok(items.some((i) => i.kind === "at_limit"));
  for (const item of items) assert.match(item.href, /^\/admin\//);
});

test("paying monthly subscriptions are invoiced every month, at their cycle amount", () => {
  const DAY = 86_400_000;
  const now = new Date("2026-10-19T09:00:00.000Z").getTime();
  const paying = SUBSCRIPTIONS.filter(
    (s) =>
      s.billingCycle === "monthly" &&
      (s.status === "active" || s.status === "past_due") &&
      cycleAmount(s) > 0
  );
  assert.ok(paying.length >= 5);
  for (const subscription of paying) {
    const invoices = invoicesOf(subscription.orgId);
    const age = Math.floor((now - new Date(subscription.startedAt).getTime()) / DAY);
    for (let window = 0; window < 5 && window * 30 + 30 <= age; window++) {
      const inWindow = invoices.some((i) => {
        const daysAgo = (now - new Date(i.issuedAt).getTime()) / DAY;
        return daysAgo >= window * 30 && daysAgo < window * 30 + 30;
      });
      assert.ok(
        inWindow,
        `${subscription.orgId} has no invoice ${window * 30}–${window * 30 + 30} days ago`
      );
    }
    for (const invoice of invoices)
      assert.equal(invoice.amount, cycleAmount(subscription), invoice.id);
  }
});

test("audit targets link to admin routes that exist", () => {
  const orgIds = new Set(ORGANIZATIONS.map((o) => o.id));
  for (const event of AUDIT_EVENTS.filter((e) => e.target)) {
    const href = event.target.href;
    const org = href.match(/^\/admin\/organizations\/([^/]+)/);
    const user = href.match(/^\/admin\/users\/([^/]+)/);
    if (org) assert.ok(orgIds.has(org[1]), href);
    else if (user) assert.ok(getMember(user[1]), href);
    else
      assert.match(href, /^\/admin\/(plans|subscriptions|billing|emulators|hosts|team|settings)$/);
  }
});
