# CLAUDE.md

Guidance for Claude Code when working in this repository.

@AGENTS.md

## What this is

A single Next.js 16 app (App Router, `cacheComponents` + `partialPrefetching` on) for managing
Android emulators. Currently static: no API, no auth. Design direction "Graphite & Teal"
(spec: `docs/superpowers/specs/2026-10-19-emulator-console-design.md`).

## Commands

`npm run dev` (port 5000) · `npm run build` · `npm run lint` · `npm run format:check` ·
`npm run typecheck` · `npm test` (Node test runner, `src/**/*.test.mjs`) ·
`npm run check:routes` (smoke-checks every route against `npm run start` on port 3000)

Run lint, format:check, typecheck, test and build before calling work done.

## Conventions

- `@/*` → `src/*`. Components PascalCase, hooks kebab-case (`use-mobile.ts`).
- `src/app/<route>/page.tsx` is thin: metadata + `<Route />` from `components/pages/<route>/`.
  Console routes sit in the `(console)` route group, whose layout adds the sidebar and navbar;
  `/login` is outside it and has no app chrome. The admin area is `src/app/admin/` with content in
  `components/pages/admin/<area>/`.
- App chrome is `components/common/AppShell` driven by a `ShellConfig` per area
  (`lib/shell/console.shell.tsx`, `lib/shell/admin.shell.tsx`) passed from that area’s layout, so one
  area’s menu and data never ship with the other. Menu icons are elements (`<Users />`).
- Who may open which area: `lib/auth/roles.ts` (pure, unit-tested). Proxy and session checks will
  call it once auth exists.
- `components/pages/<route>/` holds page content with `components/`, `constants/`, `utils/` beside it.
- `components/common/` app chrome · `components/custom/` shared components · `components/ui/` shadcn primitives.
- Colours come only from theme tokens in `src/app/globals.css` — no hex values or `bg-white` in
  components (the one exception is the theme previews in Settings → Appearance).
- Static data lives in `constants/` files marked `TODO(api)` / `TODO(auth)`. No axios or fetch yet.
- Sample timestamps use `minutesAgo()` / `SAMPLE_NOW` from `lib/sample-time.ts`; never call
  `Date.now()` or `new Date()` during render — Cache Components flags it and hydration would differ.
- Add a dependency only in the change that first imports it.

## Gotchas

- The data-table (`components/custom/data-table`) is TanStack Table v9. Its features, row models,
  sort/filter registries and column `meta` type live in `data-table.features.ts`; column files type
  themselves with `DataTableColumnDef<Row>` (not `ColumnDef`), and custom comparators are `sortFn`.
- Mobile data-table cards read field labels from `columnDef.meta.label`.
- Profile and Settings sections use `components/custom/SectionTabs` (vertical nav from `lg`,
  selection in the URL hash). Pass `icon` as an element (`<Bell />`), not the component —
  pages are Server Components and functions can't cross into the client.
- `turbopack.root` is pinned in `next.config.ts` because a stray `package.json` in the user's home
  directory would otherwise become the workspace root.
- `/` → `/dashboard` is a redirect in `next.config.ts` (a page-level `redirect()` errors under
  Cache Components validation).
- Sign-in page (`components/pages/login`): the showcase panel carries the `dark` class, a
  dark-mode island that keeps it graphite in both themes like the sidebar. Entrance animations
  are CSS (`Reveal`, tw-animate-css) so nothing is server-rendered hidden until hydration; Motion
  (`motion/react`) is only for interactive pieces (terminal lines, alert, icon swaps). Ambient
  loops are `--animate-*` keyframes in `globals.css`.
- Admin detail routes (`admin/organizations/[orgId]`, `admin/users/[userId]`) set
  `ensureStatic = "navigation"` so an unknown id returns a real 404 on its first visit (`dynamicParams`
  isn’t available with Cache Components). That level forbids `cookies()`/`headers()` in every layout
  above them, so admin auth belongs in `proxy.ts` and per-action `requireRole()`, never in
  `admin/layout.tsx`.
- Tests (`*.test.mjs`) run on Node’s built-in runner; `scripts/test-alias.mjs` resolves the `@/`
  alias. Only `.ts` modules can be loaded (Node strips types but can’t run JSX).

## Git

Do not commit or push unless asked.
