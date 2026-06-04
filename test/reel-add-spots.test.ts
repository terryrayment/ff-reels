import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("add-spots modal prioritizes and searches newly uploaded spot metadata", () => {
  const source = readFileSync("src/components/reels/add-spots-modal.tsx", "utf8");

  assert.match(source, /createdAt:\s*string/);
  assert.match(source, /originalFilename:\s*string\s*\|\s*null/);
  assert.match(source, /new Date\(b\.createdAt\)\.getTime\(\) - new Date\(a\.createdAt\)\.getTime\(\)/);
  assert.match(source, /p\.originalFilename/);
  assert.match(source, /p\.year\?\.toString\(\)/);
});

test("director projects API returns newest projects as a deterministic tie-breaker", () => {
  const source = readFileSync("src/app/api/directors/[id]/projects/route.ts", "utf8");

  assert.match(source, /orderBy:\s*\[\s*\{ sortOrder:\s*"asc" \},\s*\{ createdAt:\s*"desc" \}\s*\]/);
});

test("reel item updates allow team roles to manage any reel", () => {
  const source = readFileSync("src/app/api/reels/[id]/items/route.ts", "utf8");

  assert.match(source, /\["ADMIN",\s*"PRODUCER",\s*"REP"\]/);
  assert.doesNotMatch(source, /session\.user\.role === "REP"/);
  assert.doesNotMatch(source, /return NextResponse\.json\(\{ error: "Forbidden" \}, \{ status: 403 \}\)/);
});
