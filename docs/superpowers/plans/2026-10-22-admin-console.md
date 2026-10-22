# Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static, professional admin area under `/admin` — organizations with routed detail
tabs, users, plans, subscriptions, billing, fleet, hosts, audit log, team, settings, profile —
sharing one shell with the user console but never its menu or routes.

**Architecture:** The existing chrome becomes `AppShell`, which takes a serializable
`ShellConfig` (menu with icon *elements*, notifications, capacity, signed-in person) from each
area's server layout, so admin data never ships in the console bundle. Admin pages follow the
repo pattern: thin `src/app/admin/**/page.tsx` + content in `components/pages/admin/<area>/`.
Sample data lives with its owning page; every count, usage figure and MRR is *derived* by
selectors so numbers always agree. Role rules are pure functions in `lib/auth/roles.ts`.

**Tech Stack:** Next.js 16.4 (App Router, Cache Components, Turbopack), React 19.3, TypeScript,
Tailwind v4 + theme tokens, shadcn/ui (Radix), TanStack Table v8 via `components/custom/data-table`,
Recharts via shadcn `chart`, Sonner, lucide-react 1.59, Node 24 built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-22-admin-console-design.md`

## Global Constraints

- Colours only from tokens in `src/app/globals.css`; no hex, `bg-white`, `black`/`white` palette classes in components.
- Never call `Date.now()` / `new Date()` during render; sample dates come from `SAMPLE_NOW` helpers in `lib/sample-time.ts`.
- Static data in `constants/` files marked `TODO(api)` (or `TODO(auth)` for session-dependent values); actions show a Sonner toast.
- Money stored as integer cents, shown with `formatCurrency` / `formatPrice` (USD); a `null` price means "Custom".
- `src/app/**/page.tsx` stays thin: `metadata` + `<Area />`. Dynamic segments use `generateStaticParams` and `notFound()` for unknown ids.
- Icons cross the server→client boundary only as elements (`<Users />`), never as components.
- Add a dependency only in the task that first imports it; prefer shadcn primitives already in `components/ui/`.
- Before writing any chart code, load the `dataviz` skill (Tasks 5, 7, 11).
- Done = `npm run lint`, `npx prettier --check src scripts docs`, `npm run typecheck`, `npm test`, `npm run build` all pass. (`README.md` has a pre-existing encoding problem; leave it out of the format check.)
- Do not commit or push unless the user asks (CLAUDE.md). Work stays on the current branch.
- Visual check command (Playwright's headless shell, no window-size floor): `"$HS/chrome-headless-shell.exe" --no-sandbox --disable-gpu --hide-scrollbars --blink-settings=preferredColorScheme=1 --window-size=W,H --virtual-time-budget=6000 --screenshot=OUT.png URL` with `HS=$(ls -d ~/AppData/Local/ms-playwright/chromium_headless_shell-1243/*/)`, against `npm run start` on port 3000. Check 1440×900 and 390×844; `preferredColorScheme=0` for dark.

## Review Focus

1. **Long names** (organization "Meridian Interactive Entertainment Group", long emails) in tables, page headers, breadcrumbs and mobile cards → truncate with a `title`, nothing overflows at 390 px. *Pinned in Task 6 and Task 7 visual steps.*
2. **Usage at or over the plan limit** (Helix Mobile runs 11 on a 10-emulator plan after a downgrade) → meter full and red, text reads "11 / 10" with "Over limit", bar never wider than its track. *Pinned in Task 4 (`UsageMeter` clamp) and Task 7 smoke row.*
3. **Enterprise custom price** (`priceMonthly: null`) → "Custom" wherever a price shows; MRR uses the subscription's `customAmount`; never "$NaN" or "$0". *Pinned in Task 1 `formatPrice` test and Task 10 smoke row.*
4. **Empty collections** (Quartz Studio: trialing, no emulators, no invoices, only invited members; filters with no matches) → `EmptyState`, not a blank table. *Pinned in Task 8 smoke row and Task 6 filter step.*
5. **Unknown ids** (`/admin/organizations/nope`, `/admin/organizations/nope/users`, `/admin/users/nope`) → the 404 page, not a crash. *Pinned in Task 7 and Task 9 smoke rows.*

---

### Task 1: Role rules, price formatting, test runner, login routing

**Files:**
- Create: `src/lib/auth/roles.ts`, `src/lib/auth/roles.test.mjs`, `src/lib/format.test.mjs`
- Modify: `src/lib/format.ts`, `src/lib/sample-time.ts`, `src/components/pages/login/components/LoginForm.tsx`, `package.json` (script `"test": "node --test \"src/**/*.test.mjs\""`)

**Interfaces:**
- Produces (`roles.ts`, no imports so Node can run it directly):
  ```ts
  export type Role = "user" | "admin";
  export type Area = "public" | "console" | "admin";
  export const LOGIN_PATH = "/login";
  export const ROLE_HOME: Record<Role, string>; // { user: "/dashboard", admin: "/admin/dashboard" }
  export function areaOf(pathname: string): Area;
  export function resolveAccess(role: Role | null, pathname: string): { allow: true } | { redirect: string };
  export function safeNext(role: Role, next: string | null): string;
  export function demoRoleFor(identifier: string): Role; // TODO(auth)
  ```
- Produces (`format.ts`): `export const CURRENCY = "USD"`, `formatCurrency(cents: number, options?: { compact?: boolean }): string`, `formatPrice(cents: number | null): string`, `formatDate(iso: string): string` (UTC, "Oct 19, 2026").
- Produces (`sample-time.ts`): `daysAgo(days: number): string`, `daysFromNow(days: number): string` (ISO, relative to `SAMPLE_NOW`).

- [ ] **Step 1: Write the failing tests**

`src/lib/auth/roles.test.mjs` (`node:test` + `node:assert/strict`, imports `./roles.ts`):
```js
test("areaOf", () => {
  assert.equal(areaOf("/login"), "public");
  assert.equal(areaOf("/admin"), "admin");
  assert.equal(areaOf("/admin/"), "admin");
  assert.equal(areaOf("/admin/organizations/org_northwind/users"), "admin");
  assert.equal(areaOf("/administrator"), "console"); // prefix boundary
  assert.equal(areaOf("/dashboard"), "console");
});
test("resolveAccess", () => {
  assert.deepEqual(resolveAccess(null, "/dashboard"), { redirect: "/login?next=%2Fdashboard" });
  assert.deepEqual(resolveAccess(null, "/login"), { allow: true });
  assert.deepEqual(resolveAccess("user", "/admin/dashboard"), { redirect: "/dashboard" });
  assert.deepEqual(resolveAccess("admin", "/emulators"), { redirect: "/admin/dashboard" });
  assert.deepEqual(resolveAccess("admin", "/admin/plans"), { allow: true });
  assert.deepEqual(resolveAccess("user", "/login"), { redirect: "/dashboard" });
});
test("safeNext", () => {
  assert.equal(safeNext("admin", "/admin/users"), "/admin/users");
  assert.equal(safeNext("user", "/admin/users"), "/dashboard");
  assert.equal(safeNext("user", "https://evil.example"), "/dashboard");
  assert.equal(safeNext("user", "//evil.example"), "/dashboard");
  assert.equal(safeNext("user", null), "/dashboard");
});
test("demoRoleFor", () => {
  assert.equal(demoRoleFor("Admin@corp.com"), "admin");
  assert.equal(demoRoleFor("ops@corp.com"), "user");
});
```
`src/lib/format.test.mjs` (imports `./format.ts`):
```js
assert.equal(formatCurrency(0), "$0");
assert.equal(formatCurrency(4900), "$49");
assert.equal(formatCurrency(4950), "$49.50");
assert.equal(formatCurrency(1290000), "$12,900");
assert.equal(formatCurrency(1290000, { compact: true }), "$12.9K");
assert.equal(formatPrice(null), "Custom");
assert.equal(formatPrice(1900), "$19");
assert.equal(formatDate("2026-10-19T09:00:00.000Z"), "Oct 19, 2026");
```

- [ ] **Step 2: Run to verify they fail** — `npm test` → FAIL (`roles.ts` missing, `formatCurrency` not exported).

- [ ] **Step 3: Implement** `roles.ts`, the `format.ts` additions (`Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY })`, 0 fraction digits when `cents % 100 === 0`, compact notation with 1 fraction digit) and the `sample-time.ts` helpers. `areaOf` matches `/admin` only as a whole first segment.

- [ ] **Step 4: Login routing** — in `LoginForm.onSubmit`, replace the `/dashboard` push with
  `safeNext(demoRoleFor(identifier), new URLSearchParams(window.location.search).get("next"))`
  (read `location` at submit time — `useSearchParams` would need a Suspense boundary). Update the
  `TODO(auth)` comment to name the demo rule.

- [ ] **Step 5: Verify** — `npm test` → all PASS; `npm run typecheck` and `npm run lint` clean
  (if tsc rejects the `.mjs` tests, they are outside `include` — confirm, don't add them).

---

### Task 2: AppShell with per-area config, admin layout, route smoke script

**Files:**
- Create: `src/components/common/AppShell.tsx` (replaces `AppLayout.tsx` — delete it), `src/lib/shell/console.shell.tsx`, `src/lib/shell/admin.shell.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/dashboard/page.tsx` (temporary `PageHeader` only; Task 5 fills it), `scripts/check-routes.mjs`
- Modify: `src/types/nav.types.ts`, `src/components/common/AppSidebar.tsx`, `AppNavbar.tsx`, `AppBreadcrumb.tsx`, `src/app/(console)/layout.tsx`, `src/lib/constants.ts` (move shell data out; update any importers found by `grep -rn "lib/constants" src`), `next.config.ts` (add `{ source: "/admin", destination: "/admin/dashboard", permanent: false }`), `package.json` (`"check:routes": "node scripts/check-routes.mjs"`), `CLAUDE.md` (shell/area convention, `npm test`, `check:routes`)

**Interfaces:**
- Produces (`nav.types.ts`):
  ```ts
  export interface NavItem { title: string; href: string; icon: React.ReactNode; badge?: string }
  export interface NavGroup { label: string; items: NavItem[] }
  export interface ShellNotification { id: string; title: string; time: string; unread: boolean }
  export interface ShellConfig {
    homeHref: string; tagline: string; badge?: string; breadcrumbRoot?: string;
    nav: NavGroup[];
    search: { label: string; placeholder: string };
    notifications: ShellNotification[];
    capacity: { label: string; used: number; total: number };
    user: { name: string; email: string; initials: string; role: string };
    profileHref: string; settingsHref: string;
    /** id → display name for dynamic segments, used by breadcrumbs. */
    entityNames?: Record<string, string>;
  }
  ```
- Produces: `CONSOLE_SHELL: ShellConfig`, `ADMIN_SHELL: ShellConfig` (built after Task 3 exists — in this task `ADMIN_SHELL` uses literal placeholder counts and Task 3 replaces them with selectors), `AppShell({ config, children })`, `AppBreadcrumb({ nav, root, entityNames })`.
- Produces (`scripts/check-routes.mjs`): `ROUTES: [path: string, status: number, text?: string][]`; fetches each from `process.argv[2] ?? "http://localhost:3000"` with `redirect: "manual"`, prints `PASS/FAIL path`, exits 1 on any failure. Later tasks append rows.

- [ ] **Step 1: Write the smoke rows** (they fail until the shell exists):
  ```js
  ["/dashboard", 200, "Dashboard"], ["/login", 200, "Welcome back"],
  ["/admin", 307], ["/admin/dashboard", 200, "Admin console"],
  ```
- [ ] **Step 2: Run to verify it fails** — `npm run build && npm run start` (background), `npm run check:routes` → FAIL on `/admin` rows.
- [ ] **Step 3: Implement the shell.** `AppSidebar` renders `{item.icon}`, the `badge` pill beside the product name, `tagline`, capacity from `config.capacity`, the user block and menu (Profile → `profileHref`, Settings → `settingsHref`, Sign out → `/login`). `AppNavbar` takes `search` and `notifications`. `AppBreadcrumb` finds the deepest nav item whose `href` prefixes the path, then labels each remaining segment with `entityNames[segment] ?? SEGMENT_LABELS[segment] ?? segment` (`SEGMENT_LABELS = { users: "Users", emulators: "Emulators", billing: "Billing", activity: "Activity" }`), linking all but the last; `root` prepends "Admin". Long labels truncate (`max-w-[16ch] truncate` + `title`).
- [ ] **Step 4: Config.** `CONSOLE_SHELL` = today's menu, notifications and host capacity, with the user changed to Priya Sharma · `priya@northwind.dev` · "Member · Northwind Labs" (`TODO(auth)`). `ADMIN_SHELL` = tagline "Admin console", `badge: "Admin"`, `breadcrumbRoot: "Admin"`, menu groups exactly as the spec (Overview · Customers · Revenue · Infrastructure · Administration) with lucide icons `LayoutDashboard, Building2, Users, Layers, Repeat, Receipt, Smartphone, Server, ScrollText, ShieldCheck, Settings`, search "Search organizations, users…", user Alex Morgan · `admin@example.com` · "Owner", `profileHref: "/admin/profile"`, `settingsHref: "/admin/settings"`.
- [ ] **Step 5: Layouts.** `(console)/layout.tsx` → `<AppShell config={CONSOLE_SHELL}>`; `admin/layout.tsx` → `<AppShell config={ADMIN_SHELL}>` with a `// TODO(auth): requireRole("admin")` line.
- [ ] **Step 6: Verify** — rebuild, restart, `npm run check:routes` → all PASS; screenshot `/dashboard` and `/admin/dashboard` at 1440×900: console looks unchanged except the user block; admin shows the Admin badge and its menu.

