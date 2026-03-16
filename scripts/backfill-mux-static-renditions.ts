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

const ADVANCED_RESOLUTION_CANDIDATES: Record<string, string[]> = {
  SD: ["480p", "360p", "270p"],
  HD: ["720p", "540p", "480p", "360p", "270p"],
  FHD: ["1080p", "720p", "540p", "480p", "360p", "270p"],
  UHD: ["2160p", "1440p", "1080p", "720p", "540p", "480p", "360p", "270p"],
};

function hasReadyMp4(files: Array<{ ext?: string; status?: string }>) {
  return files.some((file) => file.ext === "mp4" && file.status === "ready");
}

function hasPreparingMp4(files: Array<{ ext?: string; status?: string }>) {
  return files.some((file) => file.ext === "mp4" && file.status === "preparing");
}

function chooseAdvancedCandidates(
  files: Array<{ name?: string }>,
  maxStoredResolution?: string,
  resolutionTier?: string,
) {
  const existingNames = new Set(
    files
      .map((file) => file.name)
      .filter((name): name is string => typeof name === "string"),
  );

  const tierKey =
    maxStoredResolution ||
    (resolutionTier === "2160p"
      ? "UHD"
      : resolutionTier === "1440p"
        ? "UHD"
        : resolutionTier === "1080p"
          ? "FHD"
          : resolutionTier === "720p"
            ? "HD"
            : "SD");

  const candidates =
    ADVANCED_RESOLUTION_CANDIDATES[tierKey] ??
    ["720p", "540p", "480p", "360p", "270p"];

  return candidates.filter((resolution) => !existingNames.has(`${resolution}.mp4`));
}

async function requestBestRendition(asset: Awaited<ReturnType<typeof mux.video.assets.retrieve>>) {
  const files = asset.static_renditions?.files ?? [];
  const usesAdvancedRenditions = files.some((file) => file.type === "advanced");

  if (!usesAdvancedRenditions) {
    return mux.video.assets.createStaticRendition(asset.id, {
      resolution: "highest",
    });
  }

  const candidates = chooseAdvancedCandidates(
    files,
    asset.max_stored_resolution,
    asset.resolution_tier,
  );

  for (const resolution of candidates) {
    try {
      const rendition = await mux.video.assets.createStaticRendition(asset.id, {
        resolution: resolution as
          | "2160p"
          | "1440p"
          | "1080p"
          | "720p"
          | "540p"
          | "480p"
          | "360p"
          | "270p",
      });
      if (rendition.status === "ready" || rendition.status === "preparing") {
        return rendition;
      }
    } catch {
      // Try the next lower advanced resolution.
    }
  }

  return null;
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
        console.log(`• ${project.title} — would request a compatible MP4 rendition`);
        return;
      }

      const rendition = await requestBestRendition(asset);
      if (!rendition) {
        failed++;
        console.log(`✗ ${project.title} — no compatible rendition could be requested`);
        return;
      }

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
