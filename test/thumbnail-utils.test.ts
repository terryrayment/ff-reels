import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMuxThumbnailUrl,
  getProjectThumbnailUrl,
} from "../src/lib/thumbnails";

test("Mux thumbnails preserve curated time while requesting display size", () => {
  const url = buildMuxThumbnailUrl(
    "playback123",
    960,
    540,
    "https://image.mux.com/playback123/thumbnail.jpg?time=12.4"
  );

  assert.equal(
    url,
    "https://image.mux.com/playback123/thumbnail.jpg?time=12.4&width=960&height=540&fit_mode=smartcrop"
  );
});

test("Mux playback IDs win over stale non-Mux thumbnails", () => {
  assert.equal(
    getProjectThumbnailUrl(
      {
        muxPlaybackId: "mux123",
        thumbnailUrl: "/api/projects/project123/thumbnail?key=old",
      },
      960,
      540
    ),
    "https://image.mux.com/mux123/thumbnail.jpg?width=960&height=540&fit_mode=smartcrop"
  );
});

test("Non-video projects keep their stored thumbnail", () => {
  assert.equal(
    getProjectThumbnailUrl(
      {
        muxPlaybackId: null,
        thumbnailUrl: "/api/projects/project123/thumbnail?key=still",
      },
      960,
      540
    ),
    "/api/projects/project123/thumbnail?key=still"
  );
});
