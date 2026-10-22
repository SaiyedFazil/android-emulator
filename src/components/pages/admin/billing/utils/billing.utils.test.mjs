// Run with `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";

import { billingTotals, revenueByMonth } from "./billing.utils.ts";

test("the current month is marked as partial in the revenue chart", () => {
  const months = revenueByMonth();
  assert.match(months.at(-1).month, /to date/);
  for (const month of months.slice(0, -1)) assert.doesNotMatch(month.month, /to date/);
});

test("collections this month are shown against what was billed this month", () => {
  const totals = billingTotals();
  assert.equal(typeof totals.billedThisMonth, "number");
  assert.ok(totals.billedThisMonth >= totals.collectedThisMonth);
  assert.ok(totals.billedThisMonth >= totals.outstanding);
});
