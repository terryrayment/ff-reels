import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("dashboard no longer renders or fetches Industry Pulse", () => {
  const source = readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");

  assert.doesNotMatch(source, /Industry Pulse/);
  assert.doesNotMatch(source, /industryFeed/);
  assert.doesNotMatch(source, /industryCredit\.findMany/);
});

