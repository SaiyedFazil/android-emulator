import { ORGANIZATION_DOMAINS } from "@/components/pages/admin/organizations/constants/organization.constants";
import { daysAgo, minutesAgo } from "@/lib/sample-time";
import type { Member, MemberStatus, OrgRole } from "@/types/admin.types";

type Row = [
  id: string,
  orgId: string,
  name: string,
  role: OrgRole,
  status: MemberStatus,
  twoFactor: boolean,
  hoursThisMonth: number,
  sessionsThisMonth: number,
  lastActiveMinutesAgo: number | null,
  joinedDaysAgo: number,
];

/** "Liam O'Brien" at orbitpay.com → liam.obrien@orbitpay.com */
function emailFor(name: string, orgId: string): string {
  const local = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z]/g, ""))
    .join(".");
  return `${local}@${ORGANIZATION_DOMAINS[orgId]}`;
}

// TODO(api): members come from the backend.
// prettier-ignore
const ROWS: Row[] = [
  ["usr_daniel", "org_northwind", "Daniel Okafor", "owner", "active", true, 64, 41, 9, 410],
  ["usr_priya", "org_northwind", "Priya Sharma", "member", "active", true, 52, 38, 2, 380],
  ["usr_ethan", "org_northwind", "Ethan Walker", "admin", "active", true, 47, 30, 1, 365],
  ["usr_mei", "org_northwind", "Mei Lin", "member", "active", false, 33, 22, 3, 300],
  ["usr_jonas", "org_northwind", "Jonas Berg", "member", "active", true, 29, 19, 1, 210],
  ["usr_aisha", "org_northwind", "Aisha Bello", "member", "active", false, 12, 9, 340, 180],
  ["usr_ravi", "org_northwind", "Ravi Menon", "member", "active", true, 8, 5, 1500, 120],
  ["usr_clara", "org_northwind", "Clara Ruiz", "member", "invited", false, 0, 0, null, 1],
  ["usr_noah", "org_northwind", "Noah Fischer", "member", "suspended", false, 3, 2, 4320, 90],

  ["usr_marco", "org_helix", "Marco Bianchi", "owner", "active", true, 71, 44, 1, 280],
  ["usr_giulia", "org_helix", "Giulia Romano", "admin", "active", true, 58, 36, 4, 270],
  ["usr_samir", "org_helix", "Samir Haddad", "member", "active", false, 49, 31, 1, 200],
  ["usr_yuki", "org_helix", "Yuki Tanaka", "member", "active", true, 41, 27, 8, 150],
  ["usr_omar", "org_helix", "Omar Farouk", "member", "active", false, 22, 15, 2, 120],
  ["usr_elena", "org_helix", "Elena Petrova", "member", "active", true, 37, 25, 5, 90],
  ["usr_felix", "org_helix", "Felix Wagner", "member", "invited", false, 0, 0, null, 2],

  ["usr_alexandria", "org_meridian", "Alexandria Konstantinopoulou", "owner", "active", true, 39, 26, 3, 520],
  ["usr_benedikt", "org_meridian", "Benedikt Hoffmann", "admin", "active", true, 44, 29, 6, 510],
  ["usr_chiara", "org_meridian", "Chiara Esposito", "member", "active", true, 31, 21, 9, 400],
  ["usr_dmitri", "org_meridian", "Dmitri Volkov", "member", "active", false, 28, 18, 2, 380],
  ["usr_esther", "org_meridian", "Esther Adeyemi", "member", "active", true, 24, 16, 1, 300],
  ["usr_farah", "org_meridian", "Farah Siddiqui", "member", "active", false, 19, 13, 14, 250],
  ["usr_gustavo", "org_meridian", "Gustavo Lima", "member", "active", true, 11, 8, 95, 200],
  ["usr_hiro", "org_meridian", "Hiro Sato", "member", "active", false, 6, 4, 2880, 150],
  ["usr_ines", "org_meridian", "Inès Laurent", "member", "invited", false, 0, 0, null, 3],
  ["usr_jasper", "org_meridian", "Jasper Cole", "member", "invited", false, 0, 0, null, 3],

  ["usr_sofia", "org_orbit", "Sofia Ramírez", "owner", "active", true, 36, 24, 4, 200],
  ["usr_liam", "org_orbit", "Liam O'Brien", "admin", "active", true, 30, 20, 10, 195],
  ["usr_nora", "org_orbit", "Nora Svensson", "member", "active", false, 21, 14, 6, 150],
  ["usr_pablo", "org_orbit", "Pablo Ortega", "member", "active", true, 18, 12, 1, 120],
  ["usr_quinn", "org_orbit", "Quinn Harper", "member", "active", false, 7, 5, 720, 90],
  ["usr_rosa", "org_orbit", "Rosa Delgado", "member", "invited", false, 0, 0, null, 4],

  ["usr_hannah", "org_lumen", "Hannah Lee", "owner", "active", true, 27, 18, 3, 150],
  ["usr_isaac", "org_lumen", "Isaac Cohen", "member", "active", false, 20, 14, 15, 140],
  ["usr_julia", "org_lumen", "Julia Becker", "member", "active", true, 16, 11, 22, 120],
  ["usr_kevin", "org_lumen", "Kevin Murphy", "member", "active", false, 4, 3, 4320, 100],
  ["usr_leah", "org_lumen", "Leah Park", "member", "suspended", false, 2, 1, 17280, 80],

  ["usr_tomas", "org_cascade", "Tomás Novak", "owner", "active", true, 34, 23, 2, 95],
  ["usr_ugo", "org_cascade", "Ugo Ferri", "member", "active", false, 26, 17, 5, 90],
  ["usr_vera", "org_cascade", "Vera Ivanova", "member", "active", true, 22, 15, 8, 85],
  ["usr_wes", "org_cascade", "Wes Carter", "member", "invited", false, 0, 0, null, 5],

  ["usr_kai", "org_pixelforge", "Kai Nakamura", "owner", "active", true, 18, 12, 4, 40],

  ["usr_lena", "org_quartz", "Lena Fischer", "owner", "active", true, 0, 0, 7200, 6],
  ["usr_mateo", "org_quartz", "Mateo Silva", "member", "invited", false, 0, 0, null, 5],
  ["usr_nina", "org_quartz", "Nina Kowalski", "member", "invited", false, 0, 0, null, 5],

  ["usr_grace", "org_atlas", "Grace Mensah", "owner", "active", true, 5, 4, 600, 130],
  ["usr_henrik", "org_atlas", "Henrik Larsen", "member", "active", false, 3, 2, 2880, 120],
  ["usr_ivy", "org_atlas", "Ivy Chen", "member", "active", false, 1, 1, 10080, 100],

  ["usr_lucas", "org_verde", "Lucas Moreau", "owner", "active", false, 9, 7, 1440, 240],
  ["usr_maya", "org_verde", "Maya Torres", "member", "active", false, 6, 4, 2880, 230],
  ["usr_niko", "org_verde", "Niko Kallio", "member", "active", false, 4, 3, 4320, 200],
  ["usr_owen", "org_verde", "Owen Price", "member", "active", false, 2, 1, 7200, 180],

  ["usr_amara", "org_kestrel", "Amara Singh", "owner", "active", true, 6, 5, 30, 4],
  ["usr_bruno", "org_kestrel", "Bruno Costa", "admin", "active", true, 4, 3, 60, 4],
  ["usr_cyrus", "org_kestrel", "Cyrus Rahimi", "member", "active", false, 2, 2, 180, 3],
  ["usr_dana", "org_kestrel", "Dana Whitfield", "member", "invited", false, 0, 0, null, 2],

  ["usr_oliver", "org_sable", "Oliver Brandt", "owner", "active", true, 0, 0, 43200, 300],
  ["usr_petra", "org_sable", "Petra Novak", "member", "active", false, 0, 0, 50400, 280],
];

export const MEMBERS: Member[] = ROWS.map(
  ([id, orgId, name, orgRole, status, twoFactor, hours, sessions, lastActive, joined]) => ({
    id,
    orgId,
    name,
    email: emailFor(name, orgId),
    orgRole,
    status,
    twoFactor,
    hoursThisMonth: hours,
    sessionsThisMonth: sessions,
    lastActiveAt: lastActive === null ? null : minutesAgo(lastActive),
    joinedAt: daysAgo(joined),
  })
);