---

### Task 3: Admin types, sample data and selectors

**Files:**
- Create: `src/types/admin.types.ts`, `src/types/badge.types.ts` (`export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info"`); constants (`TODO(api)`) under `src/components/pages/admin/<area>/constants/`: `plans/constants/plan.constants.ts`, `organizations/constants/organization.constants.ts`, `users/constants/member.constants.ts`, `subscriptions/constants/subscription.constants.ts`, `billing/constants/invoice.constants.ts`, `emulators/constants/fleet.constants.ts`, `hosts/constants/host.constants.ts`, `audit-log/constants/audit.constants.ts`, `team/constants/team.constants.ts`; status maps `src/components/pages/admin/constants/status.constants.ts`; selectors `src/components/pages/admin/utils/admin.selectors.ts`
- Modify: `src/lib/shell/admin.shell.tsx` (real counts, capacity, notifications, `entityNames`); `src/types/profile.types.ts` (`UserRole` removed, `role: OrgRole`) and `src/components/pages/profile/constants/profile.constants.ts` (Priya Sharma, role `"member"`), plus whatever renders the role label

**Interfaces:**
- Produces (`admin.types.ts`):
  ```ts
  export type PlanId = "free" | "starter" | "team" | "business" | "enterprise";
  export interface Plan { id: PlanId; name: string; description: string; priceMonthly: number | null; concurrentEmulators: number; status: "active" | "archived"; visible: boolean }
  export type BillingCycle = "monthly" | "yearly";
  export interface Organization { id: string; name: string; slug: string; ownerId: string; billingEmail: string; country: string; createdAt: string; suspended: boolean; paymentMethod: { brand: "Visa" | "Mastercard" | "Amex"; last4: string } | null }
  export type OrgStatus = "active" | "trialing" | "past_due" | "suspended";
  export type OrgRole = "owner" | "admin" | "member";
  export type MemberStatus = "active" | "invited" | "suspended";
  export interface Member { id: string; orgId: string; name: string; email: string; orgRole: OrgRole; status: MemberStatus; twoFactor: boolean; hoursThisMonth: number; sessionsThisMonth: number; lastActiveAt: string | null; joinedAt: string }
  export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";
  export interface Subscription { id: string; orgId: string; planId: PlanId; status: SubscriptionStatus; billingCycle: BillingCycle; customAmount: number | null; startedAt: string; renewsAt: string | null; trialEndsAt: string | null; cancelAtPeriodEnd: boolean }
  export type InvoiceStatus = "paid" | "open" | "failed" | "refunded" | "void";
  export interface Invoice { id: string; number: string; orgId: string; amount: number; status: InvoiceStatus; issuedAt: string; dueAt: string; paidAt: string | null }
  export interface FleetEmulator extends Emulator { orgId: string; ownerId: string; hostId: string }
  export type HostStatus = "healthy" | "degraded" | "offline" | "maintenance";
  export interface Host { id: string; name: string; ip: string; region: string; status: HostStatus; cpu: number; memory: number; storage: number; slotsTotal: number; uptimeHours: number; lastHeartbeatAt: string }
  export type AuditCategory = "auth" | "billing" | "organizations" | "users" | "infrastructure" | "settings";
  export interface AuditEvent { id: string; at: string; actor: { kind: "admin" | "user" | "system"; name: string }; category: AuditCategory; severity: "info" | "warning" | "critical"; action: string; target?: { label: string; href: string }; orgId?: string; ip: string | null }
  export type AdminAccess = "owner" | "admin" | "support";
  export interface AdminMember { id: string; name: string; email: string; access: AdminAccess; status: "active" | "invited"; twoFactor: boolean; lastActiveAt: string | null }
  ```
