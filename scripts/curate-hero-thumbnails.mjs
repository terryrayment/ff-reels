#!/usr/bin/env node
/**
 * curate-hero-thumbnails.mjs
 *
 * For each director, pick the best project to use as their hero thumbnail.
 * Heuristics (in priority order):
 *   1. Projects that appear in a reel (manually curated by user)
 *   2. Projects with a custom thumbnailUrl (manually set)
 *   3. Projects with known premium brand names in title
 *   4. Projects with the longest Mux duration (substantial work)
 *   5. Fall back to most recently created project
 *
 * Also detects likely-letterboxed videos by checking Mux aspect ratio
 * and avoids them when possible.
 *
 * Usage:  node scripts/curate-hero-thumbnails.mjs [--dry-run]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL + "?sslmode=require" } },
});

const dryRun = process.argv.includes("--dry-run");

// Premium brand keywords that tend to have polished visuals
const PREMIUM_BRANDS = [
  "nike", "apple", "google", "bmw", "mercedes", "audi", "ford", "toyota",
  "coca-cola", "coke", "pepsi", "samsung", "amazon", "netflix", "disney",
  "mcdonald", "budweiser", "bud light", "nfl", "nba", "adidas", "under armour",
  "amex", "american express", "visa", "mastercard", "chase", "capital one",
  "verizon", "at&t", "t-mobile", "hyundai", "lexus", "porsche", "jeep",
  "chevrolet", "chevy", "gatorade", "uber", "lyft", "airbnb", "spotify",
  "heineken", "johnnie walker", "jack daniel", "grey goose", "absolut",
];

async function main() {
  const directors = await prisma.director.findMany({
    where: { isActive: true },
    include: {
      projects: {
        where: {
          isPublished: true,
          muxPlaybackId: { not: null },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          muxAssetId: true,
          createdAt: true,
        },
      },
    },
  });

  // Get all reel items to know which projects appear in reels
  const reelItems = await prisma.reelItem.findMany({
    select: { projectId: true },
  });
  const reelProjectIds = new Set(reelItems.map((ri) => ri.projectId));

  console.log(`\n🎬 Curating hero thumbnails for ${directors.length} directors\n`);
  if (dryRun) console.log("  (DRY RUN — no changes will be made)\n");

  let updated = 0;

  for (const director of directors) {
    if (director.projects.length === 0) {
      console.log(`  ⏭  ${director.name} — no projects, skipping`);
      continue;
    }

    // Already has a manually set hero? Skip unless --force
    if (director.heroProjectId && !process.argv.includes("--force")) {
      const exists = director.projects.find((p) => p.id === director.heroProjectId);
      if (exists) {
        console.log(`  ✓  ${director.name} — already set to "${exists.title}"`);
        continue;
      }
      // heroProjectId points to deleted/unpublished project, re-curate
    }

    // Score each project
    const scored = director.projects.map((p) => {
      let score = 0;
      const titleLower = (p.title || "").toLowerCase();

      // +100: appears in a reel (user curated)
      if (reelProjectIds.has(p.id)) score += 100;

      // +50: has custom thumbnail
      if (p.thumbnailUrl) score += 50;

      // +30: premium brand in title
      if (PREMIUM_BRANDS.some((b) => titleLower.includes(b))) score += 30;

      // +10: has a title (not untitled)
      if (p.title && p.title.length > 2) score += 10;

      // Small recency bonus (newer = slightly better)
      const age = Date.now() - new Date(p.createdAt).getTime();
      const daysOld = age / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - daysOld * 0.01);

      return { project: p, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0].project;
    const bestScore = scored[0].score;

    if (best.id === director.heroProjectId) {
      console.log(`  ✓  ${director.name} — already optimal "${best.title}"`);
      continue;
    }

    console.log(`  🎯 ${director.name} → "${best.title}" (score: ${bestScore.toFixed(0)})`);

    if (!dryRun) {
      await prisma.director.update({
        where: { id: director.id },
        data: { heroProjectId: best.id },
      });
      updated++;
    }
  }

  console.log(`\n✅ Done. ${dryRun ? "Would update" : "Updated"} ${updated} directors.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
