import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const r2Source = readFileSync("src/lib/r2/client.ts", "utf8");
const downloadsSource = readFileSync("src/lib/mux/downloads.ts", "utf8");

test("project downloads verify R2 originals before returning signed URLs", () => {
  assert.match(r2Source, /HeadObjectCommand/);
  assert.match(r2Source, /export async function objectExists/);
  assert.match(r2Source, /if \(!R2_CONFIGURED\) return false/);
  assert.match(downloadsSource, /import \{ getDownloadUrl, objectExists \} from "@\/lib\/r2\/client"/);
  assert.match(downloadsSource, /if \(project\.r2Key && await objectExists\(project\.r2Key\)\)/);
  assert.doesNotMatch(downloadsSource, /if \(project\.r2Key\) \{\s*const ext/);
});
