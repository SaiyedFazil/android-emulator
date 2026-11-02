import type { UserStatus } from "@/types/auth.types";
import type { Emulator } from "@/types/emulator.types";

/* Admin console data. Money is integer cents (USD); timestamps are ISO 8601 strings. */

/** A plan from `/admin/plans`: what the live Plans page shows and edits. */
export interface ApiPlan {
  uuid: string;
  name: string;
  /** Null when the plan has no description. */
  description: string | null;
  /** How many emulators an organization on it can have (shown, not yet enforced). */
  emulatorLimit: number;
  createdAt: string;
  updatedAt: string;
}

/** What the Plan sheet sends: every field to create, only the changed ones to edit. */
export type PlanInput = Pick<ApiPlan, "name" | "description" | "emulatorLimit">;

export type PlanId = "free" | "starter" | "team" | "business" | "enterprise";

/** Sample plan for the pages that stay static until Phase 4 (billing, dashboard, organizations). */
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

/** The roles the owner can give on the Team page; `OWNER` comes only from the setup script. */
export type TeamRole = "ADMIN" | "SUPPORT";

/** One person on the platform team, from `GET /admin/team`. */
export interface TeamMember {
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "OWNER" | TeamRole;
  status: UserStatus;
  /** ISO 8601 timestamp of the last sign-in; null if they never signed in. */
  lastActiveAt: string | null;
}

/** What the owner sends to invite someone. */
export interface TeamInvite {
  email: string;
  firstName: string;
  lastName: string;
  role: TeamRole;
}

/** `restored` is true when the email belonged to a removed team member, whose account came back. */
export type InvitedTeamMember = TeamMember & { restored: boolean };
