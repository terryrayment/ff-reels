import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

test("spot upload UIs send brand agency and year metadata to the API", () => {
  const uploadFiles = sourceFiles("src").filter((file) =>
    readFileSync(file, "utf8").includes('fetch("/api/upload"')
  );

  assert.deepEqual(uploadFiles.sort(), [
    "src/components/directors/upload-button.tsx",
    "src/components/upload/upload-manager.tsx",
  ]);

  for (const file of uploadFiles) {
    const source = readFileSync(file, "utf8");
    const uploadBody = source.match(/body:\s*JSON\.stringify\(\{[\s\S]*?fileSizeMb:[\s\S]*?\}\),/)?.[0] ?? "";

    assert.match(uploadBody, /brand:\s*brand\.trim\(\)\s*\|\|\s*undefined/, file);
    assert.match(uploadBody, /agency:\s*agency\.trim\(\)\s*\|\|\s*undefined/, file);
    assert.match(uploadBody, /year:\s*year\.trim\(\)\s*\|\|\s*undefined/, file);
  }
});

test("upload API stores optional spot metadata", () => {
  const source = readFileSync("src/app/api/upload/route.ts", "utf8");

  assert.match(source, /brand,\s*agency,\s*year/);
  assert.match(source, /brand:\s*brand\s*\|\|\s*null/);
  assert.match(source, /agency:\s*agency\s*\|\|\s*null/);
  assert.match(source, /year:\s*year\s*\?\s*parseInt\(year\)\s*:\s*null/);
});

test("reel builder shows search misses separately from empty directors", () => {
  const source = readFileSync("src/components/reels/reel-builder.tsx", "utf8");

  assert.match(source, /spotSearch\.trim\(\)/);
  assert.match(source, /No spots match/);
  assert.match(source, /Clear search/);
});
