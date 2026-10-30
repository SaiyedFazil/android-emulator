// Run with `npm test` (Node's built-in runner; Node strips the TypeScript types on import).
import assert from "node:assert/strict";
import { test } from "node:test";

import { refreshOnce } from "./refresh-once.ts";

test("concurrent callers with one refresh token share one backend call", async () => {
  let calls = 0;
  const run = async () => {
    calls += 1;
    return { accessToken: `access-${calls}` };
  };

  const results = await Promise.all([
    refreshOnce("token-a", run),
    refreshOnce("token-a", run),
    refreshOnce("token-a", run),
  ]);

  assert.equal(calls, 1);
  assert.deepEqual(results, [
    { accessToken: "access-1" },
    { accessToken: "access-1" },
    { accessToken: "access-1" },
  ]);
});

test("a later caller within the window gets the same result", async () => {
  let calls = 0;
  const run = async () => ++calls;

  await refreshOnce("token-b", run, 0);
  assert.equal(await refreshOnce("token-b", run, 119_999), 1);
  assert.equal(calls, 1);
});

test("a failed refresh is not shared: the next caller tries again", async () => {
  let calls = 0;
  const failing = async () => {
    calls += 1;
    throw new Error("API down");
  };

  await assert.rejects(refreshOnce("token-c", failing));
  await assert.rejects(refreshOnce("token-c", failing));
  assert.equal(calls, 2);
});

test("an entry is forgotten once its window has passed", async () => {
  let calls = 0;
  const run = async () => ++calls;

  await refreshOnce("token-d", run, 0);
  assert.equal(await refreshOnce("token-d", run, 120_000), 2);
});

test("different refresh tokens do not share", async () => {
  let calls = 0;
  const run = async () => ++calls;

  await Promise.all([refreshOnce("token-e", run), refreshOnce("token-f", run)]);
  assert.equal(calls, 2);
});
