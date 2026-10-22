import { minutesAgo } from "@/lib/sample-time";
import type { AuditCategory, AuditEvent } from "@/types/admin.types";

type Actor = AuditEvent["actor"];

const admin = (name: string): Actor => ({ kind: "admin", name });
const user = (name: string): Actor => ({ kind: "user", name });
const SYSTEM: Actor = { kind: "system", name: "System" };

const org = (id: string, name: string, tab = "") => ({
  label: name,
  href: `/admin/organizations/${id}${tab}`,
});
const person = (id: string, name: string) => ({ label: name, href: `/admin/users/${id}` });
const page = (label: string, path: string) => ({ label, href: `/admin/${path}` });

const H = 60;
const D = 24 * H;

let sequence = 0;
function event(
  minutes: number,
  actor: Actor,
  category: AuditCategory,
  severity: AuditEvent["severity"],
  action: string,
  target?: AuditEvent["target"],
  orgId?: string,
  ip: string | null = null
): AuditEvent {
  sequence += 1;
  return {
    id: `evt_${String(sequence).padStart(3, "0")}`,
    at: minutesAgo(minutes),
    actor,
    category,
    severity,
    action,
    target,
    orgId,
    ip,
  };
}

const HELIX = "Helix Mobile";
const MERIDIAN = "Meridian Interactive Entertainment Group";

