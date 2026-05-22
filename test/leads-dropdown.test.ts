import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("sidebar renders Leads as a dropdown with both lead tables", () => {
  const source = read("src/components/layout/sidebar.tsx");

  assert.match(source, /aria-expanded=\{leadsOpen\}/);
  assert.match(source, /\/leads\/midwest/);
  assert.match(source, /\/leads\/west-coast-brand/);
  assert.match(source, /West Coast - Brand/);
  assert.match(source, /normal-case/);
  assert.doesNotMatch(source, /WEST COAST - BRAND/);
});

test("West Coast Brand page uses the app-native editable table", () => {
  const source = read("src/app/(dashboard)/leads/west-coast-brand/page.tsx");

  assert.match(source, /West Coast - Brand/);
  assert.doesNotMatch(source, /WEST COAST - BRAND/);
  assert.match(source, /WestCoastBrandTable/);
  assert.match(source, /Open GitHub/);
});

test("West Coast Brand table status copy stays title case", () => {
  const source = read("src/components/leads/west-coast-brand-table.tsx");

  assert.match(source, /Loading West Coast - Brand/);
  assert.match(source, /West Coast - Brand could not load\./);
  assert.doesNotMatch(source, /WEST COAST - BRAND/);
});

test("West Coast Brand API seeds and edits app contacts without a GitHub token", () => {
  const source = read("src/app/api/leads/west-coast-brand/route.ts");
  const config = read("src/lib/github-projects.ts");
  const seed = read("src/lib/west-coast-brand-leads.ts");

  assert.match(config, /users\/terryrayment\/projects\/3/);
  assert.doesNotMatch(source, /GITHUB_PROJECT_TOKEN/);
  assert.doesNotMatch(source, /updateProjectV2ItemFieldValue/);
  assert.match(source, /prisma\.contact/);
  assert.match(source, /seedIfNeeded/);
  assert.match(seed, /Chris Power/);
  assert.match(seed, /Brandon Millman/);
});
