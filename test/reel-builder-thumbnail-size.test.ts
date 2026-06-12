import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("reel builder spot cards keep larger thumbnails in a tighter media well", () => {
  const source = readFileSync("src/components/reels/reel-builder.tsx", "utf8");

  assert.match(source, /max-w-\[295px\]/);
  assert.match(source, /w-\[105%\]/);
  assert.match(source, /min-h-\[168px\]/);
  assert.match(source, /md:min-h-\[184px\]/);
  assert.match(source, /px-4 py-4/);
  assert.doesNotMatch(source, /min-h-\[198px\]/);
  assert.doesNotMatch(source, /md:min-h-\[223px\]/);
});
