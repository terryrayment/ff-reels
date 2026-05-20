import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("sidebar renders Leads as a dropdown with both lead tables", () => {
  const source = read("src/components/layout/sidebar.tsx");

  assert.match(source, /aria-expanded=\{leadsOpen\}/);
  assert.match(source, /\/leads\/midwest/);
  assert.match(source, /\/leads\/west-coast-brand/);
  assert.match(source, /WEST COAST - BRAND/);
});

test("West Coast Brand page uses the GitHub Projects-backed table", () => {
  const source = read("src/app/(dashboard)/leads/west-coast-brand/page.tsx");

  assert.match(source, /WEST COAST - BRAND/);
  assert.match(source, /GitHubProjectTable/);
  assert.match(source, /Open GitHub/);
});

test("West Coast Brand API uses the GitHub project URL and token fallback", () => {
  const source = read("src/app/api/leads/west-coast-brand/route.ts");
  const config = read("src/lib/github-projects.ts");
  const env = read(".env.example");

  assert.match(config, /users\/terryrayment\/projects\/3/);
  assert.match(config, /GITHUB_PROJECT_TOKEN/);
  assert.match(env, /GITHUB_PROJECT_TOKEN/);
  assert.match(source, /updateProjectV2ItemFieldValue/);
});
