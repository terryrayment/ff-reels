/**
 * Wiredrive Presentation Importer
 *
 * Downloads all video assets from a Wiredrive presentation URL,
 * then uploads them to Mux + R2 and creates Project records.
 *
 * Usage:
 *   npx tsx scripts/wiredrive-import.ts --url "https://wdrv.it/fb276db21" --director "Terry Rayment"
 *   npx tsx scripts/wiredrive-import.ts --url "https://wdrv.it/XXXXXX" --director "Director Name" --dry-run
 *
 * Options:
 *   --url         Wiredrive presentation URL (required)
 *   --director    Director name to assign (required)
 *   --dry-run     List assets without downloading/importing
 *   --skip-r2     Skip R2 upload (Mux will ingest from Wiredrive directly)
 *   --output      Local download directory (default: ./wiredrive-downloads)
 *   --roster-status  Roster status for director (default: "ROSTER", e.g. "OFF_ROSTER")
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

const prisma = new PrismaClient();

// ── Parse CLI args ──────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const PRES_URL = getArg("url");
const DIRECTOR_NAME = getArg("director");
const DRY_RUN = hasFlag("dry-run");
const SKIP_R2 = hasFlag("skip-r2");
const OUTPUT_DIR = getArg("output") || "./wiredrive-downloads";
const ROSTER_STATUS = getArg("roster-status") || "ROSTER";

if (!PRES_URL || !DIRECTOR_NAME) {
  console.error(
    "Usage: npx tsx scripts/wiredrive-import.ts --url <wiredrive-url> --director <name> [--dry-run]"
  );
  process.exit(1);
}

// ── Types ────────────────────────────────────────────────────
interface WdAsset {
  id: number;
  label: string;
  title: string;
  size: number;
  displaySize: string;
  type: string;
  extension: string;
  mimeCategory: string;
  numericDuration: string;
  status: string;
  file: Record<string, { url: string }>;
  metadata: Array<{ category: string; value: string }>;
}

// ── Extract JSON array using bracket balancing ──────────────
function extractJsonArray(html: string, startMarker: string): string | null {
  const markerIdx = html.indexOf(startMarker);
  if (markerIdx === -1) return null;

  // Find the opening '[' after the marker
  let pos = markerIdx + startMarker.length;
  while (pos < html.length && html[pos] !== "[") pos++;
  if (pos >= html.length) return null;

  // Bracket-balance to find the matching ']'
  let depth = 0;
  let inString = false;
  let escape = false;
  const start = pos;

  for (let i = pos; i < html.length; i++) {
    const ch = html[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") {
      depth--;
      if (depth === 0) {
        return html.substring(start, i + 1);
      }
    }
  }

  return null;
}

// ── Fetch and parse Wiredrive page ──────────────────────────
async function fetchPresentation(url: string): Promise<WdAsset[]> {
  console.log(`\n📥  Fetching presentation: ${url}\n`);

  // Follow short URL redirects
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  console.log(`  Page size: ${(html.length / 1024).toFixed(0)} KB`);

  // The dataset is embedded inside a YUI constructor call:
  //   new Y.WD.Page.Presentation.Reel.Display({ container: '...', dataset: [{...}] })
  // Use bracket-balancing to extract the JSON array properly
  const jsonStr = extractJsonArray(html, "dataset:");

  if (!jsonStr) {
    // Debug: show nearby content
    const dsIdx = html.indexOf("dataset");
    if (dsIdx !== -1) {
      console.log(`  Found "dataset" at position ${dsIdx}, nearby content:`);
      console.log(`  ...${html.substring(dsIdx, dsIdx + 200)}...`);
    }
    throw new Error(
      "Could not find asset dataset in page. The page structure may have changed."
    );
  }

  console.log(`  Extracted dataset JSON: ${(jsonStr.length / 1024).toFixed(0)} KB`);

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    // JSON might have JS-style syntax (unquoted keys, trailing commas)
    // Try cleaning it up
    let cleaned = jsonStr
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');

    try {
      return JSON.parse(cleaned);
    } catch {
      // Save raw for debugging
      const debugPath = "./wiredrive-debug.json";
      fs.writeFileSync(debugPath, jsonStr, "utf-8");
      console.log(`  Saved raw dataset to ${debugPath} for debugging`);
      throw new Error(`Could not parse dataset JSON: ${err}`);
    }
  }
}

// ── Download a file ─────────────────────────────────────────
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
        // Handle redirects
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`Download failed: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });
}

// ── Parse brand/title from Wiredrive label ──────────────────
// Format: "Brand | Title" or "Brand | Title 00:30"
function parseLabel(label: string): { brand: string; title: string } {
  const parts = label.split("|").map((s) => s.trim());
  if (parts.length >= 2) {
    return {
      brand: parts[0],
      title: parts.slice(1).join(" | "), // rejoin if multiple pipes
    };
  }
  return { brand: "", title: label };
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  // 1. Fetch presentation data
  const assets = await fetchPresentation(PRES_URL!);

  // Filter to video assets only
  const videos = assets.filter(
    (a) =>
      a.mimeCategory === "video" ||
      a.type === "video" ||
      ["mp4", "mov", "m4v", "avi", "webm"].includes(
        (a.extension || "").toLowerCase()
      )
  );

  console.log(`Found ${assets.length} total assets, ${videos.length} videos\n`);

  if (videos.length === 0) {
    console.log("No video assets found. Assets found:");
    assets.forEach((a) =>
      console.log(`  - [${a.mimeCategory || a.type}] ${a.label} (${a.displaySize})`)
    );
    return;
  }

  // 2. List all videos
  console.log("Videos to import:");
  console.log("─".repeat(80));
  videos.forEach((v, i) => {
    const { brand, title } = parseLabel(v.label);
    const duration = parseFloat(v.numericDuration || "0");
    const durationStr = duration
      ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`
      : "—";
    console.log(
      `  ${String(i + 1).padStart(2)}. ${brand ? `${brand} | ` : ""}${title}  [${durationStr}]  ${v.displaySize}`
    );
  });
  console.log("─".repeat(80));
  console.log();

  if (DRY_RUN) {
    console.log("🔍  Dry run — no downloads or imports performed.");
    return;
  }

  // 3. Find or create director
  let director = await prisma.director.findFirst({
    where: { name: DIRECTOR_NAME },
  });

  if (!director) {
    const slug = DIRECTOR_NAME!.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    director = await prisma.director.create({
      data: { name: DIRECTOR_NAME!, slug, rosterStatus: ROSTER_STATUS },
    });
    console.log(`✅  Created director: ${director.name} (${director.id}) [${ROSTER_STATUS}]`);
  } else {
    console.log(`📂  Using existing director: ${director.name} (${director.id})`);
  }

  // 4. Download and import each video
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < videos.length; i++) {
    const asset = videos[i];
    const { brand, title } = parseLabel(asset.label);
    const displayName = `${brand ? `${brand} | ` : ""}${title}`;

    console.log(`\n[${i + 1}/${videos.length}] ${displayName}`);

    // Check if already imported
    const existing = await prisma.project.findFirst({
      where: {
        directorId: director.id,
        title: title || asset.label,
        brand: brand || undefined,
      },
    });

    if (existing) {
      console.log(`  ⏭  Already imported, skipping`);
      skipped++;
      continue;
    }

    // Get download URL — prefer download variant, then primary, then web
    const downloadUrl =
      asset.file?.download?.url ||
      asset.file?.primary?.url ||
      asset.file?.web?.url;

    if (!downloadUrl) {
      console.log(`  ⚠  No download URL found, skipping`);
      skipped++;
      continue;
    }

    // Download file
    const ext = (asset.extension || "mp4").toLowerCase();
    const safeName = (title || asset.label)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 80);
    const localPath = path.join(
      OUTPUT_DIR,
      DIRECTOR_NAME!.replace(/[^a-zA-Z0-9_-]/g, "_"),
      `${safeName}.${ext}`
    );

    console.log(`  📥  Downloading to ${localPath}...`);
    try {
      await downloadFile(downloadUrl, localPath);
      const fileSize = fs.statSync(localPath).size;
      console.log(`  ✅  Downloaded (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
    } catch (err) {
      console.log(`  ❌  Download failed: ${err}`);
      skipped++;
      continue;
    }

    // Create Mux asset (if MUX env vars are set)
    let muxAssetId: string | undefined;
    let muxPlaybackId: string | undefined;

    if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
      try {
        // For Mux, we can pass the Wiredrive URL directly if it's publicly accessible
        const Mux = (await import("@mux/mux-node")).default;
        const mux = new Mux({
          tokenId: process.env.MUX_TOKEN_ID,
          tokenSecret: process.env.MUX_TOKEN_SECRET,
        });

        console.log(`  🎬  Creating Mux asset from download URL...`);
        const muxAsset = await mux.video.assets.create({
          inputs: [{ url: downloadUrl }],
          playback_policy: ["public"],
          encoding_tier: "smart",
        });

        muxAssetId = muxAsset.id;
        muxPlaybackId = muxAsset.playback_ids?.[0]?.id;
        console.log(`  ✅  Mux asset: ${muxAssetId} (playback: ${muxPlaybackId})`);
      } catch (err) {
        console.log(`  ⚠  Mux upload failed: ${err}`);
      }
    } else {
      console.log(`  ℹ  MUX_TOKEN_ID/SECRET not set — skipping Mux upload`);
    }

    // Upload to R2 (if configured and not skipped)
    let r2Key: string | undefined;
    if (
      !SKIP_R2 &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID
    ) {
      try {
        const { S3Client, PutObjectCommand } = await import(
          "@aws-sdk/client-s3"
        );
        const s3 = new S3Client({
          region: "auto",
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          },
        });

        r2Key = `originals/${director.slug}/${safeName}.${ext}`;
        console.log(`  ☁️   Uploading to R2: ${r2Key}`);

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || "ff-reels",
            Key: r2Key,
            Body: fs.readFileSync(localPath),
            ContentType: `video/${ext}`,
          })
        );
        console.log(`  ✅  R2 upload complete`);
      } catch (err) {
        console.log(`  ⚠  R2 upload failed: ${err}`);
        r2Key = undefined;
      }
    }

    // Get thumbnail URL from Wiredrive (large or small variant)
    const thumbnailUrl =
      asset.file?.large?.url ||
      asset.file?.max?.url ||
      asset.file?.small?.url ||
      asset.file?.tiny?.url ||
      null;

    // Create Project record
    const duration = parseFloat(asset.numericDuration || "0") || null;
    const fileSizeMb = asset.size ? asset.size / (1024 * 1024) : null;

    await prisma.project.create({
      data: {
        directorId: director.id,
        title: title || asset.label,
        brand: brand || null,
        duration,
        muxAssetId: muxAssetId || null,
        muxPlaybackId: muxPlaybackId || null,
        muxStatus: muxAssetId ? "preparing" : "waiting",
        r2Key: r2Key || null,
        originalFilename: `${safeName}.${ext}`,
        fileSizeMb,
        thumbnailUrl: thumbnailUrl || null,
        isPublished: true,
      },
    });

    console.log(`  ✅  Project record created`);
    imported++;
  }

  console.log(`\n${"═".repeat(80)}`);
  console.log(
    `🎬  Import complete: ${imported} imported, ${skipped} skipped`
  );
  console.log(`${"═".repeat(80)}\n`);
}

main()
  .catch((err) => {
    console.error("\n❌  Import failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