- Produces (`status.constants.ts`, importing `BadgeTone` from `@/types/badge.types`): `ORG_STATUS`, `SUBSCRIPTION_STATUS`, `INVOICE_STATUS`, `MEMBER_STATUS`, `HOST_STATUS`, `ORG_ROLE`, `ADMIN_ACCESS`: `Record<…, { label: string; tone: BadgeTone }>`.
- Produces (`admin.selectors.ts`), all pure over the constants:
  ```ts
  getPlan(id: PlanId): Plan
  getOrganization(id: string): Organization | undefined
  getMember(id: string): Member | undefined
  subscriptionFor(orgId: string): Subscription
  organizationStatus(org: Organization): OrgStatus      // suspended flag wins; canceled → "suspended"
  cycleAmount(sub: Subscription): number | null          // customAmount ?? price × (yearly ? 10 : 1)
  monthlyRevenue(sub: Subscription): number              // active|past_due only; yearly ÷ 12; else 0
  totalMrr(): number
  organizationUsage(orgId: string): { inUse: number; limit: number }   // fleet emulators running|booting
  memberEmulatorsRunning(memberId: string): number
  membersOf(orgId: string): Member[]
  emulatorsOf(orgId: string): FleetEmulator[]
  invoicesOf(orgId: string): Invoice[]
  auditFor(orgId: string): AuditEvent[]
  planSubscribers(planId: PlanId): number                // subscriptions not canceled
  hostSlotsUsed(hostId: string): number
  fleetCapacity(): { used: number; total: number }       // hosts not offline
  usageHistory(orgId: string, days?: number): { day: string; inUse: number }[] // deterministic, seeded by id; last point = organizationUsage().inUse
  needsAttention(): { id: string; kind: "past_due" | "failed_payment" | "host" | "at_limit"; title: string; href: string }[]
  ```

