import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getLeadsPasswordHint } from "../src/lib/leads-access.ts";

const pageSource = () =>
  readFileSync("src/app/(dashboard)/leads/midwest/page.tsx", "utf8");

test("leads page uses the Midwest Leads label", () => {
  const source = pageSource();

  assert.match(source, /Midwest Leads/);
  assert.doesNotMatch(source, /CCCo Leads/);
});

test("leads root redirects to the Midwest leads table", () => {
  const source = readFileSync("src/app/(dashboard)/leads/page.tsx", "utf8");

  assert.match(source, /redirect\("\/leads\/midwest"\)/);
});

test("leads page keeps the Airtable share password configured", () => {
  assert.equal(getLeadsPasswordHint(), "ccco26");
});
