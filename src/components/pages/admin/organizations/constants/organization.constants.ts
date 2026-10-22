import { daysAgo } from "@/lib/sample-time";
import type { Organization } from "@/types/admin.types";

type Card = Organization["paymentMethod"];
type Row = [
  id: string,
  name: string,
  domain: string,
  ownerId: string,
  country: string,
  createdDaysAgo: number,
  suspended: boolean,
  card: Card,
];

const visa = (last4: string): Card => ({ brand: "Visa", last4 });
const mastercard = (last4: string): Card => ({ brand: "Mastercard", last4 });
const amex = (last4: string): Card => ({ brand: "Amex", last4 });

// TODO(api): organizations come from the backend.
// prettier-ignore
const ROWS: Row[] = [
  ["org_northwind", "Northwind Labs", "northwind.dev", "usr_daniel", "United States", 410, false, visa("4242")],
  ["org_quartz", "Quartz Studio", "quartz.studio", "usr_lena", "Germany", 6, false, null],
  ["org_helix", "Helix Mobile", "helixmobile.io", "usr_marco", "Italy", 280, false, mastercard("5100")],
  ["org_meridian", "Meridian Interactive Entertainment Group", "meridian-interactive-entertainment.com", "usr_alexandria", "United Kingdom", 520, false, amex("3005")],
  ["org_orbit", "Orbit Payments", "orbitpay.com", "usr_sofia", "Spain", 200, false, visa("1881")],
  ["org_lumen", "Lumen Health", "lumenhealth.org", "usr_hannah", "Canada", 150, false, visa("0077")],
  ["org_cascade", "Cascade Games", "cascadegames.gg", "usr_tomas", "Czechia", 95, false, mastercard("4444")],
  ["org_pixelforge", "PixelForge", "pixelforge.app", "usr_kai", "Japan", 40, false, null],
  ["org_atlas", "Atlas Logistics", "atlaslogistics.com", "usr_grace", "Ghana", 130, false, visa("7310")],
  ["org_verde", "Verde Retail", "verderetail.co", "usr_lucas", "France", 240, true, mastercard("9020")],
  ["org_kestrel", "Kestrel Aero", "kestrelaero.com", "usr_amara", "India", 4, false, visa("6612")],
  ["org_sable", "Sable Fintech", "sablefintech.com", "usr_oliver", "Germany", 300, false, null],
];

/** Each organization's email domain — members' addresses are built from it. */
export const ORGANIZATION_DOMAINS: Record<string, string> = Object.fromEntries(
  ROWS.map(([id, , domain]) => [id, domain])
);

export const ORGANIZATIONS: Organization[] = ROWS.map(
  ([id, name, domain, ownerId, country, createdDaysAgo, suspended, card]) => ({
    id,
    name,
    slug: id.replace(/^org_/, ""),
    ownerId,
    billingEmail: `billing@${domain}`,
    country,
    createdAt: daysAgo(createdDaysAgo),
    suspended,
    paymentMethod: card,
  })
);
