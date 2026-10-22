// Smoke-checks every route against a running server: status code, and a piece of text that only
// renders when the page works. Usage: `npm run build && npm run start`, then
// `npm run check:routes [baseUrl]` (default http://localhost:3000).

// Prefer text only the page body renders: every admin page embeds organization and user names
// (breadcrumb lookup), so a bare name proves nothing.
/** @type {[path: string, status: number, text?: string][]} */
const ROUTES = [
  ["/login", 200, "Welcome back"],
  ["/dashboard", 200, "Dashboard"],
  ["/admin", 307],
  ["/admin/dashboard", 200, "Platform console"],
  ["/admin/dashboard", 200, "Needs attention"],
  ["/admin/dashboard", 200, "Monthly recurring revenue"],
  ["/admin/dashboard", 200, "2 trialing · 1 past due · 2 suspended"],
  ["/admin/organizations", 200, "Sep 4, 2025"],
  ["/admin/organizations", 200, "Over limit"],
  ["/admin/organizations/org_northwind", 200, "Current plan"],
  ["/admin/organizations/org_northwind/users", 200, "priya.sharma@northwind.dev"],
  ["/admin/organizations/org_helix", 200, "Over limit"],
  // {nonce} makes every run a first visit: a cached 404 must not hide a first-hit 200.
  ["/admin/organizations/missing-{nonce}", 404],
  ["/admin/organizations/missing-{nonce}/users", 404],
  ["/admin/organizations/org_northwind/emulators", 200, "emulator-5554"],
  ["/admin/organizations/org_quartz/emulators", 200, "No emulators yet"],
  ["/admin/organizations/org_quartz/billing", 200, "No invoices yet"],
  ["/admin/organizations/org_helix/billing", 200, "Failed"],
  ["/admin/organizations/org_northwind/activity", 200, "on Business (yearly)"],
  ["/admin/users", 200, "daniel.okafor@northwind.dev"],
  ["/admin/users/usr_priya", 200, "Sign out everywhere"],
  ["/admin/users/usr_priya", 200, "priya.sharma@northwind.dev"],
  ["/admin/users/missing-{nonce}", 404],
  ["/admin/plans", 200, "Concurrent emulators"],
  ["/admin/plans", 200, "Custom"],
  ["/admin/subscriptions", 200, "Past due"],
  ["/admin/subscriptions", 200, "Cancelling"],
  ["/admin/billing", 200, "Outstanding"],
  ["/admin/billing", 200, "Refunded"],
  ["/admin/billing", 200, "Collected so far"],
  ["/admin/emulators", 200, "emulator-5554"],
  ["/admin/emulators", 200, "Organization"],
  ["/admin/hosts", 200, "Degraded"],
  ["/admin/hosts", 200, "10.40.0.22"],
  ["/admin/audit-log", 200, "Blocked repeated sign-in attempts from 45.33.12.8"],
  ["/admin/team", 200, "riya.kapoor@example.com"],
  ["/admin/team", 200, "Read-only"],
  ["/admin/settings", 200, "Maintenance mode"],
  ["/admin/settings", 200, "Not connected"],
  ["/admin/profile", 200, "Firefox on Linux"],
  ["/profile", 200, "Chrome on Windows"],
];

const base = process.argv[2] ?? "http://localhost:3000";
const nonce = Date.now().toString(36);
let failures = 0;

for (const [pattern, status, text] of ROUTES) {
  const path = pattern.replace("{nonce}", nonce);
  let problem = "";
  try {
    const response = await fetch(base + path, { redirect: "manual" });
    const body = await response.text();
    if (response.status !== status) problem = `status ${response.status}, expected ${status}`;
    else if (text && !body.includes(text)) problem = `missing text "${text}"`;
  } catch (error) {
    problem = String(error);
  }
  if (problem) failures++;
  console.log(`${problem ? "FAIL" : "PASS"}  ${path}${problem ? `  (${problem})` : ""}`);
}

console.log(`\n${ROUTES.length - failures}/${ROUTES.length} routes passed`);
// exitCode, not exit(): exiting while fetch sockets close trips a libuv assertion on Windows.
process.exitCode = failures ? 1 : 0;
