/**
 * Enable temporary Mux master access for existing assets.
 *
 * Usage:
 *   npx tsx scripts/backfill-mux-master-access.ts
 *   npx tsx scripts/backfill-mux-master-access.ts --dry-run
 *   npx tsx scripts/backfill-mux-master-access.ts --limit 100
 *   npx tsx scripts/backfill-mux-master-access.ts --concurrency 3
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

async function main() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required.");
  }

  const projects = await prisma.project.findMany({
    where: {
      muxAssetId: { not: null },
      muxPlaybackId: { not: null },
      r2Key: null,
    },
    select: {
      title: true,
      muxAssetId: true,
    },
    take: limit > 0 ? limit : undefined,
    orderBy: { createdAt: "desc" },
  });

  console.log(`\nMux master access backfill`);
  console.log(`Projects queued: ${projects.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Concurrency: ${concurrency}\n`);

  let alreadyReady = 0;
  let alreadyPreparing = 0;
  let requested = 0;
  let failed = 0;

  const executing = new Set<Promise<void>>();

  const processProject = async (project: (typeof projects)[number]) => {
    try {
      const asset = await mux.video.assets.retrieve(project.muxAssetId!);

      if (asset.master?.status === "ready" && asset.master.url) {
        alreadyReady++;
        return;
      }

      if (asset.master?.status === "preparing") {
        alreadyPreparing++;
        return;
      }

      if (dryRun) {
        requested++;
        console.log(`• ${project.title} — would enable temporary master access`);
        return;
      }

      const updated = await mux.video.assets.updateMasterAccess(project.muxAssetId!, {
        master_access: "temporary",
      });

      if (updated.master?.status === "ready") {
        alreadyReady++;
      } else {
        requested++;
        console.log(`↑ ${project.title} — master access ${updated.master?.status || "requested"}`);
      }
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
  console.log(`Already ready: ${alreadyReady}`);
  console.log(`Already preparing: ${alreadyPreparing}`);
  console.log(`Requested: ${requested}`);
  console.log(`Failed: ${failed}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
