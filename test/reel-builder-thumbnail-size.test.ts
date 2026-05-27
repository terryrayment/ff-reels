import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("reel builder spot thumbnails are 25 percent larger", () => {
  const source = readFileSync("src/components/reels/reel-builder.tsx", "utf8");

  assert.match(source, /max-w-\[295px\]/);
  assert.match(source, /w-\[105%\]/);
  assert.match(source, /min-h-\[198px\]/);
  assert.match(source, /md:min-h-\[223px\]/);
});
