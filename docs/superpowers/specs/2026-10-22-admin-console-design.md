# Admin Console — Design

Date: 2026-10-22 · Status: draft for review

## Intent

The emulator console becomes a multi-customer product. Customers are **organizations**: each
holds one subscription, and its members run emulators within the plan's limit. Platform staff
(**admins**) need their own area, `/admin/*`, to manage those organizations, their members,
plans and subscriptions, billing, the emulator fleet and hosts, and platform settings.

This version, like the user console before it, is a **static front end**: sample data in
`constants/` files, actions that show a toast, no API and no authentication. It fixes the page
structure, the look and the data shapes so the backend and role-based auth can be added later
without restructuring.

## Goals

- A complete, professional admin area under `/admin`, visually part of the same product
  (Graphite & Teal), but clearly marked as the admin console.
- Organizations are the top-level customer object. Each organization has a detail page whose
  tabs are real routes (`/admin/organizations/[orgId]/users`, …).
- Admin and user areas never mix: separate layouts, menus and routes. The role rules are written
  once (`lib/auth/roles.ts`) so the future login and `proxy.ts` share them.
- Same quality bar as the user console: clean lint, format, typecheck and production build;
  every colour from theme tokens; works on phones.

## Non-goals (this version)

- No real authentication, sessions, payments, emails or persistence. Saves and actions toast.
- No `proxy.ts` yet — there is no session to read. It is designed below and built with auth.
- No changes to what normal users see beyond fixing the sample "current user" (see Shell).
  An organization-facing view (a customer managing their own team or billing) is later work.

## Anti-goals

- An admin area that looks like a stock admin template or like a different product.
- Admin and user code tangled together: shared building blocks are fine, shared menus and
  routes are not.
- Hard-coded colours, or numbers on screen that don't add up (a plan's subscriber count must
  match the organizations on that plan, usage must not exceed limits unless shown as over).

## Decided with the user

- **Organizations hold subscriptions**; users belong to one organization.
- **Plans limit concurrent emulators only** — tiers differ by how many emulators an
  organization can run at once, and by price.
- **Currency: USD**, kept in one constant.
- **Pages:** Dashboard, Organizations (with tabbed detail), Users, User detail, Plans,
  Subscriptions, Billing & invoices, Emulators (fleet), Hosts, Audit log, Team, Settings.
- **One sign-in page for both roles.** After sign-in, admins land on `/admin/dashboard` and
  users on `/dashboard`; neither can open the other's pages.

## Roles and route protection

Two platform roles: `user` and `admin`. (Inside an organization, members also have an
organization role — Owner, Admin, Member — which is about that organization, not about access
to `/admin`.)

**Rules** (`lib/auth/roles.ts`, pure functions, built now):

| Signed in as | Opens            | Result                         |
| ------------ | ---------------- | ------------------------------ |
| nobody       | any page but `/login` | redirect to `/login?next=…` |
| user         | `/admin/*`       | redirect to `/dashboard`       |
| admin        | console routes   | redirect to `/admin/dashboard` |
| anyone       | `/login`         | redirect to their home         |

`ROLE_HOME = { user: "/dashboard", admin: "/admin/dashboard" }`. `next` is honoured only when it
belongs to the signed-in role's area.

**Later, with auth** (documented here, not built now), following the Next 16 auth guides:

1. The sign-in Server Action verifies credentials and sets an encrypted, httpOnly session
   cookie holding only `{ userId, role, orgId }`, then redirects to `ROLE_HOME[role]`.
