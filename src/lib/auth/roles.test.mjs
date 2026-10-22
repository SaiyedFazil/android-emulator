// Run with `npm test` (Node's built-in runner; Node strips the TypeScript types on import).
import assert from "node:assert/strict";
import { test } from "node:test";

import { areaOf, demoRoleFor, resolveAccess, safeNext } from "./roles.ts";

test("areaOf classifies paths, matching /admin only as a whole segment", () => {
  assert.equal(areaOf("/login"), "public");
  assert.equal(areaOf("/admin"), "admin");
  assert.equal(areaOf("/admin/"), "admin");
  assert.equal(areaOf("/admin/organizations/org_northwind/users"), "admin");
  assert.equal(areaOf("/administrator"), "console");
  assert.equal(areaOf("/dashboard"), "console");
});

test("resolveAccess keeps each role inside its own area", () => {
  assert.deepEqual(resolveAccess(null, "/dashboard"), { redirect: "/login?next=%2Fdashboard" });
  assert.deepEqual(resolveAccess(null, "/login"), { allow: true });
  assert.deepEqual(resolveAccess("user", "/admin/dashboard"), { redirect: "/dashboard" });
  assert.deepEqual(resolveAccess("admin", "/emulators"), { redirect: "/admin/dashboard" });
  assert.deepEqual(resolveAccess("admin", "/admin/plans"), { allow: true });
  assert.deepEqual(resolveAccess("user", "/login"), { redirect: "/dashboard" });
});

test("safeNext only honours a same-site path inside the role's area", () => {
  assert.equal(safeNext("admin", "/admin/users"), "/admin/users");
  assert.equal(safeNext("user", "/admin/users"), "/dashboard");
  assert.equal(safeNext("user", "https://evil.example"), "/dashboard");
  assert.equal(safeNext("user", "//evil.example"), "/dashboard");
  assert.equal(safeNext("user", null), "/dashboard");
});

test("safeNext rejects paths that browsers resolve to another site", () => {
  // Browsers drop tabs and newlines while parsing, so "/\t/evil.example" becomes "//evil.example".
  assert.equal(safeNext("user", "/\t/evil.example"), "/dashboard");
  assert.equal(safeNext("user", "/\n/evil.example"), "/dashboard");
  assert.equal(safeNext("user", "/\r\n/evil.example"), "/dashboard");
  assert.equal(safeNext("user", "/\\evil.example"), "/dashboard");
  assert.equal(
    safeNext("admin", "/admin/users?status=invited#top"),
    "/admin/users?status=invited#top"
  );
});

test("demoRoleFor picks admin for identifiers containing 'admin'", () => {
  assert.equal(demoRoleFor("Admin@corp.com"), "admin");
  assert.equal(demoRoleFor("ops@corp.com"), "user");
});
