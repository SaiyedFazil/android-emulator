# Emulator Console

A web console for managing Android emulators connected to your hosts: a fleet dashboard, an
emulator list with search, filters and row actions, an admin console, and profile and settings
pages.

Sign-in, the profile and the admin Team page run against the NestJS backend
(`../emulator-backend`). The other pages
still show sample data from `constants/` files until their phase (see [Static data](#static-data)).

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui (Radix) · Auth.js v5 · axios · TanStack Query 5 · Formik + Yup · Day.js · TanStack Table v9 ·
Recharts · next-themes · Sonner · ESLint · Prettier

## Getting started

Requires Node.js 24 or newer and the backend running (see `../emulator-backend/README.md`).

```bash
npm install
cp .env.example .env.local   # then set AUTH_SECRET (see below)
npm run dev                  # http://localhost:5000
```

| Variable                    | Example                        | What it is                                                                                     |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`               | `npx auth secret`              | Encrypts the session cookie. Required; keep it secret and the same on every frontend server.   |
| `AUTH_SESSION_MAX_AGE_DAYS` | `30`                           | Lifetime of the session cookie; at least the backend's `REFRESH_TTL_DAYS_PERSISTENT`.          |
| `NEXT_PUBLIC_API_URL`       | `http://localhost:5001/api/v1` | The API as the browser reaches it. Built into the client bundle: rebuild after changing it.    |
| `API_URL`                   | _(empty)_                      | The API as the Next server reaches it (sign-in, refresh). Empty means `NEXT_PUBLIC_API_URL`.   |
| `DEV_HOST`                  | _(empty)_                      | Development only: this machine's network IP, to open `npm run dev` from other devices (below). |

**Opening the dev server from other devices.** `npm run dev` listens on every network interface
(`-H 0.0.0.0`), so anyone on the same network can open `http://<your-ip>:5000`. For it to work:

- set `DEV_HOST=<your-ip>` (allows Next's dev resources and hot reload for that address);
- set `NEXT_PUBLIC_API_URL=http://<your-ip>:5001/api/v1` (the other device's `localhost` is itself);
- add `http://<your-ip>:5000` to the backend's `CORS_ORIGINS`.

The backend must allow this origin (`CORS_ORIGINS`) and trust the Next server as a proxy
(`TRUST_PROXY=loopback` when both run on one machine), so sessions record the browser's IP.

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server on port 5000              |
| `npm run build`     | Production build                               |
| `npm run start`     | Serve the production build                     |
| `npm run lint`      | ESLint (`lint:fix` to auto-fix)                |
| `npm run format`    | Prettier write (`format:check` to verify only) |
| `npm run typecheck` | Generate Next route types, then `tsc --noEmit` |

There are no automated tests in this repository; the frontend is tested by hand.

## Authentication

- **Session:** Auth.js v5 (`src/auth.ts`, Credentials provider) keeps the backend's access and
  refresh tokens in one encrypted, `HttpOnly` cookie. Page JavaScript can't read it; the browser
  only receives the access token, from one `GET /auth/session` per page load
  (`lib/auth/session-client.ts`, shared by everything that needs it).
- **Sign-in and sign-out are Server Actions** (`lib/auth/auth-actions.ts`): one request each,
  protected against cross-site use by Next.js.
- **Sign-in and refresh run on the Next server.** The refresh happens when less than a minute of
  the access token is left, once per refresh token (`lib/auth/refresh-once.ts`), however many tabs
  or requests need it. The browser's `User-Agent` and `X-Forwarded-For` are forwarded, so the
  backend's Devices list and rate limits see the real client. A refused refresh ends the session.
- **API calls go from the browser** through `src/lib/axios.ts` with `Authorization: Bearer`, so
  they show in the Network tab. A `401` re-reads the session once (the server refreshes) and
  retries once; if that fails, the user is signed out and sent to `/login?next=<page>`.
- **Routing:** `src/proxy.ts` reads the session (saving a refreshed cookie) and keeps each role in
  its area: platform staff in `/admin`, organization users in the console. It only redirects; the
  API enforces access. `/forgot-password`, `/reset-password` and `/accept-invite` are open to all.
- **Security headers** (`next.config.ts`) on every page: a Content-Security-Policy that lets the
  browser run only this site's scripts and send requests only to this site and the API
  (`NEXT_PUBLIC_API_URL`), so an injected script can't load from elsewhere or send the access
  token out; plus `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and
  `Permissions-Policy`. Inline scripts stay allowed (a per-request nonce would make every page
  dynamic). Adding a third-party script, font or API means adding its origin to the policy.
- **In production**, run Next behind a reverse proxy such as nginx that sets `X-Forwarded-For`
  (`$proxy_add_x_forwarded_for`), `X-Forwarded-Proto` and `Host`; Next only adds the header when it
  is missing.

## Project structure

```
src/
  auth.ts, auth.config.ts Auth.js: session, sign-in against the backend, refresh
  proxy.ts                Routing by session and role
  app/                    Routes — each page.tsx only sets metadata and renders a page component
  components/
    common/               App chrome (AppShell, AppSidebar, AppNavbar, …), QueryProvider
    custom/               Shared components: data-table/, PageHeader, StatusBadge, SectionTabs, …
    pages/<route>/        Page content: <Route>.tsx plus components/, constants/, utils/
    ui/                   shadcn/ui primitives (generated — edit with care)
  hooks/                  use-me, use-now, use-link-token, use-mobile, use-mounted, …
  lib/
    axios.ts              The browser's API client
    api/<area>/           Typed API calls per area (auth-api, me-api); api-error.ts reads errors
    auth/                 Roles and areas, backend sign-in calls, refresh-once, proxy session
    shell/                Sidebar and navbar config per area
    validation.ts         Yup schemas (the backend's own rules)
  types/                  Shared TypeScript types (api, auth, next-auth, …)
```

## Theme

Design direction **Graphite & Teal**: a graphite sidebar, a light work area and a deep teal
accent, with a matching dark mode. Every colour is a CSS variable in `src/app/globals.css`
(`:root` for light, `.dark` for dark), including the status colours (`--status-*`) and the
data-table header (`--table-header`). Components use only these tokens, so a palette change is
made in one file. Fonts are Geist and Geist Mono.

The theme follows the operating system by default and can be switched from the navbar or
**Settings → Appearance**.

## Static data

Search the code for `TODO(api)` to find every placeholder:

- `components/pages/*/constants/*.constants.ts` — emulators, dashboard series, admin areas,
  settings
- `lib/shell/*.shell.tsx` — notifications and host capacity in the app chrome
- `lib/sample-time.ts` — sample timestamps are relative to a fixed `SAMPLE_NOW`, so prerendered
  and hydrated output match. Live data is formatted against the real time after mount (`useNow`).

## Dates and time zones

All date logic uses Day.js (`src/lib/dayjs.ts`). Dates and times are shown in the time zone of
the viewer's machine through `<LocalTime>`: India sees IST, New York sees Eastern time. Time zone
pickers list every IANA zone with its current UTC offset (`TimezoneSelect`).

## Renaming the app

The product name is a placeholder. Change `APP_NAME` in `src/lib/brand.ts`; the sidebar, page
titles and settings pick it up.
