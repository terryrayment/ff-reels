/**
 * Request Mux static MP4 renditions for existing assets.
 *
 * Usage:
 *   npx tsx scripts/backfill-mux-static-renditions.ts
 *   npx tsx scripts/backfill-mux-static-renditions.ts --dry-run
 *   npx tsx scripts/backfill-mux-static-renditions.ts --limit 100
 *   npx tsx scripts/backfill-mux-static-renditions.ts --concurrency 3
 */

import { PrismaClient } from "@prisma/client";
import Mux from "@mux/mux-node";

const prisma = new PrismaClient();
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitFlag = args.indexOf("--limit");
const concurrencyFlag = args.indexOf("--concurrency");
const limit = limitFlag >= 0 ? parseInt(args[limitFlag + 1], 10) || 0 : 0;
const concurrency = concurrencyFlag >= 0 ? parseInt(args[concurrencyFlag + 1], 10) || 3 : 3;

function hasReadyMp4(files: Array<{ ext?: string; status?: string }>) {
  return files.some((file) => file.ext === "mp4" && file.status === "ready");
}

function hasPreparingMp4(files: Array<{ ext?: string; status?: string }>) {
  return files.some((file) => file.ext === "mp4" && file.status === "preparing");
}

async function main() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required.");
  }

  const projects = await prisma.project.findMany({
    where: {
      muxAssetId: { not: null },
      muxPlaybackId: { not: null },
    },
    select: {
      id: true,
      title: true,
      muxAssetId: true,
    },
    take: limit > 0 ? limit : undefined,
    orderBy: { createdAt: "desc" },
  });

  console.log(`\nMux static rendition backfill`);
  console.log(`Projects queued: ${projects.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Concurrency: ${concurrency}\n`);

  let requested = 0;
  let alreadyReady = 0;
  let alreadyPreparing = 0;
  let skipped = 0;
  let failed = 0;

  const executing = new Set<Promise<void>>();

  const processProject = async (project: (typeof projects)[number]) => {
    try {
      const asset = await mux.video.assets.retrieve(project.muxAssetId!);
      const files = asset.static_renditions?.files ?? [];

      if (hasReadyMp4(files)) {
        alreadyReady++;
        return;
      }

      if (hasPreparingMp4(files)) {
        alreadyPreparing++;
        return;
      }

      if (asset.status !== "ready") {
        skipped++;
        console.log(`⊘ ${project.title} — asset status ${asset.status}`);
        return;
      }

      if (dryRun) {
        requested++;
        console.log(`• ${project.title} — would request highest.mp4`);
        return;
      }

      const rendition = await mux.video.assets.createStaticRendition(project.muxAssetId!, {
        resolution: "highest",
      });

      requested++;
      console.log(`↑ ${project.title} — requested ${rendition.name} (${rendition.status})`);
    } catch (error) {
      failed++;
      console.error(`✗ ${project.title} —`, error instanceof Error ? error.message : error);
    }
  };

  for (const project of projects) {
    const task = processProject(project).finally(() => {
      executing.delete(task);
    });
    executing.add(task);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);

  console.log("\nSummary");
  console.log(`Requested: ${requested}`);
  console.log(`Already ready: ${alreadyReady}`);
  console.log(`Already preparing: ${alreadyPreparing}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
