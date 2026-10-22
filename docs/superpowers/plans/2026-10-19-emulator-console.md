# Emulator Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static Next.js front end for an Android emulator console — app shell plus Dashboard, Emulators, Profile and Settings pages — in design direction A (Graphite & Teal), light and dark.

**Architecture:** Next.js App Router under `src/`. Each `src/app/<route>/page.tsx` is a thin server component rendering `components/pages/<route>/<Route>.tsx`. All sample data lives in `components/pages/<route>/constants/*.constants.ts` (marked `TODO(api)`), typed by `src/types/*.types.ts`. Theme is CSS variables in `globals.css` (`:root` / `.dark`) mapped to Tailwind v4 via `@theme inline`; `next-themes` switches the `.dark` class.

**Tech Stack:** Next.js 16.4, React 19, TypeScript (strict), Tailwind CSS 4.3, shadcn/ui (new-york, Radix, lucide-react), @tanstack/react-table 8.21, next-themes, recharts (shadcn chart), sonner, ESLint 10 flat config, Prettier 3 + prettier-plugin-tailwindcss. Node 24, npm 11.

**Spec:** `docs/superpowers/specs/2026-10-19-emulator-console-design.md` · Visual reference: Claude Design canvas https://claude.ai/artifact/YReq9mm3u8jcvgU1UnQPGT, artboard "A · Graphite & Teal".

## Global Constraints

