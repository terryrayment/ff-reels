import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/components/directors/director-spots.tsx", "utf8");
const apiSource = readFileSync("src/app/api/projects/[id]/route.ts", "utf8");
const directorPageSource = readFileSync("src/app/(dashboard)/directors/[id]/page.tsx", "utf8");

test("director spot titles are directly editable from the card title", () => {
  assert.match(source, /aria-label=\{`Edit title for \$\{project\.title\}`\}/);
  assert.match(source, /title="Edit spot title"/);
  assert.match(source, /startEditing\(project\.id, project\.title\)/);
  assert.match(directorPageSource, /<DirectorSpots[\s\S]*canEditNames[\s\S]*\/>/);
});

test("spot title edits save to the project title field", () => {
  assert.match(source, /fetch\(`\/api\/projects\/\$\{projectId\}`/);
  assert.match(source, /body: JSON\.stringify\(\{ title: trimmed \}\)/);
  assert.match(apiSource, /if \(session\.user\.role === "DIRECTOR"\)/);
  assert.match(apiSource, /data: \{ title \}/);
});
