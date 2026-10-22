// Run with `npm test` (Node's built-in runner; Node strips the TypeScript types on import).
import assert from "node:assert/strict";
import { test } from "node:test";

import { formatCurrency, formatDate, formatPrice } from "./format.ts";

test("formatCurrency shows whole dollars without cents and keeps real cents", () => {
  assert.equal(formatCurrency(0), "$0");
  assert.equal(formatCurrency(4900), "$49");
  assert.equal(formatCurrency(4950), "$49.50");
  assert.equal(formatCurrency(1290000), "$12,900");
});

test("formatCurrency compact", () => {
  assert.equal(formatCurrency(1290000, { compact: true }), "$12.9K");
});

test("formatPrice reads a missing price as Custom", () => {
  assert.equal(formatPrice(null), "Custom");
  assert.equal(formatPrice(1900), "$19");
});

test("formatDate is a UTC calendar date", () => {
  assert.equal(formatDate("2026-10-19T09:00:00.000Z"), "Oct 19, 2026");
});
