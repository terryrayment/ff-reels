/**
 * Bulk upload local video files to Mux for all projects missing muxPlaybackId.
 *
 * Usage:
 *   npx tsx scripts/mux-bulk-upload.ts                  # upload all
 *   npx tsx scripts/mux-bulk-upload.ts --director "Bueno"  # one director
 *   npx tsx scripts/mux-bulk-upload.ts --dry-run        # preview only
 *   npx tsx scripts/mux-bulk-upload.ts --concurrency 5  # parallel uploads
 *
 * Requires MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env
 */

import { PrismaClient } from "@prisma/client";
import Mux from "@mux/mux-node";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const DOWNLOADS_DIR = path.join(process.cwd(), "wiredrive-downloads");

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const directorFlag = args.indexOf("--director");
const directorFilter = directorFlag >= 0 ? args[directorFlag + 1] : null;
const concurrencyFlag = args.indexOf("--concurrency");
const concurrency = concurrencyFlag >= 0 ? parseInt(args[concurrencyFlag + 1]) || 3 : 3;

// Map director names to their download folder names
function directorToFolder(name: string): string {
  return name.replace(/\s+/g, "_");
}

// Find video file for a project
function findVideoFile(directorName: string, originalFilename: string | null): string | null {
  if (!originalFilename) return null;

  const folderName = directorToFolder(directorName);
  const dirPath = path.join(DOWNLOADS_DIR, folderName);

  if (!fs.existsSync(dirPath)) {
    // Try alternate folder names
    const entries = fs.readdirSync(DOWNLOADS_DIR);
    const match = entries.find(
      (e) => e.toLowerCase().replace(/[^a-z]/g, "") === folderName.toLowerCase().replace(/[^a-z]/g, "")
    );
    if (!match) return null;
    const altPath = path.join(DOWNLOADS_DIR, match, originalFilename);
    return fs.existsSync(altPath) ? altPath : null;
  }

  const filePath = path.join(dirPath, originalFilename);
  if (fs.existsSync(filePath)) return filePath;

  // Fuzzy match — filename might differ slightly
  try {
    const files = fs.readdirSync(dirPath);
    const baseName = path.parse(originalFilename).name.toLowerCase();
    const found = files.find((f) => {
      const fBase = path.parse(f).name.toLowerCase();
      return fBase === baseName || fBase.replace(/[^a-z0-9]/g, "") === baseName.replace(/[^a-z0-9]/g, "");
    });
    if (found) return path.join(dirPath, found);
  } catch {
    // ignore
  }

  return null;
}

// Upload a single file to Mux via direct upload
async function uploadToMux(
  filePath: string,
  projectId: string,
  title: string
): Promise<{ assetId: string; playbackId: string } | null> {
  try {
    // Create a direct upload URL
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "basic",
      },
      cors_origin: "*",
    });

    // Upload the file
    const fileBuffer = fs.readFileSync(filePath);
    const response = await fetch(upload.url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      console.error(`  ✗ Upload HTTP error ${response.status} for ${title}`);
      return null;
    }

    // Poll for asset creation (Mux processes the upload asynchronously)
    let assetId: string | null = null;
    let playbackId: string | null = null;

    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));

      const uploadStatus = await mux.video.uploads.retrieve(upload.id);

      if (uploadStatus.asset_id) {
        assetId = uploadStatus.asset_id;
        const asset = await mux.video.assets.retrieve(assetId);

        if (asset.playback_ids && asset.playback_ids.length > 0) {
          playbackId = asset.playback_ids[0].id;
          break;
        }

        if (asset.status === "ready") {
          playbackId = asset.playback_ids?.[0]?.id || null;
          break;
        }

        if (asset.status === "errored") {
          console.error(`  ✗ Mux asset errored for ${title}`);
          return null;
        }
      }

      if (uploadStatus.status === "errored") {
        console.error(`  ✗ Mux upload errored for ${title}`);
        return null;
      }
    }

    if (!assetId || !playbackId) {
      console.error(`  ✗ Timed out waiting for Mux asset for ${title}`);
      return null;
    }

    return { assetId, playbackId };
  } catch (err) {
    console.error(`  ✗ Error uploading ${title}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// Process uploads with concurrency limit
async function processQueue(
  queue: Array<{
    project: { id: string; title: string; originalFilename: string | null };
    directorName: string;
  }>
) {
  let completed = 0;
  let failed = 0;
  let skipped = 0;
  const total = queue.length;

  async function processOne(item: (typeof queue)[0]) {
    const { project, directorName } = item;
    const filePath = findVideoFile(directorName, project.originalFilename);

    if (!filePath) {
      skipped++;
      console.log(`  ⊘ [${completed + failed + skipped}/${total}] Skip ${project.title} — file not found`);
      return;
    }

    const sizeMb = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);
    console.log(`  ↑ [${completed + failed + skipped + 1}/${total}] Uploading ${project.title} (${sizeMb} MB)...`);

    if (dryRun) {
      completed++;
      return;
    }

    const result = await uploadToMux(filePath, project.id, project.title);

    if (result) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          muxAssetId: result.assetId,
          muxPlaybackId: result.playbackId,
          muxStatus: "ready",
        },
      });
      completed++;
      console.log(`  ✓ [${completed + failed + skipped}/${total}] ${project.title} → ${result.playbackId}`);
    } else {
      await prisma.project.update({
        where: { id: project.id },
        data: { muxStatus: "error" },
      });
      failed++;
    }
  }

  // Process with concurrency
  const executing = new Set<Promise<void>>();

  for (const item of queue) {
    const p = processOne(item).then(() => {
      executing.delete(p);
    });
    executing.add(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);

  return { completed, failed, skipped };
}

async function main() {
  console.log("\n🎬 Mux Bulk Upload");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Concurrency: ${concurrency}`);
  if (directorFilter) console.log(`   Director: ${directorFilter}`);

  // Verify Mux credentials
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("\n✗ MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in .env");
    process.exit(1);
  }

  // Find all projects needing Mux upload
  const projects = await prisma.project.findMany({
    where: {
      muxPlaybackId: null,
      isPublished: true,
      ...(directorFilter
        ? { director: { name: { contains: directorFilter, mode: "insensitive" as const } } }
        : {}),
    },
    select: {
      id: true,
      title: true,
      originalFilename: true,
      director: { select: { name: true } },
    },
    orderBy: [{ director: { name: "asc" } }, { sortOrder: "asc" }],
  });

  console.log(`\n   Found ${projects.length} projects needing Mux upload\n`);

  if (projects.length === 0) {
    console.log("   Nothing to upload!");
    await prisma.$disconnect();
    return;
  }

  // Group by director for progress display
  const byDirector = new Map<string, typeof projects>();
  for (const p of projects) {
    const name = p.director.name;
    if (!byDirector.has(name)) byDirector.set(name, []);
    byDirector.get(name)!.push(p);
  }

  let totalCompleted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const [directorName, dirProjects] of Array.from(byDirector)) {
    console.log(`\n📁 ${directorName} (${dirProjects.length} projects)`);

    const queue = dirProjects.map((p: typeof projects[number]) => ({
      project: { id: p.id, title: p.title, originalFilename: p.originalFilename },
      directorName,
    }));

    const { completed, failed, skipped } = await processQueue(queue);
    totalCompleted += completed;
    totalFailed += failed;
    totalSkipped += skipped;
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✓ Completed: ${totalCompleted}`);
  console.log(`✗ Failed: ${totalFailed}`);
  console.log(`⊘ Skipped (no file): ${totalSkipped}`);
  console.log("─".repeat(50) + "\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
