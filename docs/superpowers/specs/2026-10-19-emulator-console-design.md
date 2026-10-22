# Emulator Console — Design

Date: 2026-10-19 · Status: approved

## Intent

A web console for managing Android emulators: devices connected to a host and controlled from
the operator's own machine. This first version is a **static front end** (no API, no auth) that
sets the product's look, layout and page structure, so the backend and authentication can be
added later without restructuring.

Target user (assumed — real users not yet known): a technical operator running and watching
several emulators at once.

## Goals

- A professional, modern, distinctive UI — direction **A · Graphite & Teal** from the Claude
  Design canvas (https://claude.ai/artifact/YReq9mm3u8jcvgU1UnQPGT, artboard `Main.dc.html`).
- Five routes: Dashboard, Emulators, Profile, Settings, plus `/` redirecting to `/dashboard`.
- Folder structure mirroring `D:\t-genius\clari-t-license-frontend` (structure only).
- Static data isolated in `constants` files so each can later be swapped for an API call.
- Clean lint, format, typecheck and production build.

## Non-goals (this version)

- No API calls, no axios, no data fetching libraries.
- No authentication, sessions or route protection (Profile shows placeholder data).
- No real emulator control — actions give UI feedback only.
- No tests framework (matches the reference project).

## Anti-goals

- Looking like a stock shadcn template or a generic admin kit.
- Hard-coded colours scattered through components (everything goes through theme tokens).
- Copying code or config from the reference project beyond its folder layout.

## Stack (decided)

- Next.js (latest stable, App Router, `src/` dir), React, TypeScript (strict).
- Tailwind CSS v4 (CSS-first config in `globals.css`, `@tailwindcss/postcss`).
- shadcn/ui (new-york style, Radix, lucide icons) — chosen over HeroUI/Mantine/MUI because the
  existing data-table is built on shadcn primitives and the copied components are fully restylable.
- ESLint (flat config, `eslint-config-next` + `eslint-config-prettier`), Prettier with
  `prettier-plugin-tailwindcss`.
- `@tanstack/react-table` for the data-table; `next-themes` for light/dark; `recharts` via the
  shadcn chart component for dashboard charts; `sonner` for toasts.

## Visual system (decided — direction A)

- **Light mode:** ground `#F5F6F8`, cards `#FFFFFF`, borders `#E4E6EB`, text `#0F1115`, muted
  text `#5B6270`. Sidebar is graphite `#111318` with `#A1A7B3` text, active item `#1D2028` with a
  teal inset bar.
- **Accent:** teal `#0F766E` (primary buttons, active nav, chart highlight, focus rings).
- **Dark mode** (builder derives from the same palette): graphite ground, slightly lifted card
  surfaces, same teal family lightened for contrast. Sidebar stays graphite in both modes.
- **Status colours:** Running green, Booting amber, Stopped grey, Offline red — always paired
  with a text label (never colour alone).
- **Type:** Geist (UI) and Geist Mono (numbers, IPs, emulator IDs) via `next/font`.
- **Data-table header:** graphite (`--table-header` / `--table-header-foreground`), as on the canvas.
- All colours are CSS variables on `:root` / `.dark`, exposed to Tailwind through `@theme inline`.
- Text contrast ≥ 4.5:1 in both modes.

## Layout (decided)

- **Sidebar** (shadcn `Sidebar`): logo mark + "Emulator Console" (generic placeholder brand); group "Overview" →
  Dashboard, Emulators (with count badge); group "Account" → Profile, Settings; footer with host
  capacity card and user block. Collapses to icons on desktop (state persisted by shadcn's
  cookie), becomes a sheet drawer on mobile.
- **Navbar:** sidebar trigger, breadcrumb, search field (visual only, Ctrl K hint), theme toggle,
  notifications button with unread dot.
- **Main:** scrollable content area, max width ~1240px, consistent page header (title,
  description, actions).

## Pages (decided)

1. **Dashboard** — as on the canvas: page header with "Export report" and "New emulator"
   actions; four stat cards (Total, Running, Stopped, Offline); "Sessions this week" bar chart
   with 7/30-day toggle; "Android versions" breakdown; "Recent emulators" mini table with
   "View all" → `/emulators`; "Recent activity" feed. Also a host resource usage panel
   (CPU, memory, storage).
2. **Emulators** — page header with "New emulator"; search box and status filter chips
   (All / Running / Booting / Stopped / Offline with counts); the copied `DataTable` with columns:
   name + ID, device model, Android version, status badge, address (IP:port, mono, copyable),
   last active, row actions menu (Start, Stop, Restart, Connect, plus Delete styled destructive).
   Actions show a toast only. ~20–30 rows of sample data so pagination is visible.
3. **Profile** — identity header (avatar initials, name, role, email); personal details form
   (static, Save shows a toast); password & security section; recent sign-in activity list.
   Placeholder data marked `TODO(auth)`.
4. **Settings** — tabs: General (app name, language, time zone), Appearance (Light / Dark /
   System — wired to `next-themes`; density), Emulator defaults (default Android version, RAM,
   auto-start toggle), Notifications (toggles). Save shows a toast; values not persisted.

## Data-table (decided)

Copy `Accelon\Components\data-table\*` into `src/components/custom/data-table/` and adapt it to
this project's theme: replace hard-coded `bg-white` and other fixed colours with theme tokens so
it works in light and dark mode, align its radii, header and hover colours with direction A, and
switch imports to the `@/` alias. Keep its props and behaviour (sorting, filtering, pagination,
mobile card grid, expandable rows) intact.

## Folder structure (decided — mirrors the reference)

```
src/
  app/            layout.tsx, page.tsx (redirect), globals.css, dashboard/, emulators/,
                  profile/, settings/  (each page.tsx is thin: renders a pages/ component)
  components/
    common/       AppLayout, AppSidebar, AppNavbar, AppBreadcrumb, ThemeProvider, ThemeToggle
    custom/       data-table/, PageHeader, StatusBadge … (shared custom components)
    pages/<route>/  <Route>.tsx + components/, constants/, utils/
    ui/           shadcn primitives
  hooks/          kebab-case (use-mobile.ts)
  lib/            utils.ts, constants.ts (nav items, brand)
  types/          emulator.types.ts, dashboard.types.ts, …
```

Conventions: `@/*` → `src/*`; components PascalCase; hooks kebab-case; static data in
`components/pages/<route>/constants/*.constants.ts` marked `TODO(api)`.

## Calls made without asking (check these)

- Package manager **npm**; dev server on port 5000 (`next dev --port 5000`).
- App name **"Emulator Console"** — a generic placeholder until the real name is decided; it lives in one constant (`src/lib/brand.ts`) so the rename is one line. No company name in the UI.
- The project gets a git repository (initialised by create-next-app) but nothing is committed
  unless asked.
- Dark mode included, toggled from the navbar and from Settings → Appearance.

## Left to the builder

- Exact dark-mode shades, spacing scale details, icon choices, sample data contents.
- Which shadcn components to add (only those actually used).
- `package.json` scripts (dev, build, start, lint, lint:fix, format, format:check, typecheck).
- A short README and CLAUDE.md describing commands and conventions.
