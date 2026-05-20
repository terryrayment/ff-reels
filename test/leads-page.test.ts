import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getLeadsPasswordHint } from "../src/lib/leads-access.ts";

const pageSource = () => readFileSync("src/app/(dashboard)/leads/page.tsx", "utf8");

test("leads page uses the Midwest Leads label", () => {
  const source = pageSource();

  assert.match(source, /Midwest Leads/);
  assert.doesNotMatch(source, /CCCo Leads/);
});

test("leads page keeps the Airtable share password configured", () => {
  assert.equal(getLeadsPasswordHint(), "ccco26");
});
