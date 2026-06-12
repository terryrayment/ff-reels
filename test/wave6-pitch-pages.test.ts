import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const wave6Slugs = [
  "anduril",
  "liquid-death",
  "sweetgreen",
  "doen",
  "buck-mason",
  "perelel",
  "hexclad",
  "ramp",
  "clay",
  "studs",
  "astranis",
  "zipline",
  "redwood",
  "kobold",
  "world-labs",
];

test("wave 6 pitch companies have configs and vanity rewrites", () => {
  const companiesSource = readFileSync("src/lib/pitch/companies.ts", "utf8");
  const middlewareSource = readFileSync("src/middleware.ts", "utf8");

  for (const slug of wave6Slugs) {
    assert.match(
      companiesSource,
      new RegExp(`slug: "${slug}"`),
      `${slug} config is missing`
    );
    assert.match(
      middlewareSource,
      new RegExp(`"/${slug}": "/pitch/${slug}"`),
      `${slug} vanity rewrite is missing`
    );
  }
});
