/**
 * Upload a headshot image to R2 and update the director record.
 *
 * Usage:
 *   npx tsx scripts/upload-headshot.ts <director-id> <image-path>
 *
 * Example:
 *   npx tsx scripts/upload-headshot.ts cmmb3lsgs00031372wgs1n5pl ~/Downloads/caleb-headshot.jpg
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";
import { uploadBuffer } from "../src/lib/r2/client";

const prisma = new PrismaClient();

async function main() {
  const [directorId, imagePath] = process.argv.slice(2);

  if (!directorId || !imagePath) {
    console.error("Usage: npx tsx scripts/upload-headshot.ts <director-id> <image-path>");
    process.exit(1);
  }

  const director = await prisma.director.findUnique({
    where: { id: directorId },
    select: { id: true, name: true, slug: true, headshotUrl: true },
  });

  if (!director) {
    console.error(`Director not found: ${directorId}`);
    process.exit(1);
  }

  const resolvedPath = path.resolve(imagePath);
  const buffer = readFileSync(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase() || ".jpg";
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  const r2Key = `headshots/${director.id}/${Date.now()}-${director.slug}${ext}`;

  console.log(`Uploading ${resolvedPath} (${(buffer.length / 1024).toFixed(0)} KB) to R2: ${r2Key}`);
  await uploadBuffer(r2Key, buffer, contentType);

  // Store a proxy-style URL that our app can serve
  const headshotUrl = `/api/directors/${director.id}/headshot?key=${encodeURIComponent(r2Key)}`;

  await prisma.director.update({
    where: { id: director.id },
    data: { headshotUrl },
  });

  console.log(JSON.stringify({
    director: director.name,
    previousUrl: director.headshotUrl,
    newUrl: headshotUrl,
    r2Key,
    size: `${(buffer.length / 1024).toFixed(0)} KB`,
  }, null, 2));
}

main()
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