- No axios, no fetch, no API layer, no auth library. Static data only.
- App name is the generic placeholder **"Emulator Console"**, defined once in `src/lib/brand.ts`. No company name in the UI.
- Fonts: Geist (UI) and Geist Mono (numbers, IPs, serials) via `next/font/google`.
- Light palette: ground `#F5F6F8`, card `#FFFFFF`, border `#E4E6EB`, text `#0F1115`, muted text `#5B6270`, sidebar `#111318` / text `#A1A7B3` / active `#1D2028`, primary teal `#0F766E`.
- Status colours: Running green, Booting amber, Stopped grey, Offline red — always with a text label.
- No hard-coded hex/`bg-white` in components; colours come from theme tokens only.
- Text contrast ≥ 4.5:1 in both modes.
- Dev server on port 5000 (`next dev --port 5000`). npm only.
- Folder layout mirrors `clari-t-license-frontend` (structure only — copy no code or config from it).
- Git: repository may exist; **do not commit** (user's instruction). Replace every "Commit" step with nothing.
- `@tanstack/react-table` pinned to `^8.21.3` — the copied data-table is written against the v8 API (v9 changed it).
- Verification gate for every task: `npm run typecheck`, `npm run lint`, `npm run format:check` all pass. No test framework exists (spec non-goal); behaviour is verified with the dev server.

## Review Focus

1. **Theme switch without flash or hydration warnings** — reload in dark mode shows dark immediately; theme toggle icon must not mismatch between server and client (Task 2, Task 3).
2. **Phone width (375px)** — no horizontal page scroll; sidebar becomes a drawer; tables switch to the data-table's mobile card grid; navbar search collapses (Task 3, Task 5).
3. **Search / filter with zero matches** on Emulators — shows a proper empty state, pagination resets to page 1 (Task 5).
4. **Long values** — a 40-character emulator name or an IPv6 address must truncate/wrap inside its cell, not stretch the table (Task 5).
5. **Keyboard use** — every row action menu, toggle and icon button is reachable by Tab and has an accessible name (Tasks 3–7).

---

## File Structure

```
src/
  app/
    layout.tsx                 fonts, ThemeProvider, Toaster, AppLayout
    page.tsx                   redirect("/dashboard")
    globals.css                Tailwind import, theme tokens (light + dark)
    dashboard/page.tsx         metadata + <Dashboard />
    emulators/page.tsx         metadata + <Emulators />
    profile/page.tsx           metadata + <Profile />
    settings/page.tsx          metadata + <Settings />
  components/
    common/
      AppLayout.tsx            SidebarProvider + AppSidebar + SidebarInset(AppNavbar + main)
      AppSidebar.tsx           brand, nav groups, host capacity card, user block
      AppNavbar.tsx            SidebarTrigger, AppBreadcrumb, search, ThemeToggle, notifications
      AppBreadcrumb.tsx        derives trail from pathname + NAV_ITEMS
      ThemeProvider.tsx        next-themes wrapper (client)
      ThemeToggle.tsx          light/dark icon button (client, mounted guard)
    custom/
      PageHeader.tsx           title, description, actions slot
      StatusBadge.tsx          EmulatorStatus → label + token colours
      data-table/              DataTable.tsx, DataTableMobileGrid.tsx, DataTablePagination.tsx, index.ts
    pages/
      dashboard/   Dashboard.tsx; components/{StatCard,SessionsChart,VersionBreakdown,RecentEmulators,ActivityFeed,ResourceUsage}.tsx; constants/dashboard.constants.ts
      emulators/   Emulators.tsx; EmulatorsColumns.tsx; components/{EmulatorsToolbar,EmulatorRowActions,CopyAddress}.tsx; constants/emulator.constants.ts; utils/emulator.utils.ts
      profile/     Profile.tsx; components/{ProfileHeader,PersonalDetailsForm,SecurityCard,SignInActivity}.tsx; constants/profile.constants.ts
      settings/    Settings.tsx; components/{GeneralSettings,AppearanceSettings,EmulatorDefaults,NotificationSettings}.tsx; constants/settings.constants.ts
    ui/                        shadcn primitives (CLI-generated)
  hooks/use-mobile.ts          (shadcn sidebar generates it)
  lib/
    utils.ts                   cn()
    brand.ts                   APP_NAME, APP_TAGLINE
    constants.ts               NAV_GROUPS
    format.ts                  formatRelativeTime(iso, now?)
  types/
    emulator.types.ts
    dashboard.types.ts
    profile.types.ts
    nav.types.ts
```

---

### Task 1: Scaffold the project and tooling

**Files:**
- Create: whole Next.js scaffold in the project root; `.prettierrc.json`, `.prettierignore`
- Modify: `eslint.config.mjs`, `package.json` (scripts, engines), `.gitignore`

**Interfaces:**
- Produces: scripts `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`; alias `@/*` → `src/*`.

- [ ] **Step 1: Scaffold.** The root already holds `docs/`; move it to the scratchpad, run `npx create-next-app@16.4.2 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`, then move `docs/` back. Expected: `src/app/page.tsx`, `postcss.config.mjs` with `@tailwindcss/postcss`, `tailwindcss@4.x` in devDependencies.
- [ ] **Step 2: Prettier.** `npm i -D prettier prettier-plugin-tailwindcss eslint-config-prettier`. `.prettierrc.json`: `semi: true, singleQuote: false, tabWidth: 2, trailingComma: "es5", printWidth: 100, arrowParens: "always", endOfLine: "auto", plugins: ["prettier-plugin-tailwindcss"]`. `.prettierignore`: `node_modules .next out build package-lock.json docs`.
- [ ] **Step 3: ESLint.** In `eslint.config.mjs` append `eslint-config-prettier` after the Next configs, and set `@typescript-eslint/no-unused-vars` to `warn` with `^_` ignore patterns for args/vars/caught errors.
- [ ] **Step 4: Scripts.** `lint: "eslint"`, `lint:fix: "eslint --fix"`, `format: "prettier --write ."`, `format:check: "prettier --check ."`, `typecheck: "tsc --noEmit"`; `"engines": { "node": ">=24" }`.
- [ ] **Step 5: Verify.** `npm run format && npm run typecheck && npm run lint && npm run build`. Expected: all exit 0. If `tsc`/build fails because of TypeScript 7, pin `typescript@^6` and rerun.

### Task 2: shadcn/ui, theme tokens, fonts, theme provider

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/*`, `src/components/common/ThemeProvider.tsx`, `src/lib/brand.ts`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: Tailwind colour utilities `bg-background text-foreground bg-card border-border text-muted-foreground bg-primary text-primary-foreground bg-sidebar …` plus custom tokens `--table-header`, `--table-header-foreground`, `--row-hover`, `--status-{running|booting|stopped|offline}` and `--status-{…}-soft`, `--chart-1..5`. `APP_NAME = "Emulator Console"`, `APP_TAGLINE = "Android device fleet"`.

- [ ] **Step 1: Init shadcn.** `npx shadcn@4.22.1 init` (style new-york, base colour neutral, CSS variables). Add: `button input label select separator sheet sidebar skeleton table tooltip avatar badge card dropdown-menu tabs switch chart sonner breadcrumb toggle-group textarea progress scroll-area`. `npm i next-themes`.
- [ ] **Step 2: Theme tokens in `globals.css`.** Replace generated colour values: light values from Global Constraints (`--radius: 0.75rem`; `--ring` = primary). Sidebar tokens graphite in **both** modes. Dark: `--background #0B0D11`, `--card #12151B`, `--border #232731`, `--foreground #E8EAEE`, `--muted-foreground #9AA1AE`, `--primary #14B8A6` with `--primary-foreground #04201D`. `--table-header` = sidebar graphite, `--table-header-foreground #E6E8EC`; `--row-hover` = primary at ~5% alpha. Status: running `#12B76A`, booting `#F79009`, stopped `#98A2B3`, offline `#F04438`; `-soft` variants for badge backgrounds with ≥4.5:1 text (light text shades `#0B6B3A / #93520A / #4A5160 / #B42318`; dark uses the base colours on ~12% alpha). Register all custom tokens in `@theme inline` as `--color-*`.
- [ ] **Step 3: Fonts and providers in `layout.tsx`.** `Geist` → `--font-sans`, `Geist_Mono` → `--font-mono` via `next/font/google`; `<html lang="en" suppressHydrationWarning>`; wrap children in `ThemeProvider` (`attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`) and render `<Toaster richColors position="bottom-right" />`. Metadata title template `%s · ${APP_NAME}`.
- [ ] **Step 4: Verify.** Gate commands pass; `npm run build` exits 0.

### Task 3: App shell (sidebar, navbar, breadcrumb, theme toggle, routes)

**Files:**
- Create: `src/types/nav.types.ts`, `src/lib/constants.ts`, `src/components/common/{AppLayout,AppSidebar,AppNavbar,AppBreadcrumb,ThemeToggle}.tsx`, `src/app/{dashboard,emulators,profile,settings}/page.tsx` (placeholder content for now)
- Modify: `src/app/layout.tsx` (wrap in `AppLayout`), `src/app/page.tsx` (→ `redirect("/dashboard")`)

**Interfaces:**
- Produces: `type NavItem = { title: string; href: string; icon: LucideIcon; badge?: string }`, `type NavGroup = { label: string; items: NavItem[] }`, `NAV_GROUPS: NavGroup[]` = Overview → Dashboard `/dashboard` (LayoutDashboard), Emulators `/emulators` (Smartphone, badge = sample count); Account → Profile `/profile` (UserRound), Settings `/settings` (Settings).

- [ ] **Step 1: Sidebar.** shadcn `Sidebar collapsible="icon"`. Header: teal rounded mark with Smartphone icon + `APP_NAME` / `APP_TAGLINE`. Groups from `NAV_GROUPS`; active = `pathname.startsWith(href)`, styled per canvas (lifted background + 2px teal inset bar). Footer: host-capacity card ("14 of 20 slots in use", 68% `Progress`, hidden when collapsed) and user block (initials avatar, "Admin User", email) with a dropdown linking Profile/Settings.
- [ ] **Step 2: Navbar.** 64px, `bg-card`, bottom border: `SidebarTrigger`, vertical separator, `AppBreadcrumb` (`Overview / Dashboard` from `NAV_GROUPS`), spacer, search input with `Ctrl K` kbd (hidden below `md`, icon button instead), `ThemeToggle`, notifications icon button with red dot. All icon buttons have `aria-label`.
- [ ] **Step 3: ThemeToggle.** Uses `useTheme().resolvedTheme`; renders a neutral placeholder until mounted (no hydration mismatch); toggles light ↔ dark; Sun/Moon icon.
- [ ] **Step 4: Main area.** `SidebarInset` → navbar + `<main className="mx-auto w-full max-w-310 p-4 md:p-7">`.
- [ ] **Step 5: Verify.** Gate passes. `npm run dev`; `curl -s -o /dev/null -w "%{http_code}" localhost:5000/<route>` → 200 for all four routes, `/` → 307 to `/dashboard`. In the browser: collapse/expand works, drawer at 375px, dark mode reload has no flash and no console hydration warning.

### Task 4: Shared custom components and the data-table

**Files:**
- Create: `src/types/emulator.types.ts`, `src/lib/format.ts`, `src/components/custom/{PageHeader,StatusBadge}.tsx`, `src/components/custom/data-table/*` (copied from `Accelon\Components\data-table`)
- Modify: none

**Interfaces:**
- Produces:
  - `type EmulatorStatus = "running" | "booting" | "stopped" | "offline"`
  - `type Emulator = { id: string; name: string; serial: string; model: string; androidVersion: string; apiLevel: number; status: EmulatorStatus; host: string; port: number; cpuCores: number; ramGb: number; lastActive: string /* ISO */ }`
  - `EMULATOR_STATUS: Record<EmulatorStatus, { label: string }>` exported from `StatusBadge.tsx` (labels reused by filter chips)
  - `<StatusBadge status={EmulatorStatus} />` — pill with dot, soft background, label "Running"/"Booting"/"Stopped"/"Offline"; booting dot pulses.
  - `<PageHeader title: string; description?: string; actions?: ReactNode />`
  - `formatRelativeTime(iso: string, now = new Date()): string` → "2 minutes ago", "1 hour ago", "3 days ago" via `Intl.RelativeTimeFormat("en", { numeric: "auto" })`.
  - `DataTable` with its existing props unchanged.

- [ ] **Step 1: Copy the data-table.** `npm i @tanstack/react-table@^8.21.3`. Copy the 4 files; switch imports to `@/components/ui/*` and `@/lib/utils`.
- [ ] **Step 2: Theme-adapt it.** Replace every `bg-white`/`bg-white!` with `bg-card` (inputs/selects: `bg-background`); rows default `bg-card`; keep `--table-header`, `--table-header-foreground`, `--row-hover` (now defined in Task 2); header height/padding to match the canvas (`h-11`, `text-[13px] font-medium`); container `rounded-xl border bg-card overflow-hidden`; mobile card header keeps `--table-header`. Props and behaviour unchanged.
- [ ] **Step 3: StatusBadge, PageHeader, formatRelativeTime** per Interfaces.
- [ ] **Step 4: Verify.** Gate passes (no new lint warnings in data-table beyond the file's existing documented disables).

### Task 5: Emulators page

**Files:**
- Create: `src/components/pages/emulators/{Emulators,EmulatorsColumns}.tsx`, `components/{EmulatorsToolbar,EmulatorRowActions,CopyAddress}.tsx`, `constants/emulator.constants.ts`, `utils/emulator.utils.ts`
- Modify: `src/app/emulators/page.tsx`, `src/lib/constants.ts` (badge = `EMULATORS.length`)

**Interfaces:**
- Consumes: `Emulator`, `StatusBadge`, `PageHeader`, `DataTable`, `formatRelativeTime`.
- Produces: `EMULATORS: Emulator[]` (26 rows, realistic devices: Pixel 8 Pro, Pixel 9, Galaxy S24, Pixel Tablet, Pixel Fold, Nexus 5X…; Android 12–15 with API 31–35; hosts `192.168.1.24/31/40`, ports 5554+2n; statuses ≈ 14 running / 2 booting / 7 stopped / 3 offline; one name ≥40 chars; one IPv6 host `fd00::1a2b`). `filterEmulators(list: Emulator[], query: string, status: EmulatorStatus | "all"): Emulator[]` (matches name, serial, model, host, case-insensitive). `countByStatus(list): Record<EmulatorStatus | "all", number>`.

- [ ] **Step 1: Constants and utils** per Interfaces (`TODO(api)` comment on `EMULATORS`).
- [ ] **Step 2: Columns.** Emulator (name semibold + serial mono muted, `max-w-[240px] truncate` with `title`), Device model, Android (`Android 15` + `API 35` muted), Status (`StatusBadge`), Address (`CopyAddress`: mono `host:port`, IPv6 wrapped as `[host]:port`, copy icon button → clipboard + toast "Address copied"), Last active (`formatRelativeTime`), `id: "actions"` (`EmulatorRowActions`). Sortable headers on name, Android, status, last active.
- [ ] **Step 3: Row actions.** `DropdownMenu` on a ghost icon button (`aria-label="Actions for <name>"`): Start (disabled if running/booting), Stop (disabled if stopped/offline), Restart, Connect, separator, Delete (destructive). Each shows a `toast` ("Start requested for Pixel 8 Pro") — no state change.
- [ ] **Step 4: Toolbar + page.** `PageHeader` "Emulators" / "Every emulator connected to your hosts." / actions: "New emulator" (primary, toast). Toolbar: search `Input` with icon and clear button; `ToggleGroup` chips All/Running/Booting/Stopped/Offline each with count. `Emulators.tsx` holds `query`/`status` state, passes `filterEmulators(...)` to `DataTable` via `customLeftToolbar`, `pageSizeOptions={[10, 25, 50]}`, initial page size 10 (set via controlled `pagination` reset to page 0 when filters change), `emptyStateContent` = icon + "No emulators match" + "Clear filters" button.
- [ ] **Step 5: Verify.** Gate passes. In dev: search "pixel" narrows rows; "zzz" shows empty state; page 3 then filter → page 1; 375px shows card grid, no horizontal page scroll; long name and IPv6 rows don't stretch the table; Tab reaches each actions menu and Enter opens it.

### Task 6: Dashboard page

**Files:**
- Create: `src/types/dashboard.types.ts`, `src/components/pages/dashboard/Dashboard.tsx`, `components/{StatCard,SessionsChart,VersionBreakdown,RecentEmulators,ActivityFeed,ResourceUsage}.tsx`, `constants/dashboard.constants.ts`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `EMULATORS`, `countByStatus`, `StatusBadge`, `PageHeader`, `formatRelativeTime`.
- Produces: `SESSIONS_7D: { day: string; sessions: number }[]` = Mon 42, Tue 58, Wed 51, Thu 66, Fri 73, Sat 61, Sun 80; `SESSIONS_30D` (30 points); `ACTIVITY: { id; message; status: EmulatorStatus; at: ISO }[]` (5 items as on canvas); `RESOURCES: { label: "CPU" | "Memory" | "Storage"; used: number; total: number; unit: string }[]` (68% / 54% / 41%). Stat cards and version breakdown are **derived from `EMULATORS`** (not separate numbers).

- [ ] **Step 1: Constants and types** per Interfaces (`TODO(api)`).
- [ ] **Step 2: StatCard** (`label, value, hint, tone: EmulatorStatus | "neutral"`): coloured dot, mono value 30px, muted hint — four in a responsive grid (`sm:grid-cols-2 xl:grid-cols-4`).
- [ ] **Step 3: SessionsChart** (client): shadcn `ChartContainer` + recharts `BarChart`, bars `--chart-2` muted, last/peak bar `--primary`, rounded tops, `ToggleGroup` 7/30 days switches dataset. **VersionBreakdown**: bars per Android version from `EMULATORS`, teal with stepped opacity. Row layout `lg:grid-cols-3`, chart spans 2.
- [ ] **Step 4: RecentEmulators** (5 most recent by `lastActive`, compact table with graphite header, "View all" → `/emulators`), **ActivityFeed**, **ResourceUsage** (three `Progress` bars with `used/total unit`). Bottom row `lg:grid-cols-3`; ResourceUsage + ActivityFeed stacked in the third column.
- [ ] **Step 5: Header** "Dashboard" / "Health of your emulator fleet at a glance." / "Export report" (outline, toast) + "New emulator" (primary, toast).
- [ ] **Step 6: Verify.** Gate passes; page matches the canvas artboard in light mode; chart readable in dark mode; tooltip shows on hover; 375px stacks cleanly.

### Task 7: Profile and Settings pages

**Files:**
- Create: `src/types/profile.types.ts`; `src/components/pages/profile/{Profile.tsx, components/{ProfileHeader,PersonalDetailsForm,SecurityCard,SignInActivity}.tsx, constants/profile.constants.ts}`; `src/components/pages/settings/{Settings.tsx, components/{GeneralSettings,AppearanceSettings,EmulatorDefaults,NotificationSettings}.tsx, constants/settings.constants.ts}`
- Modify: `src/app/profile/page.tsx`, `src/app/settings/page.tsx`

**Interfaces:**
- Produces: `type UserProfile = { firstName; lastName; email; role: "Administrator" | "Operator" | "Viewer"; phone?; timezone; joinedAt: ISO }`; `PROFILE: UserProfile` (Admin User, admin@example.com — `TODO(auth)`); `SIGN_INS: { id; device; location; at: ISO; current?: boolean }[]` (4 items). Settings option lists: `LANGUAGES`, `TIMEZONES`, `ANDROID_VERSIONS`, `RAM_OPTIONS` (`2, 4, 6, 8` GB), `NOTIFICATION_OPTIONS: { id; label; description; defaultOn }[]`.

- [ ] **Step 1: Profile.** Header card (teal-tinted banner strip, 72px initials avatar, name, role `Badge`, email, joined date); two-column grid: `PersonalDetailsForm` (first/last name, email, phone, timezone `Select`; local state; Save → toast "Profile updated", Cancel resets) | `SecurityCard` (password last changed, "Change password" button → toast, 2FA `Switch`) + `SignInActivity` (list, "This device" badge on current).
- [ ] **Step 2: Settings.** `PageHeader` + shadcn `Tabs` (General, Appearance, Emulator defaults, Notifications), each panel a `Card` with label/description rows and a footer Save button (toast "Settings saved"). General: workspace name `Input` (default `APP_NAME`), language `Select`, time zone `Select`. Appearance: three selectable theme cards (Light / Dark / System) bound to `useTheme().setTheme` with a mounted guard — this one takes effect live; density `ToggleGroup` (Comfortable/Compact, local only). Emulator defaults: Android version `Select`, RAM `Select`, auto-start `Switch`, cold-boot `Switch`. Notifications: `Switch` per `NOTIFICATION_OPTIONS`. Tabs scroll horizontally at 375px.
- [ ] **Step 3: Verify.** Gate passes; theme cards change theme live and the navbar toggle stays in sync; every `Switch` has an associated `Label`; 375px has no horizontal page scroll.

### Task 8: Docs and final verification

**Files:**
- Create: `README.md` (replace generated), `CLAUDE.md`
- Modify: none

- [ ] **Step 1: README** — what it is, commands, folder structure, "static data lives in `constants/` (search `TODO(api)` / `TODO(auth)`)", how to rename the app (`src/lib/brand.ts`).
- [ ] **Step 2: CLAUDE.md** — commands; conventions (`@/*`, PascalCase components, kebab-case hooks, `components/pages/<route>/` with `components/ constants/ utils/`, `common/` chrome, `custom/` shared, `ui/` shadcn); theme tokens only, no hex in components; run lint, format:check, typecheck and build before calling work done.
- [ ] **Step 3: Final gate.** `npm run format:check && npm run lint && npm run typecheck && npm run build` → all exit 0; build output lists `/dashboard /emulators /profile /settings` as static.
