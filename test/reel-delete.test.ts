import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("reels list exposes a confirmed delete action", () => {
  const source = readFileSync("src/components/reels/reels-list.tsx", "utf8");

  assert.match(source, /Trash2/);
  assert.match(source, /Delete reel/);
  assert.match(source, /setDeleteTarget/);
  assert.match(source, /method:\s*"DELETE"/);
  assert.match(source, /fetch\(`\/api\/reels\/\$\{deleteTarget\.id\}`/);
  assert.match(source, /router\.refresh\(\)/);
});

test("reel delete API allows team roles to delete any reel", () => {
  const source = readFileSync("src/app/api/reels/[id]/route.ts", "utf8");
  const deleteBlock = source.match(/export async function DELETE[\s\S]*?^}/m)?.[0] ?? "";

  assert.match(source, /\["ADMIN",\s*"PRODUCER",\s*"REP"\]/);
  assert.match(deleteBlock, /TEAM_ROLES\.includes\(session\.user\.role\)/);
  assert.doesNotMatch(deleteBlock, /session\.user\.role === "REP"/);
  assert.doesNotMatch(deleteBlock, /return NextResponse\.json\(\{ error: "Forbidden" \}, \{ status: 403 \}\)/);
  assert.match(deleteBlock, /prisma\.reel\.delete/);
});
