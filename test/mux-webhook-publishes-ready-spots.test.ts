import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Mux asset-ready webhook publishes spots for reel builders", () => {
  const source = readFileSync("src/app/api/mux/webhook/route.ts", "utf8");
  const readyBlock = source.match(/case "video\.asset\.ready":[\s\S]*?break;/)?.[0] ?? "";

  assert.match(readyBlock, /muxStatus:\s*"ready"/);
  assert.match(readyBlock, /isPublished:\s*true/);
});
