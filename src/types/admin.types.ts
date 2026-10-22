import type { Emulator } from "@/types/emulator.types";

/* Admin console data. Money is integer cents (USD); timestamps are ISO 8601 strings. */

export type PlanId = "free" | "starter" | "team" | "business" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** `null` = negotiated per customer (shown as "Custom"). */
  priceMonthly: number | null;
  concurrentEmulators: number;
  status: "active" | "archived";
  /** Offered to new organizations. */
  visible: boolean;
}

export type BillingCycle = "monthly" | "yearly";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  billingEmail: string;
  country: string;
  createdAt: string;
  /** Suspended by an admin; wins over the subscription's status. */
  suspended: boolean;
  paymentMethod: { brand: "Visa" | "Mastercard" | "Amex"; last4: string } | null;
}

export type OrgStatus = "active" | "trialing" | "past_due" | "suspended";

/** A member's role inside their organization — unrelated to access to /admin. */
export type OrgRole = "owner" | "admin" | "member";
export type MemberStatus = "active" | "invited" | "suspended";

export interface Member {
  id: string;
  orgId: string;
  name: string;
  email: string;
  orgRole: OrgRole;
  status: MemberStatus;
  twoFactor: boolean;
  hoursThisMonth: number;
  sessionsThisMonth: number;
  lastActiveAt: string | null;
  joinedAt: string;
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface Subscription {
  id: string;
  orgId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  /** Negotiated amount per billing cycle; overrides the plan price. */
  customAmount: number | null;
  startedAt: string;
  renewsAt: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export type InvoiceStatus = "paid" | "open" | "failed" | "refunded" | "void";

export interface Invoice {
  id: string;
  number: string;
  orgId: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export interface FleetEmulator extends Emulator {
  orgId: string;
  ownerId: string;
  hostId: string;
}

export type HostStatus = "healthy" | "degraded" | "offline" | "maintenance";

export interface Host {
  id: string;
  name: string;
  ip: string;
  region: string;
  status: HostStatus;
  /** Utilisation, percent. */
  cpu: number;
  memory: number;
  storage: number;
  slotsTotal: number;
  uptimeHours: number;
  lastHeartbeatAt: string;
}

export type AuditCategory =
  "auth" | "billing" | "organizations" | "users" | "infrastructure" | "settings";

export interface AuditEvent {
  id: string;
  at: string;
  actor: { kind: "admin" | "user" | "system"; name: string };
  category: AuditCategory;
  severity: "info" | "warning" | "critical";
  /** Readable sentence, e.g. "Changed Northwind Labs from Team to Business". */
  action: string;
  target?: { label: string; href: string };
  orgId?: string;
  ip: string | null;
}

export type AdminAccess = "owner" | "admin" | "support";

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  access: AdminAccess;
  status: "active" | "invited";
  twoFactor: boolean;
  lastActiveAt: string | null;
}
