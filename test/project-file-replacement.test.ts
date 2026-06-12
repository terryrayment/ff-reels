import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("project replacement starts a new Mux upload on the existing project", () => {
  const source = read("src/app/api/projects/[id]/replace/route.ts");

  assert.match(source, /\["ADMIN",\s*"PRODUCER",\s*"REP"\]/);
  assert.match(source, /mux\.video\.uploads\.create/);
  assert.match(source, /prisma\.project\.findUnique/);
  assert.match(source, /prisma\.project\.update/);
  assert.doesNotMatch(source, /prisma\.project\.create/);
  assert.match(source, /muxUploadId:\s*upload\.id/);
  assert.doesNotMatch(source, /muxStatus:\s*"waiting"/);
  assert.doesNotMatch(source, /muxPlaybackId:\s*null/);
  assert.doesNotMatch(source, /r2Key\s*[:,]\s*r2Key/);
});

test("project replacement confirm commits the new original only after R2 upload", () => {
  const source = read("src/app/api/projects/[id]/replace/complete/route.ts");

  assert.match(source, /\["ADMIN",\s*"PRODUCER",\s*"REP"\]/);
  assert.match(source, /startsWith\(expectedPrefix\)/);
  assert.match(source, /r2Key/);
  assert.match(source, /originalFilename:\s*filename/);
  assert.match(source, /fileSizeMb/);
  assert.doesNotMatch(source, /muxPlaybackId:\s*null/);
});

test("director portfolio exposes a replace-file action without creating a new spot", () => {
  const source = read("src/components/directors/director-spots.tsx");

  assert.match(source, /Replace file/);
  assert.match(source, /replaceTarget/);
  assert.match(source, /fetch\(`\/api\/projects\/\$\{replaceTarget\.id\}\/replace`/);
  assert.match(source, /fetch\(`\/api\/projects\/\$\{replaceTarget\.id\}\/replace\/complete`/);
  assert.match(source, /muxUpload\.open\("PUT",\s*muxUploadUrl\)/);
  assert.match(source, /method:\s*"PUT"/);
  assert.match(source, /router\.refresh\(\)/);
  assert.doesNotMatch(source, /fetch\("\/api\/upload"/);
});

test("director replacement keeps going when the optional R2 archive upload fails", () => {
  const source = read("src/components/directors/director-spots.tsx");

  assert.match(source, /let archivedOriginal = false/);
  assert.match(source, /R2 replacement archive failed/);
  assert.match(source, /if \(archivedOriginal\)/);
  assert.doesNotMatch(source, /throw new Error\("Original archive upload failed\."\)/);
  assert.doesNotMatch(source, /throw new Error\("Original archive could not be confirmed\."\)/);
});