2. `src/proxy.ts` (Next 16's renamed middleware) reads that cookie only — no database — and
   applies the table above. This is the fast, optimistic check.
3. A Data Access Layer (`verifySession()`, `requireRole("admin")`) re-checks the role in the
   admin layout and in every Server Action / Route Handler, close to the data. Proxy alone is
   never the only guard.

**Now (static):** the login form routes by a demo rule — an identifier containing `admin` goes
to `/admin/dashboard`, anything else to `/dashboard` — so both areas are reachable through
sign-in. Marked `TODO(auth)`.

## Route map

```
/admin                                  → redirect to /admin/dashboard (next.config.ts)
/admin/dashboard
/admin/organizations
/admin/organizations/[orgId]            tab: Overview
/admin/organizations/[orgId]/users      tab: Users
/admin/organizations/[orgId]/emulators  tab: Emulators
/admin/organizations/[orgId]/billing    tab: Billing
/admin/organizations/[orgId]/activity   tab: Activity
/admin/users
/admin/users/[userId]
/admin/plans
/admin/subscriptions
/admin/billing
/admin/emulators
/admin/hosts
/admin/audit-log
/admin/team
/admin/settings
/admin/profile
```

Dynamic segments use `generateStaticParams` from the sample data, so every organization and
user page prerenders under Cache Components; an unknown id calls `notFound()`. The organization
layout renders the header and tab bar once; each tab is its own page.

## Shell (layout, sidebar, navbar)

The existing `AppLayout` / `AppSidebar` / `AppNavbar` / `AppBreadcrumb` read the user console's
menu and data straight from `lib/constants.ts`. They become one shell that takes an `area`
(`"console" | "admin"`) and looks up that area's config — menu groups, home link, search
placeholder, notifications, sidebar footer, signed-in person. A key rather than a config object
is passed because configs hold icon components, which can't cross from the Server Component
layout into the client sidebar.

- `src/app/(console)/layout.tsx` → `<AppShell area="console">`
- `src/app/admin/layout.tsx` → `<AppShell area="admin">` (later: `requireRole("admin")`)

**Admin identity:** same palette and layout, with an **Admin** badge beside the product name in
the sidebar, "Admin console" as the tagline, and "Admin" as the breadcrumb root. Navbar search
reads "Search organizations, users…". The sidebar footer shows fleet capacity (all hosts); the
user menu offers Profile, Settings, Sign out.

**Admin menu:**

- Overview — Dashboard
- Customers — Organizations (count badge), Users
- Revenue — Plans, Subscriptions, Billing
- Infrastructure — Emulators, Hosts
- Administration — Audit log, Team, Settings

Breadcrumbs follow nesting: Admin › Organizations › Northwind Labs › Users.

**Fix in the user console:** its sample current user stops being "Admin User / Administrator"
and becomes a regular member; `UserRole` (`Administrator | Operator | Viewer`) is replaced by the
platform role plus the organization role above.

## Shared building blocks (new or generalized, in `components/custom/`)

- **StatCard** — generalized from the dashboard's: label, icon, a value that can be money or a
  count, optional trend chip (▲ 12% vs last month) and hint. The user dashboard keeps working.
- **UsageMeter** — "used / limit" bar for concurrent emulators and host capacity; turns amber at
  80% and red at 100% (always with the numbers, never colour alone).
- **StatusBadge** — extended from emulator statuses to organization, subscription, invoice,
  member and host statuses, all mapped onto the existing status tokens.
- **PlanBadge**, **EntityAvatar** (initials tile for organizations and people).
- **RoutedTabs** — link-based tabs that highlight from the URL; scroll horizontally on phones.
- **DetailList** (label / value rows), **EmptyState**, **ChartCard** (titled card for charts).
- Reused as-is: `DataTable` (sorting, filters, pagination, mobile cards), `PageHeader`,
  `SectionTabs`, shadcn primitives, the chart setup.

## Pages

**Dashboard** — KPI row: active organizations, MRR (with trend), active subscriptions (with
trialing count), emulators running fleet-wide against capacity. Charts: MRR over 12 months;
new organizations per month; organizations per plan. Lists: recent organizations; "Needs
attention" (past-due subscriptions, failed payments, degraded hosts, organizations at their
limit); recent admin activity.

**Organizations** — search, status chips (All / Active / Trialing / Past due / Suspended) and a
plan filter; table: organization (avatar, name, id), plan, members, emulators in use as a
meter (3 / 10), MRR, status, created, row actions (View, Change plan, Suspend). Header action:
New organization.

**Organization detail** — header: avatar, name, status, plan, owner, created; actions Change
plan, Suspend, more. Tabs (each with a count where useful):

- *Overview* — tiles: emulators in use vs limit, members (active / invited), MRR, next renewal.
  Current-plan card (price, cycle, renews on, Change plan). Details list (id, owner, billing
  email, country, payment method, created). Concurrent-usage chart for 14 days with the plan
  limit drawn as a line. Recent activity.
- *Users* — strip: members, active now, invited, suspended. Table: person (avatar, name,
  email), organization role, status, emulators running now, emulator hours this month, last
  active, 2FA; actions View (→ user detail), Change role, Suspend, Remove.
- *Emulators* — the organization's emulators: name, owner, host, Android version, status,
  address, last active.
- *Billing* — subscription summary (plan, cycle, amount, renewal, payment method) and the
  organization's invoices.
- *Activity* — the audit events for this organization as a timeline.

**Users** — every user across organizations: person, organization (link), organization role,
status, emulators running, last active, joined; status filter and search.

**User detail** — header: avatar, name, email, status, organization link, role. Tiles:
emulators running, hours this month, sessions this month, last active. Sections: profile
details, organization and role, their emulators, sign-in activity, admin actions (reset
password, sign out everywhere, suspend; delete in a danger zone).

**Plans** — one card per plan: name, monthly / yearly price (toggle), concurrent emulators as
the headline number, organizations subscribed, MRR from the plan, Active / Archived, Edit.
New plan / Edit opens a side sheet (name, prices, concurrent emulators, visible to new
organizations). Sample tiers: Free 1 · Starter 3 · Team 10 · Business 25 · Enterprise 50
(custom price).