- [ ] **Step 1: Sample data.** Plans: Free 0 / 1 emulator, Starter 1900 / 3, Team 4900 / 10, Business 12900 / 25, Enterprise `null` / 50. 12 organizations, ~60 members, 40 fleet emulators, 6 hosts, ~30 invoices, ~40 audit events, 4 admins. Must include: **Northwind Labs** (`org_northwind`, Business, active, Priya Sharma `usr_priya` as member); **Quartz Studio** (`org_quartz`, trialing, 0 emulators, 0 invoices, only invited members); **Helix Mobile** (`org_helix`, Team plan, 11 emulators running, past due, one failed invoice); **Meridian Interactive Entertainment Group** (`org_meridian`, Enterprise, `customAmount: 249000`); one suspended org; one host `degraded` and one `offline`; admins Alex Morgan (owner, `admin@example.com`), plus an admin, a support and one invited. Every audit `target.href` is a real route.
- [ ] **Step 2: Implement selectors and status maps** as above; `usageHistory` uses a small string-hash PRNG so output is identical on server and client.
- [ ] **Step 3: Wire `ADMIN_SHELL`** — Organizations badge = organization count, capacity = `fleetCapacity()`, notifications = first 3 of `needsAttention()`, `entityNames` = organization and member ids → names.
- [ ] **Step 4: Verify** — `npm run typecheck`, `npm run lint` clean; `npm run build` passes; `/admin/dashboard` sidebar shows the real Organizations count and fleet capacity.

