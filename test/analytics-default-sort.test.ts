import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("analytics table opens sorted by last sent, not last viewed", () => {
  const source = readFileSync("src/components/analytics/reel-analytics-table.tsx", "utf8");

  assert.match(source, /const \[sortKey, setSortKey\] = useState<SortKey>\("lastSent"\)/);
  assert.match(source, /const \[sortDir, setSortDir\] = useState<"asc" \| "desc">\("desc"\)/);
  assert.doesNotMatch(source, /useState<SortKey>\("lastViewed"\)/);
});
