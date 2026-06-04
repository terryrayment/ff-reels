import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("screening company roster links director thumbnails and names to the public site", () => {
  const source = readFileSync("src/components/video/screening-carousel.tsx", "utf8");
  const rosterBlock = source.match(/\{rosterHighlights\.map\(\(d\) => \([\s\S]*?\)\)\}/)?.[0] ?? "";

  assert.match(source, /const FF_DIRECTOR_URL = "https:\/\/www\.friendsandfamily\.tv\/directors"/);
  assert.match(rosterBlock, /href=\{`\$\{FF_DIRECTOR_URL\}\/\$\{d\.slug\}`\}/);
  assert.match(rosterBlock, /src=\{d\.headshotUrl\}/);
  assert.match(rosterBlock, /\{d\.name\}/);
  assert.doesNotMatch(rosterBlock, /reels\.friendsandfamily\.tv\/directors\/\$\{d\.id\}/);
});