---

### Task 4: Shared building blocks

**Files:**
- Create in `src/components/custom/`: `StatCard.tsx` (moved from `pages/dashboard/components/`, generalized), `UsageMeter.tsx`, `ToneBadge.tsx`, `PlanBadge.tsx`, `EntityAvatar.tsx`, `RoutedTabs.tsx`, `DetailList.tsx`, `EmptyState.tsx`, `ChartCard.tsx`, `SearchField.tsx`, `FilterChips.tsx`, `RowActions.tsx`, `ColumnHeader.tsx` (moved from `pages/emulators/components/`)
- Modify: `src/components/pages/dashboard/Dashboard.tsx` (new StatCard import), `src/components/pages/emulators/components/EmulatorsToolbar.tsx` (use `SearchField` + `FilterChips`), `EmulatorsColumns.tsx` and `EmulatorRowActions.tsx` (new `ColumnHeader` path; `RowActions` if it fits without behaviour change)

**Interfaces:**
- Produces:
  ```ts
  StatCard({ label, value, hint?, icon?, tone?, trend?, className? }: {
    label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode;
    tone?: StatTone; trend?: { percent: number; label?: string; invert?: boolean }; className?: string })
  UsageMeter({ used, limit, label?, size?, className? }: { used: number; limit: number; label?: string; size?: "sm" | "md"; className?: string })
  ToneBadge({ tone, label, pulse?, className? }: { tone: BadgeTone; label: string; pulse?: boolean; className?: string })
  PlanBadge({ plan }: { plan: Plan })
  EntityAvatar({ name, kind?, size? }: { name: string; kind?: "org" | "person"; size?: "sm" | "md" | "lg" })
  RoutedTabs({ tabs, label }: { tabs: { href: string; label: string; count?: number; exact?: boolean }[]; label: string })  // client
  DetailList({ items, columns? }: { items: { label: string; value: React.ReactNode; mono?: boolean }[]; columns?: 1 | 2 })
  EmptyState({ icon, title, description?, action? }: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode })
  ChartCard({ title, description?, action?, children, className? })
  SearchField({ value, onChange, label, placeholder })                       // client
  FilterChips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number; dotClassName?: string }[]; label: string })  // client
  RowActions({ label, actions }: { label: string; actions: { label: string; icon?: React.ReactNode; onSelect: () => void; destructive?: boolean; separatorBefore?: boolean }[] })  // client
  ```
- Behaviour pinned: `UsageMeter` is `role="meter"` with `aria-valuenow/min/max`, text "`used` / `limit`", bar width `min(used/limit, 1)`, primary below 80 %, booting tone 80–99 %, offline tone at ≥ 100 % plus the words "Over limit" when `used > limit`. `ToneBadge` maps success/warning/danger/neutral → the four `status-*` soft/foreground token pairs, info → `accent`. `EntityAvatar` picks one of five token colour pairs by a hash of `name`. `RoutedTabs` renders `<nav aria-label={label}>` links with `aria-current="page"`, active by exact match or prefix, horizontally scrollable below `md`. `StatCard` trend chip: ▲/▼ with `percent`, success tone when positive (danger when `invert`).

- [ ] **Step 1: Implement** the components above; move `StatCard` and `ColumnHeader`, update imports.
- [ ] **Step 2: Verify** — typecheck, lint, build; screenshot `/dashboard` and `/emulators` at 1440×900 and 390×844: identical to before (the move is behaviour-neutral).

---

### Task 5: Admin dashboard

**Files:** Create `src/components/pages/admin/dashboard/AdminDashboard.tsx` + `components/` (`MrrChart.tsx`, `NewOrganizationsChart.tsx`, `PlanMix.tsx`, `RecentOrganizations.tsx`, `NeedsAttention.tsx`, `RecentActivity.tsx`) + `constants/dashboard.constants.ts` (`MRR_GROWTH: number[]`, 12 multipliers ending in `1`); modify `src/app/admin/dashboard/page.tsx` (metadata title "Dashboard").

**Interfaces:** Consumes `totalMrr`, `organizationStatus`, `subscriptionFor`, `planSubscribers`, `fleetCapacity`, `needsAttention`, audit constants (Task 3); `StatCard`, `ChartCard`, `ToneBadge`, `PlanBadge`, `EntityAvatar`, `UsageMeter` (Task 4).

