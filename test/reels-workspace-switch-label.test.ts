import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("reels workspace switch labels the analytics tab as analytics", () => {
  const source = readFileSync("src/components/reels/reels-workspace-switch.tsx", "utf8");

  assert.match(source, /label: "Analytics"/);
  assert.doesNotMatch(source, /label: "Intelligence"/);
});
