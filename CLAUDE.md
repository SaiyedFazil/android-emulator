# CLAUDE.md

Guidance for Claude Code when working in this repository.

@AGENTS.md

## What this is

A single Next.js 16 app (App Router, `cacheComponents` + `partialPrefetching` on) for managing
Android emulators. Sign-in and the profile are live against the backend; other pages stay on
sample data until their phase. Design direction "Graphite & Teal"
(spec: `docs/superpowers/specs/2026-10-19-emulator-console-design.md`).

## Backend integration

The NestJS backend is `../emulator-backend`. Its design
(`../emulator-backend/docs/superpowers/specs/2026-10-27-backend-api-and-auth-design.md`) is the
reference for wiring pages to the API, phase by phase, each phase with its frontend part:
§6.4 auth behaviour, §8 endpoints, §10 frontend integration, §11 phases.

- The structure follows the user's t-genius frontend (`D:\t-genius\t-genius-frontend`), in one app.
- **Session:** Auth.js v5 (`src/auth.ts`, Credentials) keeps both tokens in its encrypted HttpOnly
  cookie; the browser only gets `session.accessToken`. Sign-in and refresh run on the Next server
  (`lib/auth/backend-auth.ts`, native fetch), forwarding `User-Agent` / `X-Forwarded-For`; a refresh
  happens once per refresh token (`lib/auth/refresh-once.ts`). A refused refresh returns `null` from
  the `jwt` callback, which ends the session and clears the cookie.
- **API calls** go from the browser through `lib/axios.ts` (Bearer; a 401 reads the session once,
  retries once, then `signOutTo(login?next=…)`). One object of typed calls per area in
  `lib/api/<area>/<area>-api.ts` returning `ApiResponse<T>` (`{ message, data }`); errors are read
  with `getApiError(error)` (`{ status, code, message, details }`) — no `err as {…}` casts.
- **Data** is fetched in client components with TanStack Query (`useQuery`; `useMutation` +
  `setQueryData` / `invalidateQueries`). Never read the session or the API in a Server Component:
  pages stay static shells and `AuthProvider` loads the session in the browser.
- **Forms** use Formik + Yup with the schemas in `lib/validation.ts` (the backend's rules: passwords
  8 characters to 72 bytes). Backend codes land on the matching field.
- `src/proxy.ts` routes by the session's role (`resolveAccess`); it only redirects, the API
  enforces access. Pages reached from emailed links (`AUTH_FLOW_PATHS`) are open to everyone and
  remove `?token=` from the URL (`useLinkToken`).
- API ids are uuids (`id: string`). API enum values are `UPPER_SNAKE_CASE` (`"ACTIVE"`,
  `"ORGANIZATION_ADMIN"`): the lowercase unions in `src/types/` change to them as each area is
  wired, and screens show labels from label maps, never raw values.
- Theme moves to a `theme` cookie (Phase 5); language and density are being removed.
- Stay static until their phase (keep sample data and `TODO(api)`): billing, subscriptions,
  invoices, hosts, emulators, the console dashboard, notifications and search, admin Settings, and
  the Audit log.

## Commands

`npm run dev` (port 5000) · `npm run build` · `npm run lint` · `npm run format:check` ·
`npm run typecheck`

Run lint, format:check, typecheck and build before calling work done.

**No test files or test scripts in this repo** — the developer tests the frontend manually. To
check logic while working, write a throwaway Node script in the system temp folder (outside the
repo) and delete it afterwards; never commit tests, test runners or route checkers.

## Conventions

- `@/*` → `src/*`. Components PascalCase, hooks kebab-case (`use-mobile.ts`).
- `src/app/<route>/page.tsx` is thin: metadata + `<Route />` from `components/pages/<route>/`.
  Console routes sit in the `(console)` route group, whose layout adds the sidebar and navbar;
  `/login` is outside it and has no app chrome. The admin area is `src/app/admin/` with content in
  `components/pages/admin/<area>/`.
- App chrome is `components/common/AppShell` driven by a `ShellConfig` per area
  (`lib/shell/console.shell.tsx`, `lib/shell/admin.shell.tsx`) passed from that area’s layout, so one
  area’s menu and data never ship with the other. Menu icons are elements (`<Users />`).
- Who may open which area: `lib/auth/roles.ts` (pure functions), used by `proxy.ts`, the sign-in
  form and the API client.
- `components/pages/<route>/` holds page content with `components/`, `constants/`, `utils/` beside it.
- `components/common/` app chrome · `components/custom/` shared components · `components/ui/` shadcn primitives.
- Colours come only from theme tokens in `src/app/globals.css` — no hex values or `bg-white` in
  components (the one exception is the theme previews in Settings → Appearance).
- Static data lives in `constants/` files marked `TODO(api)`, until its phase wires it.
- **Time is dayjs only**, imported from `@/lib/dayjs` (never `"dayjs"` directly, never `Date` /
  `Intl.DateTimeFormat`): it loads the utc, timezone, advancedFormat and relativeTime plugins.
  Formatters live in `lib/format.ts`.
- **Times show in the viewer's machine time zone.** Render an absolute date or time with
  `<LocalTime value={iso} format="date" | "datetime" | "month-year" />` (`components/custom`); pass
  children for other text (`{formatRelativeTime(iso, now)}`) and it keeps the local-time tooltip.
  Prerender can't know the zone, so it paints UTC first and switches after mount (`useTimeZone`).
  Relative times are the same everywhere and can render on the server.
- Sample timestamps use `minutesAgo()` / `SAMPLE_NOW` (a UTC dayjs) from `lib/sample-time.ts`;
  live data formats against `useNow()` (null until mounted). Never read the clock during render —
  Cache Components flags it and hydration would differ. Sample charts bucket by UTC calendar.
- Time zone pickers use `components/custom/TimezoneSelect` (every IANA zone with today's offset,
  searchable); `lib/timezones.ts` builds the list. The profile's zone is for emails and reports.
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
- Admin detail routes (`admin/organizations/[orgId]/**`, `admin/users/[userId]`) are dynamic: no
  `generateStaticParams`, so nothing is prerendered per id and each id renders on request.
  `instant = false` lets them read params without a Suspense boundary. The admin App Shell streams
  first, so an unknown id gets the not-found page with status 200 and `noindex` (a soft 404 —
  fine behind sign-in). For a hard 404, reject unknown ids in `proxy.ts` before render; adding
  `generateStaticParams` back would prerender every id again.

## Git

Do not commit or push unless asked.