- [ ] **Step 1: Smoke rows** — `["/admin/dashboard", 200, "Needs attention"]`, `["/admin/dashboard", 200, "Monthly recurring revenue"]`; run → FAIL.
- [ ] **Step 2: Load `dataviz`, then implement.** KPI row: Active organizations, MRR (`formatCurrency`, trend vs `MRR_GROWTH[10]`), Active subscriptions (hint: trialing count), Emulators running (`fleetCapacity`). Charts: MRR trend (`MRR_GROWTH.map(m => Math.round(totalMrr() * m))`, month labels from `SAMPLE_NOW`), new organizations per month (bucketed from `createdAt`), plan mix. Lists: 5 most recent organizations, `needsAttention()` with links, latest 6 audit events. Header actions: Export report, New organization (toasts).
- [ ] **Step 3: Verify** — build, `check:routes` PASS; screenshots light/dark 1440 and 390: chart last MRR point equals the KPI value.

---

### Task 6: Organizations list

**Files:** Create `src/app/admin/organizations/page.tsx`, `src/components/pages/admin/organizations/Organizations.tsx`, `OrganizationsColumns.tsx`, `components/OrganizationsToolbar.tsx`, `utils/organization.utils.ts` (`type OrgRow`, `toOrgRows(): OrgRow[]`, `filterOrganizations(rows, query, status, planId)`).

**Interfaces:** Produces `OrgRow = { org: Organization; status: OrgStatus; plan: Plan; members: number; usage: { inUse: number; limit: number }; mrr: number }`. Consumes selectors (Task 3), `DataTable`, `ColumnHeader`, `SearchField`, `FilterChips`, `RowActions`, `UsageMeter`, `PlanBadge`, `ToneBadge`, `EntityAvatar`, `EmptyState` (Task 4).

- [ ] **Step 1: Smoke rows** — `["/admin/organizations", 200, "Northwind Labs"]`, `["/admin/organizations", 200, "Meridian Interactive Entertainment Group"]`; run → FAIL.
- [ ] **Step 2: Implement.** Columns: Organization (avatar, name truncated with `title`, id mono; links to detail), Plan, Members, Emulators in use (`UsageMeter size="sm"`), MRR, Status, Created; row actions View / Change plan / Suspend (toasts except View). Status chips All · Active · Trialing · Past due · Suspended with counts; plan `Select`; search over name, slug, billing email. No matches → `EmptyState` "No organizations match" with Clear filters. `meta.label` on every column for mobile cards.
- [ ] **Step 3: Verify** — `check:routes` PASS; screenshot 1440 and **390**: the Meridian row/card truncates without horizontal scroll; filter "Suspended" + search "zzz" shows the empty state.

---

### Task 7: Organization detail — layout, Overview, Users

**Files:** Create `src/app/admin/organizations/[orgId]/layout.tsx` (`generateStaticParams` from organizations; `notFound()` for unknown), `[orgId]/page.tsx` (Overview), `[orgId]/users/page.tsx`; `src/components/pages/admin/organizations/detail/OrganizationHeader.tsx`, `OrganizationTabs.tsx`, `overview/OrganizationOverview.tsx` (+ `UsageChart.tsx`, `CurrentPlanCard.tsx`), `users/OrganizationUsers.tsx` + `OrganizationUsersColumns.tsx`.

**Interfaces:** Consumes Task 3 selectors (`getOrganization`, `subscriptionFor`, `organizationUsage`, `usageHistory`, `membersOf`, `memberEmulatorsRunning`, `auditFor`) and Task 4 blocks. Tab hrefs: `/admin/organizations/${id}` (exact, "Overview"), `/users`, `/emulators`, `/billing`, `/activity`, with counts for Users, Emulators, Billing (invoices).

- [ ] **Step 1: Smoke rows** — `["/admin/organizations/org_northwind", 200, "Current plan"]`, `["/admin/organizations/org_northwind/users", 200, "Priya Sharma"]`, `["/admin/organizations/org_helix", 200, "Over limit"]`, `["/admin/organizations/nope", 404]`, `["/admin/organizations/nope/users", 404]`; run → FAIL.
- [ ] **Step 2: Implement header + tabs** (name truncates; status, plan, owner, created; actions Change plan / Suspend / more menu — toasts).
- [ ] **Step 3: Load `dataviz`, then Overview** — tiles (emulators in use meter, members active/invited, MRR, next renewal), current-plan card, `DetailList` (id, slug, owner, billing email, country, payment method or "None on file", created), 14-day usage chart with the plan limit as a reference line, 5 latest activity items.
- [ ] **Step 4: Users tab** — summary strip (members, active now = members with ≥1 running emulator, invited, suspended); table: person (avatar, name, email), role, status, emulators running now, hours this month, last active ("Never" when `null`), 2FA; actions View (→ `/admin/users/[id]`), Change role, Suspend, Remove.
- [ ] **Step 5: Verify** — build lists the org routes as prerendered; `check:routes` PASS; screenshot Meridian and Helix overview at 390 and 1440.

---

### Task 8: Organization detail — Emulators, Billing, Activity

