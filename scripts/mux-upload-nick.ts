/**
 * Upload Nick Stachurski's 4 missing videos to Mux.
 * Usage: npx tsx scripts/mux-upload-nick.ts
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

// Map of project ID → file path
const uploads: { projectId: string; title: string; filePath: string }[] = [
  {
    projectId: "cmmb7s6e50002za5vd4iifij3",
    title: "Nick Stachurski Slate",
    filePath: path.join(DOWNLOADS_DIR, "Nick_Satchurski", "_Nick_Stachurski_Slate.mp4"),
  },
  {
    projectId: "cmmb7v66z0004za5vg6nnz1th",
    title: "Ballroom Vogue",
    filePath: path.join(DOWNLOADS_DIR, "Nick_Satchurski", "_Ballroom_Vogue_.mp4"),
  },
  {
    projectId: "cmmb7yy9m0006za5va93hc7ws",
    title: "Delivery - 00:60",
    filePath: path.join(DOWNLOADS_DIR, "Nick_Satchurski", "_Delivery_-_00_60_.mp4"),
  },
  {
    projectId: "cmmbae6zj001btaqcyp3bjphn",
    title: "Serving Tray",
    filePath: path.join(DOWNLOADS_DIR, "Nick_Stachurski", "_Serving_Tray_.mov"),
  },
];

async function uploadToMux(filePath: string, title: string): Promise<{ assetId: string; playbackId: string } | null> {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      video_quality: "basic",
    },
    cors_origin: "*",
  });

  const fileBuffer = fs.readFileSync(filePath);
  const sizeMb = (fileBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`  ↑ Uploading ${title} (${sizeMb} MB) to Mux...`);

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

  console.log(`  ⏳ Upload complete, waiting for Mux to process...`);

  // Poll for asset creation
  let assetId: string | null = null;
  let playbackId: string | null = null;

  for (let attempt = 0; attempt < 120; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));

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
}

async function main() {
  console.log("\n🎬 Mux Upload — Nick Stachurski (4 videos)\n");

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("✗ MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in .env");
    process.exit(1);
  }

  // Verify all files exist first
  for (const u of uploads) {
    if (!fs.existsSync(u.filePath)) {
      console.error(`✗ File not found: ${u.filePath}`);
      process.exit(1);
    }
  }

  let completed = 0;
  let failed = 0;

  for (const u of uploads) {
    console.log(`\n[${completed + failed + 1}/4] ${u.title}`);

    const result = await uploadToMux(u.filePath, u.title);

    if (result) {
      await prisma.project.update({
        where: { id: u.projectId },
        data: {
          muxAssetId: result.assetId,
          muxPlaybackId: result.playbackId,
          muxStatus: "ready",
        },
      });
      completed++;
      console.log(`  ✓ Done → playbackId: ${result.playbackId}`);
    } else {
      await prisma.project.update({
        where: { id: u.projectId },
        data: { muxStatus: "error" },
      });
      failed++;
      console.error(`  ✗ Failed`);
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✓ Completed: ${completed}`);
  if (failed) console.log(`✗ Failed: ${failed}`);
  console.log("─".repeat(50) + "\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
