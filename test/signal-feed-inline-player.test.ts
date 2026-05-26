import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = () => readFileSync("src/components/dashboard/signal-feed.tsx", "utf8");

test("signal feed renders uploaded spots with an inline Mux player", () => {
  const text = source();

  assert.match(text, /dynamic\(\(\) => import\("@mux\/mux-player-react"\)/);
  assert.match(text, /ssr: false/);
  assert.match(text, /function getSpotPlaybackId/);
  assert.match(text, /update\.type !== "SPOT_ADDED"/);
  assert.match(text, /<SpotInlinePlayer update=\{update\} compact \/>/);
  assert.match(text, /<SpotInlinePlayer update=\{update\} \/>/);
  assert.match(text, /playbackId=\{playbackId\}/);
});