**Subscriptions** — strip: active, trialing, past due, cancelling at period end, MRR / ARR.
Table: organization, plan, status, cycle, amount, started, renews or ends, payment method;
actions Change plan, Extend trial, Cancel at period end, Resume.

**Billing & invoices** — tiles: collected this month, outstanding, failed payments, refunds.
Chart: collected vs refunded per month. Invoices table: number, organization, amount, status
(Paid, Open, Failed, Refunded, Void), issued, due, paid; actions View, Download PDF, Retry
charge, Refund, Void.

**Emulators (fleet)** — status chips with counts; table: emulator, organization, owner, host,
Android version, status, address, last active; actions Force stop, Restart, Open owner.

**Hosts** — tiles: hosts healthy, total slots, slots in use. One card per host: name, IP,
region, status (Healthy, Degraded, Offline, Maintenance), CPU / memory / storage meters, slots
used / total, uptime, last heartbeat. Header action: Add host.

**Audit log** — filters: actor type, category (Auth, Billing, Organizations, Users,
Infrastructure, Settings), period. Rows: severity, actor, readable action ("Changed Northwind
Labs from Team to Business"), target link, IP, time.

**Team** — admin accounts: name, email, access level (Owner, Admin, Support — read-only), 2FA,
status, last active; Invite admin opens a side sheet. A card explains what each access level
can do.

**Settings** (side tabs, as in the user console):
General (platform name, support email, default time zone, maintenance mode with banner text) ·
Organizations (self sign-up off, default plan, trial length, invite expiry) · Billing (currency
USD, tax rate, invoice prefix, grace days before suspension, payment provider — "Not connected")
· Security (require 2FA for admins, session timeout, minimum password length, admin IP
allow-list) · Emulators (idle auto-stop, maximum session length, allowed Android versions) ·
Notifications (admin alerts for failed payments, offline hosts, organizations at limit, new
organizations).

**Profile** — the admin's own account, reusing the user console's profile sections.

## Data (static, `TODO(api)`)

Types in `src/types/admin.types.ts`: `Organization`, `Member`, `Plan`, `Subscription`,
`Invoice`, `FleetEmulator`, `Host`, `AuditEvent`, `AdminMember`. Sample data lives with the page
that owns it (`components/pages/admin/<area>/constants/`), linked by id; small selectors in
`utils/` (`getOrganization(id)`, `organizationUsage(org)`, …) derive the rest so counts always
agree. Money is stored in cents and shown with `formatCurrency()` (USD) from `lib/format.ts`.
Dates come from `SAMPLE_NOW` helpers (`minutesAgo`, plus `daysAgo` / `daysFromNow`). About 12
organizations, 60 members, 40 fleet emulators, 6 hosts, 30 invoices, 40 audit events.

## Folder structure

```
src/app/admin/
  layout.tsx                      AppShell area="admin"
  dashboard/page.tsx  organizations/page.tsx  users/page.tsx  …
  organizations/[orgId]/layout.tsx  page.tsx  users/page.tsx  emulators/page.tsx  …
  users/[userId]/page.tsx
src/components/pages/admin/<area>/   <Area>.tsx + components/ constants/ utils/
src/components/custom/               StatCard, UsageMeter, RoutedTabs, DetailList, …
src/components/common/               AppShell + area configs (console, admin)
src/lib/auth/roles.ts                Role, ROLE_HOME, canAccess()
src/types/admin.types.ts
```

## Build order

1. Foundations — shell generalization and admin layout and menu, shared building blocks,
   types, sample data, formatters, role rules, login demo routing, `/admin` redirect.
2. Dashboard.
3. Organizations list and organization detail with its five tabs.
4. Users and user detail.
5. Plans, Subscriptions, Billing.
6. Emulators (fleet) and Hosts.
7. Audit log, Team, Settings, Profile.

Each step ends with lint, format check, typecheck and build passing, and a look at the pages
at desktop and phone widths.

## Calls made without asking (check these)

- Organization tabs beyond the two you named: Emulators, Billing, Activity.
- Organization roles Owner / Admin / Member; admin access levels Owner / Admin / Support.
- Plan tiers and prices: Free $0 (1 emulator), Starter $19 (3), Team $49 (10), Business $129
  (25), Enterprise custom (50); yearly price = 10 × monthly.
- "How much each user is using" = emulators running now, emulator hours this month and
  sessions this month.
- A user who opens `/admin` is redirected to `/dashboard` (rather than shown a 404).
- Login demo rule: an identifier containing "admin" opens the admin area.
- Admin is marked by an Admin badge, not a different colour scheme.
- `/admin/profile` added so the admin's user menu has somewhere to go.
- A global Users list is kept alongside each organization's Users tab.

## Left to the builder

Exact sample data, chart types within the dataviz guidance, icons, spacing, and which shadcn
primitives to add (only those used).
