/**
 * Upload ALL remaining videos missing from Mux.
 * Matches projects to local files in wiredrive-downloads/ with fuzzy matching.
 *
 * Usage:
 *   npx tsx scripts/mux-upload-all-missing.ts              # upload all
 *   npx tsx scripts/mux-upload-all-missing.ts --dry-run     # preview only
 *   npx tsx scripts/mux-upload-all-missing.ts --concurrency 2
 */

import { PrismaClient } from "@prisma/client";
import Mux from "@mux/mux-node";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";

const prisma = new PrismaClient();
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const DOWNLOADS_DIR = path.join(process.cwd(), "wiredrive-downloads");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const concurrencyFlag = args.indexOf("--concurrency");
const concurrency = concurrencyFlag >= 0 ? parseInt(args[concurrencyFlag + 1]) || 2 : 2;

// Normalize a string for fuzzy matching
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Find all possible folder names for a director
function findDirectorFolder(directorName: string): string | null {
  const folderName = directorName.replace(/\s+/g, "_");
  const dirPath = path.join(DOWNLOADS_DIR, folderName);
  if (fs.existsSync(dirPath)) return dirPath;

  // Try fuzzy match
  const entries = fs.readdirSync(DOWNLOADS_DIR);
  const normTarget = normalize(directorName);
  const match = entries.find((e) => normalize(e) === normTarget);
  if (match) return path.join(DOWNLOADS_DIR, match);

  // Try partial match
  const partial = entries.find(
    (e) => normalize(e).includes(normTarget) || normTarget.includes(normalize(e))
  );
  if (partial) return path.join(DOWNLOADS_DIR, partial);

  return null;
}

// Find video file — try exact match, then fuzzy
function findVideoFile(directorName: string, originalFilename: string | null): string | null {
  if (!originalFilename) return null;

  // Try all possible director folders
  const folders: string[] = [];
  const primaryFolder = findDirectorFolder(directorName);
  if (primaryFolder) folders.push(primaryFolder);

  // Also check alternate spellings (e.g. Nick_Satchurski vs Nick_Stachurski)
  const entries = fs.readdirSync(DOWNLOADS_DIR);
  const normName = normalize(directorName);
  for (const e of entries) {
    const full = path.join(DOWNLOADS_DIR, e);
    if (!folders.includes(full) && normalize(e).substring(0, 5) === normName.substring(0, 5)) {
      folders.push(full);
    }
  }

  for (const dirPath of folders) {
    // Exact match
    const exactPath = path.join(dirPath, originalFilename);
    if (fs.existsSync(exactPath)) return exactPath;

    // Fuzzy match
    try {
      const files = fs.readdirSync(dirPath);
      const normBase = normalize(path.parse(originalFilename).name);
      const found = files.find((f) => {
        const ext = path.extname(f).toLowerCase();
        if (![".mp4", ".mov", ".m4v", ".webm"].includes(ext)) return false;
        return normalize(path.parse(f).name) === normBase;
      });
      if (found) return path.join(dirPath, found);
    } catch {
      // ignore
    }
  }

  return null;
}

