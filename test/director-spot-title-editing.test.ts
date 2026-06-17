import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/components/directors/director-spots.tsx", "utf8");
const apiSource = readFileSync("src/app/api/projects/[id]/route.ts", "utf8");
const directorPageSource = readFileSync("src/app/(dashboard)/directors/[id]/page.tsx", "utf8");

test("director spot cards expose client and title as separate editable fields", () => {
  assert.match(source, /type EditableSpotField = "brand" \| "title"/);
  assert.match(source, /aria-label=\{`Edit client for \$\{project\.title\}`\}/);
  assert.match(source, /title="Edit client"/);
  assert.match(source, /startEditing\(project\.id, "brand", project\.brand \?\? ""\)/);
  assert.match(source, /aria-label=\{`Edit title for \$\{project\.title\}`\}/);
  assert.match(source, /title="Edit spot title"/);
  assert.match(source, /startEditing\(project\.id, "title", project\.title\)/);
  assert.match(directorPageSource, /<DirectorSpots[\s\S]*canEditNames[\s\S]*\/>/);
});

test("spot metadata edits save to the project brand or title field", () => {
  assert.match(source, /fetch\(`\/api\/projects\/\$\{projectId\}`/);
  assert.match(source, /const payload = editingField === "brand"[\s\S]*\{ brand: trimmed \|\| null \}[\s\S]*\{ title: trimmed \}/);
  assert.match(source, /body: JSON\.stringify\(payload\)/);
  assert.match(apiSource, /if \(session\.user\.role === "DIRECTOR"\)/);
  assert.match(apiSource, /data: \{ title \}/);
  assert.match(apiSource, /\.\.\.\(brand !== undefined && \{ brand \}\)/);
});
