// Run with `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";

import { usageLevel } from "./usage.ts";

test("usageLevel grades how full a limit is", () => {
  assert.deepEqual(usageLevel(3, 10), { fraction: 0.3, level: "ok" });
  assert.deepEqual(usageLevel(8, 10), { fraction: 0.8, level: "high" });
  assert.deepEqual(usageLevel(10, 10), { fraction: 1, level: "full" });
  assert.deepEqual(usageLevel(1, 1), { fraction: 1, level: "full" });
});

test("usageLevel clamps the bar when usage goes over the limit", () => {
  assert.deepEqual(usageLevel(11, 10), { fraction: 1, level: "over" });
});

test("usageLevel survives a zero limit", () => {
  assert.deepEqual(usageLevel(0, 0), { fraction: 0, level: "ok" });
  assert.deepEqual(usageLevel(2, 0), { fraction: 1, level: "over" });
});
