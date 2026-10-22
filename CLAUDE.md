# CLAUDE.md

Guidance for Claude Code when working in this repository.

@AGENTS.md

## What this is

A single Next.js 16 app (App Router, `cacheComponents` + `partialPrefetching` on) for managing
Android emulators. Currently static: no API, no auth. Design direction "Graphite & Teal"
(spec: `docs/superpowers/specs/2026-10-19-emulator-console-design.md`).

## Commands

`npm run dev` (port 5000) · `npm run build` · `npm run lint` · `npm run format:check` ·
`npm run typecheck`

Run lint, format:check, typecheck and build before calling work done.

## Conventions

- `@/*` → `src/*`. Components PascalCase, hooks kebab-case (`use-mobile.ts`).
- `src/app/<route>/page.tsx` is thin: metadata + `<Route />` from `components/pages/<route>/`.
  Console routes sit in the `(console)` route group, whose layout adds the sidebar and navbar;
  `/login` is outside it and has no app chrome.
- `components/pages/<route>/` holds page content with `components/`, `constants/`, `utils/` beside it.
- `components/common/` app chrome · `components/custom/` shared components · `components/ui/` shadcn primitives.
- Colours come only from theme tokens in `src/app/globals.css` — no hex values or `bg-white` in
  components (the one exception is the theme previews in Settings → Appearance).
- Static data lives in `constants/` files marked `TODO(api)` / `TODO(auth)`. No axios or fetch yet.
- Sample timestamps use `minutesAgo()` / `SAMPLE_NOW` from `lib/sample-time.ts`; never call
  `Date.now()` or `new Date()` during render — Cache Components flags it and hydration would differ.
- Add a dependency only in the change that first imports it.

## Gotchas

- The data-table (`components/custom/data-table`) is wrapped in `<Suspense>`: TanStack Table v8
  reads `Date.now()` for memo debugging in development, which Cache Components reports.
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

## Git

Do not commit or push unless asked.
