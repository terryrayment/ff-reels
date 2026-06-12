import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const teamRoles = /\["ADMIN",\s*"PRODUCER",\s*"REP"\]/;

test("reel APIs treat producer and rep as shared team roles", () => {
  const reelRoutes = [
    "src/app/api/reels/route.ts",
    "src/app/api/reels/[id]/route.ts",
    "src/app/api/reels/[id]/items/route.ts",
    "src/app/api/reels/[id]/duplicate/route.ts",
    "src/app/api/reels/[id]/screening-links/route.ts",
    "src/app/api/reels/[id]/gallery/generate/route.ts",
  ];

  for (const file of reelRoutes) {
    const source = read(file);
    assert.match(source, teamRoles, file);
    assert.doesNotMatch(source, /session\.user\.role === "REP"/, file);
  }

  const listRoute = read("src/app/api/reels/route.ts");
  const getBlock = listRoute.match(/export async function GET[\s\S]*?return NextResponse\.json\(reels\);/)?.[0] ?? "";
  assert.doesNotMatch(getBlock, /createdById:\s*session\.user\.id/);
});

test("reels library UI shows the shared reel library to reps", () => {
  const page = read("src/app/(dashboard)/reels/page.tsx");
  assert.doesNotMatch(page, /const isRep/);
  assert.doesNotMatch(page, /createdById:\s*session\.user\.id/);
  assert.doesNotMatch(page, /isRep=\{/);

  const list = read("src/components/reels/reels-list.tsx");
  assert.doesNotMatch(list, /isRep/);
  assert.doesNotMatch(list, / by you/);
});

test("dashboard and analytics default to team-wide data for team roles", () => {
  const dashboard = read("src/app/(dashboard)/dashboard/page.tsx");
  assert.match(dashboard, /const reelOwnerFilter =\s*showMine\s*\?/);
  assert.match(dashboard, /const viewOwnerFilter =\s*showMine\s*\?/);
  assert.doesNotMatch(dashboard, /!isAdmin \|\| showMine/);

  const analytics = read("src/app/(dashboard)/analytics/page.tsx");
  assert.match(analytics, /const reelOwnerFilter = \{\};/);
  assert.match(analytics, /const viewOwnerFilter = \{\};/);
  assert.match(analytics, /const ownerFilter = \{\};/);

  const reelAnalytics = read("src/app/(dashboard)/analytics/reel/[id]/page.tsx");
  assert.match(reelAnalytics, /const canSeeTeamReels = \["ADMIN", "PRODUCER", "REP"\]\.includes/);
  assert.doesNotMatch(reelAnalytics, /createdById:\s*session\.user\.id/);

  const linkAnalytics = read("src/app/(dashboard)/analytics/link/[id]/page.tsx");
  assert.doesNotMatch(linkAnalytics, /session\.user\.role === "REP"/);
});

test("producer surfaces are available to reps too", () => {
  const sidebar = read("src/components/layout/sidebar.tsx");
  assert.match(sidebar, /\{ href: "\/directors", label: "Directors", roles: \["ADMIN", "PRODUCER", "REP"\]/);
  assert.match(sidebar, /const canUpload = !isPreview && \["ADMIN", "PRODUCER", "REP"\]\.includes\(role\)/);

  const uploadPage = read("src/app/(dashboard)/upload/page.tsx");
  assert.match(uploadPage, /\["ADMIN", "PRODUCER", "REP"\]\.includes\(session\.user\.role\)/);

  const uploadApi = read("src/app/api/upload/route.ts");
  assert.match(uploadApi, teamRoles);

  const thumbnailApi = read("src/app/api/projects/[id]/thumbnail/route.ts");
  assert.match(thumbnailApi, teamRoles);

  for (const file of [
    "src/app/api/projects/[id]/replace/route.ts",
    "src/app/api/projects/[id]/replace/complete/route.ts",
  ]) {
    assert.match(read(file), teamRoles, file);
  }

  const quickReelPage = read("src/app/(dashboard)/reels/quick/page.tsx");
  assert.match(quickReelPage, teamRoles);

  for (const file of [
    "src/app/api/treatments/route.ts",
    "src/app/api/treatments/upload-url/route.ts",
    "src/app/api/treatments/[id]/route.ts",
  ]) {
    assert.match(read(file), teamRoles, file);
  }

  const treatmentsPage = read("src/app/(dashboard)/treatments/page.tsx");
  assert.match(treatmentsPage, /\["ADMIN", "PRODUCER", "REP"\]\.includes\(session\.user\.role\)/);
});

test("producer and rep both have client CRM access", () => {
  for (const file of [
    "src/app/api/contacts/route.ts",
    "src/app/api/contacts/[id]/route.ts",
    "src/app/api/contacts/search/route.ts",
    "src/app/api/companies/route.ts",
  ]) {
    assert.match(read(file), teamRoles, file);
  }
});
