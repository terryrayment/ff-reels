/**
 * Upload Corey Wilson's photos to R2 and create gallery records.
 *
 * Usage:
 *   npx tsx scripts/upload-corey-photos.ts              # upload all
 *   npx tsx scripts/upload-corey-photos.ts --dry-run    # preview only
 *   npx tsx scripts/upload-corey-photos.ts --concurrency 5
 */

import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "ff-reels";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g. https://cdn.example.com

const PHOTOS_DIR = path.join(
  process.env.HOME || "/Users/terryrayment",
  "Desktop/CoreyWilson/photos"
);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const concurrencyFlag = args.indexOf("--concurrency");
const concurrency = concurrencyFlag >= 0 ? parseInt(args[concurrencyFlag + 1]) || 5 : 5;

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

// Try to extract brand from filename
function guessBrand(filename: string): string | null {
  const upper = filename.toUpperCase();
  const brands: Record<string, string> = {
    "ASTONMARTIN": "Aston Martin",
    "ASTON_MARTIN": "Aston Martin",
    "RALPHLAUREN": "Ralph Lauren",
    "RALPH_LAUREN": "Ralph Lauren",
    "POLO": "Ralph Lauren",
    "MADHAPPY": "Madhappy",
    "ZENWTR": "Zen WTR",
    "ZEN_WTR": "Zen WTR",
    "GOODART": "Good Art",
    "CHRISLAKE": "Chris Lake",
    "FISHER": "Fisher",
    "MAADEN": "Ma'aden",
    "SCEYE": "Sceye",
    "KARMA": "Karma Automotive",
    "REVERO": "Karma Automotive",
    "GYESERA": "Karma Automotive",
    "SKECHERS": "Skechers",
    "MIKUNA": "Mikuna Foods",
    "MYBIKINI": "My Bikini",
    "MAXX_CROSBY": "Zen WTR",
    "TRAVIS_KELCE": "Zen WTR",
    "BIO.ME": "Bio.Me",
  };
  for (const [pattern, brand] of Object.entries(brands)) {
    if (upper.includes(pattern)) return brand;
  }
  return null;
}

async function uploadPhoto(
  filePath: string,
  directorId: string,
  sortOrder: number
): Promise<{ url: string; brand: string | null } | null> {
  const filename = path.basename(filePath);
  const ext = path.extname(filename);
  const contentType = getMimeType(ext);
  const key = `gallery/${directorId}/${Date.now()}-${filename}`;

  try {
    const fileBuffer = fs.readFileSync(filePath);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    // Construct public URL
    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `/api/gallery/${directorId}/${encodeURIComponent(filename)}?key=${encodeURIComponent(key)}`;

    return { url, brand: guessBrand(filename) };
  } catch (err) {
    console.error(`  ✗ Failed to upload ${filename}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  console.log("\n📸 Corey Wilson Photo Upload");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Source: ${PHOTOS_DIR}`);

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
    console.error("\n✗ R2 env vars not configured");
    process.exit(1);
  }

  // Find Corey Wilson
  const director = await prisma.director.findUnique({
    where: { slug: "corey-wilson" },
  });
  if (!director) {
    console.error("\n✗ Director 'corey-wilson' not found");
    process.exit(1);
  }
  console.log(`   Director: ${director.name} (${director.id})`);

  // List photos
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`\n✗ Photos directory not found: ${PHOTOS_DIR}`);
    process.exit(1);
  }

  const validExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => validExts.includes(path.extname(f).toLowerCase()))
    .sort();

  console.log(`   Found ${files.length} photos\n`);

  if (files.length === 0) {
    console.log("   Nothing to upload!");
    await prisma.$disconnect();
    return;
  }

  if (dryRun) {
    for (const [i, f] of files.entries()) {
      const brand = guessBrand(f);
      console.log(`  [${i + 1}/${files.length}] ${f}${brand ? ` (${brand})` : ""}`);
    }
    console.log(`\n   Would upload ${files.length} photos`);
    await prisma.$disconnect();
    return;
  }

  // Upload with concurrency
  let completed = 0;
  let failed = 0;
  const galleryRecords: Array<{
    directorId: string;
    url: string;
    brand: string | null;
    sortOrder: number;
  }> = [];

  const executing = new Set<Promise<void>>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(PHOTOS_DIR, file);

    const p = (async () => {
      const result = await uploadPhoto(filePath, director.id, i);
      if (result) {
        galleryRecords.push({
          directorId: director.id,
          url: result.url,
          brand: result.brand,
          sortOrder: i,
        });
        completed++;
        console.log(`  ✓ [${completed + failed}/${files.length}] ${file}`);
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

  // Batch insert gallery records
  if (galleryRecords.length > 0) {
    // Sort by original sortOrder before inserting
    galleryRecords.sort((a, b) => a.sortOrder - b.sortOrder);

    const created = await prisma.directorGalleryImage.createMany({
      data: galleryRecords.map((r) => ({
        directorId: r.directorId,
        url: r.url,
        brand: r.brand,
        sortOrder: r.sortOrder,
      })),
    });
    console.log(`\n   Created ${created.count} gallery records`);
  }

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