**Files:** Create `[orgId]/emulators/page.tsx`, `[orgId]/billing/page.tsx`, `[orgId]/activity/page.tsx`; `src/components/pages/admin/organizations/detail/emulators/OrganizationEmulators.tsx`, `billing/OrganizationBilling.tsx`, `activity/OrganizationActivity.tsx`; `src/components/pages/admin/shared/InvoicesTable.tsx`, `FleetEmulatorsTable.tsx`, `AuditTimeline.tsx` (reused by Tasks 11–13).

**Interfaces:** Produces `InvoicesTable({ invoices, showOrganization? })`, `FleetEmulatorsTable({ emulators, showOrganization?, toolbar? })`, `AuditTimeline({ events, emptyTitle })`. Consumes `emulatorsOf`, `invoicesOf`, `auditFor`, `subscriptionFor`, `cycleAmount`.

- [ ] **Step 1: Smoke rows** — `["/admin/organizations/org_northwind/emulators", 200, "Android"]`, `["/admin/organizations/org_quartz/emulators", 200, "No emulators yet"]`, `["/admin/organizations/org_quartz/billing", 200, "No invoices yet"]`, `["/admin/organizations/org_helix/billing", 200, "Failed"]`, `["/admin/organizations/org_northwind/activity", 200, "Northwind"]`; run → FAIL.
- [ ] **Step 2: Implement** the three tabs with the shared tables; Billing shows a subscription summary (plan, cycle, amount via `formatPrice(cycleAmount(sub))`, renews/trial ends, payment method) above `InvoicesTable`.
- [ ] **Step 3: Verify** — `check:routes` PASS; screenshot Quartz emulators and billing at 390.

---

### Task 9: Users and user detail

**Files:** Create `src/app/admin/users/page.tsx`, `src/app/admin/users/[userId]/page.tsx` (`generateStaticParams`, `notFound()`); `src/components/pages/admin/users/Users.tsx`, `UsersColumns.tsx`, `detail/UserDetail.tsx` (+ `UserHeader.tsx`, `UserAdminActions.tsx`), `constants/member-signins.constants.ts` (sign-ins for a few members; others show an empty state).

**Interfaces:** Consumes `getMember`, `getOrganization`, `memberEmulatorsRunning`, fleet constants, `MEMBER_STATUS`, `ORG_ROLE`; reuses `FleetEmulatorsTable` (Task 8) and the profile page's `SignInActivity` presentation (pass data in as a prop if it currently reads constants).

- [ ] **Step 1: Smoke rows** — `["/admin/users", 200, "Priya Sharma"]`, `["/admin/users/usr_priya", 200, "Northwind Labs"]`, `["/admin/users/nope", 404]`; run → FAIL.
- [ ] **Step 2: Implement** the global list (person, organization link, role, status, emulators running, last active, joined; status chips + search) and the detail page (header with organization link; tiles running / hours / sessions / last active; profile `DetailList`; their emulators; sign-in activity; admin actions card with Reset password, Sign out everywhere, Suspend, and a danger zone Delete — all toasts).
- [ ] **Step 3: Verify** — `check:routes` PASS; screenshot `/admin/users/usr_priya` at 390 and 1440.

---

### Task 10: Plans

**Files:** Create `src/app/admin/plans/page.tsx`, `src/components/pages/admin/plans/Plans.tsx`, `components/PlanCard.tsx`, `components/PlanSheet.tsx` (new / edit, `components/ui/sheet`).

**Interfaces:** Consumes `PLANS`, `planSubscribers`, `subscriptionFor`, `monthlyRevenue`, `formatPrice`.

- [ ] **Step 1: Smoke rows** — `["/admin/plans", 200, "Concurrent emulators"]`, `["/admin/plans", 200, "Custom"]`; run → FAIL.
- [ ] **Step 2: Implement** — Monthly / Yearly `ToggleGroup` (yearly shows ×10 and "2 months free"); card per plan: name, description, price (`formatPrice`), concurrent emulators as the headline number, organizations subscribed, MRR from plan, Active/Archived, Edit. Header action New plan. Sheet fields: name, monthly price (blank = custom), concurrent emulators, visible to new organizations; Save toasts and closes.
- [ ] **Step 3: Verify** — `check:routes` PASS; sum of "organizations subscribed" equals non-canceled subscriptions; screenshot 1440 and 390.

---

### Task 11: Subscriptions and Billing & invoices

**Files:** Create `src/app/admin/subscriptions/page.tsx`, `src/app/admin/billing/page.tsx`; `src/components/pages/admin/subscriptions/Subscriptions.tsx` + `SubscriptionsColumns.tsx`; `src/components/pages/admin/billing/Billing.tsx` + `components/RevenueChart.tsx`.

**Interfaces:** Consumes subscription and invoice constants, `cycleAmount`, `monthlyRevenue`, `totalMrr`, `SUBSCRIPTION_STATUS`, `INVOICE_STATUS`, `InvoicesTable` (Task 8).