// Upload a single file to Mux
async function uploadToMux(
  filePath: string,
  title: string
): Promise<{ assetId: string; playbackId: string; duration?: number; aspectRatio?: string } | null> {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "basic",
      },
      cors_origin: "*",
    });

    const fileSize = fs.statSync(filePath).size;
    const fileStream = fs.createReadStream(filePath);
    const readable = Readable.toWeb(fileStream) as ReadableStream;
    const response = await fetch(upload.url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": fileSize.toString(),
      },
      body: readable,
      // @ts-expect-error - Node fetch supports duplex for streaming
      duplex: "half",
    });

    if (!response.ok) {
      console.error(`    ✗ HTTP ${response.status}`);
      return null;
    }

    // Poll for asset readiness
    for (let attempt = 0; attempt < 120; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const uploadStatus = await mux.video.uploads.retrieve(upload.id);

      if (uploadStatus.asset_id) {
        const asset = await mux.video.assets.retrieve(uploadStatus.asset_id);
        if (asset.playback_ids && asset.playback_ids.length > 0) {
          return {
            assetId: uploadStatus.asset_id,
            playbackId: asset.playback_ids[0].id,
            duration: asset.duration ?? undefined,
            aspectRatio: asset.aspect_ratio ?? undefined,
          };
        }
        if (asset.status === "ready") {
          return {
            assetId: uploadStatus.asset_id,
            playbackId: asset.playback_ids?.[0]?.id || "",
            duration: asset.duration ?? undefined,
            aspectRatio: asset.aspect_ratio ?? undefined,
          };
        }
        if (asset.status === "errored") {
          console.error(`    ✗ Mux asset errored`);
          return null;
        }
      }

      if (uploadStatus.status === "errored") {
        console.error(`    ✗ Mux upload errored`);
        return null;
      }
    }

    console.error(`    ✗ Timed out`);
    return null;
  } catch (err) {
    console.error(`    ✗ Error:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  console.log("\n🎬 Mux Bulk Upload — All Missing Videos");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Concurrency: ${concurrency}\n`);

  if (!dryRun && (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET)) {
    console.error("✗ MUX_TOKEN_ID and MUX_TOKEN_SECRET required");
    process.exit(1);
  }

  // Get all projects missing Mux
  const projects = await prisma.project.findMany({
    where: { muxPlaybackId: null },
    select: {
      id: true,
      title: true,
      originalFilename: true,
      muxStatus: true,
      director: { select: { name: true } },
    },
    orderBy: [{ director: { name: "asc" } }, { sortOrder: "asc" }],
  });

  console.log(`   Found ${projects.length} projects missing Mux\n`);

  // Match files
  type QueueItem = {
    projectId: string;
    title: string;
    directorName: string;
    filePath: string;
    sizeMb: number;
  };

  const queue: QueueItem[] = [];
  const noFile: string[] = [];

  const byDirector = new Map<string, typeof projects>();
  for (const p of projects) {
    const name = p.director.name;
    if (!byDirector.has(name)) byDirector.set(name, []);
    byDirector.get(name)!.push(p);
  }

  for (const [dirName, dirProjects] of byDirector) {
    let found = 0;
    let notFound = 0;

    for (const p of dirProjects) {
      const filePath = findVideoFile(dirName, p.originalFilename);
      if (filePath) {
        const sizeMb = fs.statSync(filePath).size / 1024 / 1024;
        queue.push({
          projectId: p.id,
          title: p.title,
          directorName: dirName,
          filePath,
          sizeMb,
        });
        found++;
      } else {
        noFile.push(`${dirName} / ${p.title} (${p.originalFilename})`);
        notFound++;
      }
    }

    console.log(`  📁 ${dirName}: ${found} matched, ${notFound} missing files`);
  }

  const totalSize = queue.reduce((sum, q) => sum + q.sizeMb, 0);
  console.log(`\n   ${queue.length} videos to upload (${(totalSize / 1024).toFixed(1)} GB)`);

  if (noFile.length > 0) {
    console.log(`   ${noFile.length} videos with no local file:`);
    for (const n of noFile) console.log(`     ⊘ ${n}`);
  }

  if (dryRun || queue.length === 0) {
    await prisma.$disconnect();
    return;
  }

  console.log(`\n   Starting uploads...\n`);

  let completed = 0;
  let failed = 0;
  const total = queue.length;
  const executing = new Set<Promise<void>>();

  async function processOne(item: QueueItem) {
    const idx = completed + failed + 1;
    console.log(`  [${idx}/${total}] ${item.directorName} / ${item.title} (${item.sizeMb.toFixed(0)} MB)`);

    const result = await uploadToMux(item.filePath, item.title);

    if (result && result.playbackId) {
      await prisma.project.update({
        where: { id: item.projectId },
        data: {
          muxAssetId: result.assetId,
          muxPlaybackId: result.playbackId,
          muxStatus: "ready",
          ...(result.duration ? { duration: result.duration } : {}),
          ...(result.aspectRatio ? { aspectRatio: result.aspectRatio } : {}),
        },
      });
      completed++;
      console.log(`    ✓ ${result.playbackId}`);
    } else {
      await prisma.project.update({
        where: { id: item.projectId },
        data: { muxStatus: "error" },
      });
      failed++;
      console.error(`    ✗ Failed`);
    }
  }

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

  console.log("\n" + "─".repeat(50));
  console.log(`✓ Completed: ${completed}`);
  if (failed) console.log(`✗ Failed: ${failed}`);
  if (noFile.length) console.log(`⊘ No file: ${noFile.length}`);
  console.log("─".repeat(50) + "\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
