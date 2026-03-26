/**
 * Upload Corey Wilson's videos to Mux and create Project records.
 *
 * Usage:
 *   npx tsx scripts/upload-corey-videos.ts              # upload all
 *   npx tsx scripts/upload-corey-videos.ts --dry-run    # preview only
 *   npx tsx scripts/upload-corey-videos.ts --concurrency 2
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

const VIDEOS_DIR = path.join(
  process.env.HOME || "/Users/terryrayment",
  "Desktop/CoreyWilson/videos"
);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const concurrencyFlag = args.indexOf("--concurrency");
const concurrency = concurrencyFlag >= 0 ? parseInt(args[concurrencyFlag + 1]) || 2 : 2;

// Parse a video filename into a title and brand
function parseFilename(filename: string): { title: string; brand: string | null } {
  const name = path.parse(filename).name;

  // Specific overrides for tricky filenames
  const overrides: Record<string, { title: string; brand: string | null }> = {
    "COREYWILSON_AUTOMOTIVE_REEL": { title: "Automotive Reel", brand: null },
    "Coreywilson_Surf_1": { title: "Surf Reel 1", brand: null },
    "Coreywilson_Surf_2": { title: "Surf Reel 2", brand: null },
    "Coreywilson_Surf_3": { title: "Surf Reel 3", brand: null },
    "POLO RALPH LAUREN DEEP BLUE PARFUM": { title: "Deep Blue Parfum", brand: "Ralph Lauren" },
    "ralph_lauren_deep_blue_v1": { title: "Deep Blue v1", brand: "Ralph Lauren" },
    "SANDSTONE_RANCH": { title: "Sandstone Ranch", brand: null },
    "SCEYE": { title: "Sceye", brand: "Sceye" },
    "PAX_FOUR_LAUNCH": { title: "Four Launch", brand: "PAX" },
    "TRAVIS_KELCE_BEHIND_THE_SCENES_ZENWTR": { title: "Travis Kelce BTS", brand: "Zen WTR" },
    "TRAVIS_KELCE_INTERVIEW_-_ZENWTR": { title: "Travis Kelce Interview", brand: "Zen WTR" },
  };
  if (overrides[name]) return overrides[name];

  // Try "BRAND_-_TITLE" pattern
  const dashMatch = name.match(/^(.+?)_-_(.+)$/);
  if (dashMatch) {
    let brand = dashMatch[1].replace(/_/g, " ").trim();
    const title = dashMatch[2].replace(/_/g, " ").trim();

    // Normalize known brands
    const brandMap: Record<string, string> = {
      "ASTON MARTIN": "Aston Martin",
      "ASTONMARTIN": "Aston Martin",
      "Aston Martin F1 x Maaden": "Aston Martin",
      "KARMA": "Karma Automotive",
      "KARMA AUTOMOTIVE": "Karma Automotive",
      "FISHER x AATIG": "Fisher",
      "MAXX CROSBY": "Zen WTR",
      "MICK FANNING": "Mikuna Foods",
      "TRAVIS KELCE": "Zen WTR",
      "TRAVIS MATHEW": "Travis Mathew",
      "ZEN WTR": "Zen WTR",
      "MadHappy": "Madhappy",
    };
    brand = brandMap[brand] || brand;

    return { title, brand };
  }

  // Fallback: clean up filename
  return {
    title: name.replace(/_/g, " ").trim(),
    brand: null,
  };
}

async function uploadToMux(filePath: string): Promise<{ uploadId: string; assetId: string; playbackId: string; duration: number } | null> {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "basic",
      },
      cors_origin: "*",
    });

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
      console.error(`  ✗ Upload HTTP error ${response.status}`);
      return null;
    }

    // Poll for asset
    for (let attempt = 0; attempt < 120; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const uploadStatus = await mux.video.uploads.retrieve(upload.id);

      if (uploadStatus.asset_id) {
        const asset = await mux.video.assets.retrieve(uploadStatus.asset_id);
        if (asset.status === "ready" && asset.playback_ids?.length) {
          return {
            uploadId: upload.id,
            assetId: uploadStatus.asset_id,
            playbackId: asset.playback_ids[0].id,
            duration: asset.duration || 0,
          };
        }
        if (asset.status === "errored") {
          console.error(`  ✗ Mux asset errored`);
          return null;
        }
      }
      if (uploadStatus.status === "errored") {
        console.error(`  ✗ Mux upload errored`);
        return null;
      }
    }

    console.error(`  ✗ Timed out waiting for Mux`);
    return null;
  } catch (err) {
    console.error(`  ✗ Error:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  console.log("\n🎬 Corey Wilson Video Upload");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Source: ${VIDEOS_DIR}`);

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("\n✗ MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in .env");
    process.exit(1);
  }

  const director = await prisma.director.findUnique({
    where: { slug: "corey-wilson" },
  });
  if (!director) {
    console.error("\n✗ Director 'corey-wilson' not found");
    process.exit(1);
  }
  console.log(`   Director: ${director.name} (${director.id})`);

  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error(`\n✗ Videos directory not found: ${VIDEOS_DIR}`);
    process.exit(1);
  }

  const validExts = [".mp4", ".mov", ".webm", ".avi"];
  const files = fs
    .readdirSync(VIDEOS_DIR)
    .filter((f) => validExts.includes(path.extname(f).toLowerCase()))
    .sort();

  console.log(`   Found ${files.length} videos\n`);

  if (files.length === 0) {
    console.log("   Nothing to upload!");
    await prisma.$disconnect();
    return;
  }

  // Show what we'll upload
  for (const [i, f] of files.entries()) {
    const { title, brand } = parseFilename(f);
    const sizeMb = (fs.statSync(path.join(VIDEOS_DIR, f)).size / 1024 / 1024).toFixed(1);
    console.log(`  [${i + 1}] ${f} (${sizeMb} MB) → "${title}"${brand ? ` [${brand}]` : ""}`);
  }

  if (dryRun) {
    console.log(`\n   Would upload ${files.length} videos and create Project records`);
    await prisma.$disconnect();
    return;
  }

  console.log("\n   Starting uploads...\n");

  let completed = 0;
  let failed = 0;
  const executing = new Set<Promise<void>>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(VIDEOS_DIR, file);
    const { title, brand } = parseFilename(file);
    const sizeMb = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);

    const p = (async () => {
      console.log(`  ↑ [${i + 1}/${files.length}] Uploading "${title}" (${sizeMb} MB)...`);

      const result = await uploadToMux(filePath);
      if (result) {
        await prisma.project.create({
          data: {
            directorId: director.id,
            title,
            brand,
            originalFilename: file,
            muxUploadId: result.uploadId,
            muxAssetId: result.assetId,
            muxPlaybackId: result.playbackId,
            muxStatus: "ready",
            duration: result.duration,
            isPublished: true,
            sortOrder: i,
          },
        });
        completed++;
        console.log(`  ✓ [${completed + failed}/${files.length}] "${title}" → ${result.playbackId}`);
      } else {
        failed++;
      }
    })();

    const tracked = p.then(() => { executing.delete(tracked); });
    executing.add(tracked);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);

  console.log("\n" + "─".repeat(50));
  console.log(`✓ Uploaded: ${completed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log("─".repeat(50) + "\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