- [ ] **Step 1: Smoke rows** — `["/admin/subscriptions", 200, "Past due"]`, `["/admin/billing", 200, "Outstanding"]`; run → FAIL.
- [ ] **Step 2: Implement Subscriptions** — strip: active, trialing, past due, cancelling at period end, MRR / ARR (ARR = MRR × 12); table: organization, plan, status, cycle, amount (`formatPrice(cycleAmount)`), started, renews/ends, payment method; actions Change plan, Extend trial (trialing only), Cancel at period end / Resume.
- [ ] **Step 3: Load `dataviz`, then Billing** — tiles: collected this month (paid invoices issued this month), outstanding (open), failed payments (count + sum), refunds; collected vs refunded per month (from invoices); `InvoicesTable showOrganization` with status chips; actions View, Download PDF, Retry charge (failed), Refund (paid), Void (open).
- [ ] **Step 4: Verify** — `check:routes` PASS; screenshots 1440 and 390, light and dark.

---

### Task 12: Fleet emulators and hosts

**Files:** Create `src/app/admin/emulators/page.tsx`, `src/app/admin/hosts/page.tsx`; `src/components/pages/admin/emulators/FleetEmulators.tsx`; `src/components/pages/admin/hosts/Hosts.tsx` + `components/HostCard.tsx`.

**Interfaces:** Consumes `FleetEmulatorsTable` (Task 8, `showOrganization`), host constants, `hostSlotsUsed`, `fleetCapacity`, `HOST_STATUS`, `UsageMeter`.

- [ ] **Step 1: Smoke rows** — `["/admin/emulators", 200, "Force stop"]` (row-actions label in markup — if menus render lazily, use the "Owner" column header instead), `["/admin/hosts", 200, "Degraded"]`; run → FAIL.
- [ ] **Step 2: Implement** — emulators: status chips with counts, search, organization and owner columns, actions Force stop / Restart / Open owner (→ `/admin/users/[id]`). Hosts: tiles (healthy hosts, total slots, slots in use); `HostCard` per host with status badge, IP (mono), region, CPU / memory / storage `UsageMeter`s (percent of 100), slots used / total, uptime, last heartbeat (relative); offline hosts dim their meters. Header action Add host.
- [ ] **Step 3: Verify** — `check:routes` PASS; sum of host slots used equals running + booting fleet emulators; screenshots 1440 and 390.

---

### Task 13: Audit log and team

**Files:** Create `src/app/admin/audit-log/page.tsx`, `src/app/admin/team/page.tsx`; `src/components/pages/admin/audit-log/AuditLog.tsx`; `src/components/pages/admin/team/Team.tsx`, `TeamColumns.tsx`, `components/InviteAdminSheet.tsx`, `components/AccessLevels.tsx`.

**Interfaces:** Consumes audit and team constants, `AuditTimeline` (Task 8), `ADMIN_ACCESS`.

- [ ] **Step 1: Smoke rows** — `["/admin/audit-log", 200, "Infrastructure"]`, `["/admin/team", 200, "Alex Morgan"]`; run → FAIL.
- [ ] **Step 2: Implement** — audit log: filters actor kind (All / Admins / Users / System), category chips, period select (24 h / 7 d / 30 d against `SAMPLE_NOW`), search; rows with severity icon + tone, actor, action sentence, target link, IP (mono), time; no matches → `EmptyState`. Team: table (name, email, access, 2FA, status, last active; actions Change access, Resend invite (invited), Remove), Invite admin sheet (email, access level), access-levels card: Owner (everything incl. billing settings and team), Admin (manage customers, plans, infrastructure), Support (read-only).
- [ ] **Step 3: Verify** — `check:routes` PASS; screenshots 1440 and 390.

---

### Task 14: Settings and profile

**Files:** Create `src/app/admin/settings/page.tsx`, `src/app/admin/profile/page.tsx`; `src/components/pages/admin/settings/AdminSettings.tsx` + `components/` (`GeneralSettings`, `OrganizationSettings`, `BillingSettings`, `SecuritySettings`, `EmulatorPolicy`, `AdminNotifications` — `Admin`-prefixed file names to avoid confusion with the console's), `src/components/pages/admin/profile/AdminProfile.tsx` + `constants/admin-profile.constants.ts`; modify `src/components/pages/profile/Profile.tsx` (accept `profile` and `signIns` props, console page passes its constants).

**Interfaces:** Consumes `SectionTabs`, the console `SettingsCard` pattern, `PLANS` (default-plan select), `CURRENCY`.

- [ ] **Step 1: Smoke rows** — `["/admin/settings", 200, "Maintenance mode"]`, `["/admin/profile", 200, "Alex Morgan"]`, `["/profile", 200, "Priya Sharma"]`; run → FAIL.
- [ ] **Step 2: Implement** the six settings sections exactly as the spec lists (maintenance mode switch reveals the banner-text field; payment provider shows "Not connected" with a disabled Connect button; currency shows USD read-only), each with Save → toast; and the admin profile via the parameterized `Profile`.
- [ ] **Step 3: Verify** — full suite: `npm test`, lint, prettier check, typecheck, build, `check:routes` (all rows from every task) PASS; screenshot every admin route once at 1440 (light) and the five busiest (dashboard, organizations, org overview, org users, billing) at 390 (light and dark); drive the login once with `admin@example.com` → lands on `/admin/dashboard`, and with `ops@example.com` → `/dashboard`.
