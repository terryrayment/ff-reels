import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("build reel spot preview opens in a fixed lightbox instead of an inline panel", () => {
  const source = readFileSync("src/components/reels/reel-builder.tsx", "utf8");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /fixed inset-0/);
  assert.match(source, /onClick=\{\(\) => setPreviewProject\(null\)\}/);
  assert.match(source, /e\.key === "Escape"/);
  assert.match(source, /Preview lightbox/);
  assert.doesNotMatch(source, /mb-5 overflow-hidden rounded-lg bg\[#111\]/);
});