// TODO(api): the audit trail comes from the backend. Newest first.
export const AUDIT_EVENTS: AuditEvent[] = [
  event(
    12,
    SYSTEM,
    "billing",
    "critical",
    "Payment of $49 failed for Helix Mobile",
    org("org_helix", HELIX, "/billing"),
    "org_helix"
  ),
  event(
    25,
    admin("Alex Morgan"),
    "organizations",
    "info",
    "Changed Helix Mobile from Business to Team",
    org("org_helix", HELIX),
    "org_helix",
    "203.0.113.10"
  ),
  event(
    40,
    SYSTEM,
    "infrastructure",
    "critical",
    "Host ap-south-c2 stopped responding",
    page("Hosts", "hosts")
  ),
  event(
    55,
    SYSTEM,
    "infrastructure",
    "warning",
    "Host eu-west-b2 memory above 90%",
    page("Hosts", "hosts")
  ),
  event(
    80,
    user("Daniel Okafor"),
    "users",
    "info",
    "Invited clara.ruiz@northwind.dev to Northwind Labs",
    org("org_northwind", "Northwind Labs", "/users"),
    "org_northwind",
    "198.51.100.24"
  ),
  event(
    2 * H,
    admin("Riya Kapoor"),
    "users",
    "warning",
    "Suspended Noah Fischer in Northwind Labs",
    person("usr_noah", "Noah Fischer"),
    "org_northwind",
    "203.0.113.22"
  ),
  event(
    3 * H,
    user("Lena Fischer"),
    "organizations",
    "info",
    "Started a Starter trial for Quartz Studio",
    org("org_quartz", "Quartz Studio"),
    "org_quartz",
    "198.51.100.71"
  ),
  event(
    4 * H,
    admin("Alex Morgan"),
    "organizations",
    "warning",
    "Suspended Verde Retail for non-payment",
    org("org_verde", "Verde Retail"),
    "org_verde",
    "203.0.113.10"
  ),
  event(
    5 * H,
    SYSTEM,
    "billing",
    "warning",
    "Payment of $49 failed for Verde Retail",
    org("org_verde", "Verde Retail", "/billing"),
    "org_verde"
  ),
  event(
    6 * H,
    user("Sofia Ramírez"),
    "billing",
    "info",
    "Updated the payment method for Orbit Payments",
    org("org_orbit", "Orbit Payments", "/billing"),
    "org_orbit",
    "198.51.100.140"
  ),
  event(
    8 * H,
    admin("Jordan Lee"),
    "users",
    "info",
    "Reset the password for Marco Bianchi",
    person("usr_marco", "Marco Bianchi"),
    "org_helix",
    "203.0.113.31"
  ),
  event(
    10 * H,
    user("Grace Mensah"),
    "billing",
    "warning",
    "Scheduled Atlas Logistics to cancel at the end of the period",
    org("org_atlas", "Atlas Logistics", "/billing"),
    "org_atlas",
    "198.51.100.9"
  ),
  event(
    12 * H,
    admin("Alex Morgan"),
    "settings",
    "info",
    "Required two-factor authentication for all admins",
    page("Settings", "settings"),
    undefined,
    "203.0.113.10"
  ),
  event(
    14 * H,
    user("Amara Singh"),
    "organizations",
    "info",
    "Started a Business trial for Kestrel Aero",
    org("org_kestrel", "Kestrel Aero"),
    "org_kestrel",
    "198.51.100.200"
  ),
  event(
    18 * H,
    SYSTEM,
    "auth",
    "warning",
    "5 failed sign-ins for samir.haddad@helixmobile.io",
    person("usr_samir", "Samir Haddad"),
    "org_helix",
    "45.33.12.8"
  ),
  event(
    D,
    admin("Riya Kapoor"),
    "billing",
    "info",
    "Refunded $129 to Orbit Payments",
    org("org_orbit", "Orbit Payments", "/billing"),
    "org_orbit",
    "203.0.113.22"
  ),
  event(
    D + 3 * H,
    admin("Alex Morgan"),
    "infrastructure",
    "info",
    "Restarted host eu-west-b2",
    page("Hosts", "hosts"),
    undefined,
    "203.0.113.10"
  ),
  event(
    D + 6 * H,
    user("Alexandria Konstantinopoulou"),
    "users",
    "info",
    `Invited 2 people to ${MERIDIAN}`,
    org("org_meridian", MERIDIAN, "/users"),
    "org_meridian",
    "198.51.100.45"
  ),
  event(
    D + 10 * H,
    admin("Riya Kapoor"),
    "settings",
    "info",
    "Updated the Team plan description",
    page("Plans", "plans"),
    undefined,
    "203.0.113.22"
  ),
  event(
    2 * D,
    SYSTEM,
    "auth",
    "info",
    "New sign-in for Alex Morgan from a new device",
    page("Team", "team"),
    undefined,
    "203.0.113.10"
  ),
  event(
    2 * D + 4 * H,
    user("Marco Bianchi"),
    "organizations",
    "info",
    "Requested a downgrade of Helix Mobile to Team",
    org("org_helix", HELIX),
    "org_helix",
    "198.51.100.88"
  ),
  event(
    3 * D,
    admin("Alex Morgan"),
    "users",
    "info",
    "Invited Taylor Brooks as Support",
    page("Team", "team"),
    undefined,
    "203.0.113.10"
  ),
  event(
    3 * D + 2 * H,
    user("Oliver Brandt"),
    "billing",
    "info",
    "Canceled the Sable Fintech subscription",
    org("org_sable", "Sable Fintech", "/billing"),
    "org_sable",
    "198.51.100.17"
  ),
  event(
    4 * D,
    SYSTEM,
    "billing",
    "info",
    "Renewed Northwind Labs on Business (yearly)",
    org("org_northwind", "Northwind Labs", "/billing"),
    "org_northwind"
  ),
  event(
    5 * D,
    admin("Jordan Lee"),
    "organizations",
    "info",
    "Updated the billing email for Cascade Games",
    org("org_cascade", "Cascade Games"),
    "org_cascade",
    "203.0.113.31"
  ),
  event(
    6 * D,
    user("Kai Nakamura"),
    "organizations",
    "info",
    "Renamed Pixel Forge Labs to PixelForge",
    org("org_pixelforge", "PixelForge"),
    "org_pixelforge",
    "198.51.100.63"
  ),
  event(
    7 * D,
    SYSTEM,
    "infrastructure",
    "info",
    "Scheduled maintenance finished on us-east-a2",
    page("Hosts", "hosts")
  ),
  event(
    9 * D,
    admin("Riya Kapoor"),
    "settings",
    "info",
    "Changed the trial length from 7 to 14 days",
    page("Settings", "settings"),
    undefined,
    "203.0.113.22"
  ),
  event(
    12 * D,
    user("Hannah Lee"),
    "users",
    "warning",
    "Suspended Leah Park in Lumen Health",
    person("usr_leah", "Leah Park"),
    "org_lumen",
    "198.51.100.120"
  ),
  event(
    15 * D,
    SYSTEM,
    "auth",
    "critical",
    "Blocked repeated sign-in attempts from 45.33.12.8",
    undefined,
    undefined,
    "45.33.12.8"
  ),
  event(
    20 * D,
    admin("Alex Morgan"),
    "billing",
    "info",
    `Set custom pricing for ${MERIDIAN}`,
    org("org_meridian", MERIDIAN, "/billing"),
    "org_meridian",
    "203.0.113.10"
  ),
  event(
    28 * D,
    user("Tomás Novak"),
    "organizations",
    "info",
    "Upgraded Cascade Games from Free to Starter",
    org("org_cascade", "Cascade Games"),
    "org_cascade",
    "198.51.100.33"
  ),
];
