/**
 * Auto-pick best thumbnails for all projects using AI frame scoring.
 *
 * Usage:
 *   npx tsx scripts/auto-pick-thumbnails.ts                    # all projects missing thumbnails
 *   npx tsx scripts/auto-pick-thumbnails.ts --dry-run          # preview without saving
 *   npx tsx scripts/auto-pick-thumbnails.ts --director "Alan Ferguson"
 *   npx tsx scripts/auto-pick-thumbnails.ts --force            # re-score even if thumbnail exists
 */

import { PrismaClient } from "@prisma/client";
import { pickBestThumbnail } from "../src/lib/gallery/frame-scorer";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const directorIdx = args.indexOf("--director");
const directorName = directorIdx >= 0 ? args[directorIdx + 1] : null;

async function main() {
  console.log("──────────────────────────────────────────────────");
  console.log("  Auto-Pick Best Thumbnails (AI Frame Scoring)");
  console.log("──────────────────────────────────────────────────");
  if (dryRun) console.log("  Mode: DRY RUN (no changes will be saved)");
  if (force) console.log("  Mode: FORCE (re-scoring existing thumbnails)");
  if (directorName) console.log(`  Director: ${directorName}`);
  console.log("");

  // Build filter
  const where: Record<string, unknown> = {
    muxPlaybackId: { not: null },
    duration: { gt: 0 },
  };

  if (!force) {
    where.thumbnailUrl = null;
  }

  if (directorName) {
    where.director = { name: { contains: directorName, mode: "insensitive" } };
  }

  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      title: true,
      muxPlaybackId: true,
      duration: true,
      thumbnailUrl: true,
      director: { select: { name: true } },
    },
    orderBy: [{ director: { name: "asc" } }, { title: "asc" }],
  });

  console.log(`  Found ${projects.length} projects to score\n`);

  if (projects.length === 0) {
    console.log("  Nothing to do.");
    return;
  }

  let scored = 0;
  let failed = 0;
  let currentDirector = "";

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];

    // Print director header
    if (p.director.name !== currentDirector) {
      currentDirector = p.director.name;
      console.log(`\n  ── ${currentDirector} ──`);
    }

    process.stdout.write(
      `  [${i + 1}/${projects.length}] "${p.title}" (${p.duration!.toFixed(0)}s)... `
    );

    try {
      const result = await pickBestThumbnail({
        id: p.id,
        muxPlaybackId: p.muxPlaybackId!,
        duration: p.duration!,
      });

      if (result) {
        if (!dryRun) {
          await prisma.project.update({
            where: { id: p.id },
            data: { thumbnailUrl: result.url },
          });
        }
        console.log(
          `✓ time=${result.time}s score=${result.score}/10 (${result.candidateCount} candidates)${dryRun ? " [dry-run]" : ""}`
        );
        scored++;
      } else {
        console.log("⚠ no result");
        failed++;
      }
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : "unknown error"}`);
      failed++;
    }

    // Rate limit: 500ms between projects
    if (i < projects.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log("\n──────────────────────────────────────────────────");
  console.log(`  ✓ Scored: ${scored}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log("──────────────────────────────────────────────────");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
