/**
 * 🎬 FF Reels — Wiredrive Migration Script
 *
 * Batch-uploads videos from local folders into the FF Reels platform
 * (Mux for streaming + R2 for archival + Postgres for metadata).
 *
 * ─── SETUP ──────────────────────────────────────────────────
 *
 * 1. Download your videos from Wiredrive, organized by director:
 *
 *    migration-data/
 *      Kelsey Larkin/
 *        Elahere - Showing Up.mp4
 *        Ford - Cyclists.mov
 *      Alan Ferguson/
 *        Nike - Speed.mp4
 *
 *    Tip: In Wiredrive, filter by director → Download Presentation → Unzip
 *         into a folder named after the director. Repeat per director.
 *
 * 2. Copy Mux + R2 env vars from Vercel to your local .env:
 *
 *    MUX_TOKEN_ID=...
 *    MUX_TOKEN_SECRET=...
 *    R2_ACCOUNT_ID=...
 *    R2_ACCESS_KEY_ID=...
 *    R2_SECRET_ACCESS_KEY=...
 *    R2_BUCKET_NAME=ff-reels
 *
 * 3. Run:
 *
 *    npx tsx scripts/migrate-wiredrive.ts ./migration-data
 *
 *    Optional flags:
 *      --manifest manifest.json   Use metadata from Wiredrive scraper
 *      --dry-run                  Preview what would happen (no uploads)
 *      --skip-r2                  Skip R2 archival (Mux only)
 *      --concurrency 3            Parallel uploads (default: 2)
 *
 * ─── WHAT IT DOES ───────────────────────────────────────────
 *
 * For each video file in each director folder:
 *   1. Finds or creates the director in the database
 *   2. Checks if already migrated (skips duplicates)
 *   3. Uploads original file to R2 for archival
 *   4. Creates a Mux asset pointing to the R2 file
 *   5. Creates a Project record in the database
 *   6. The Mux webhook will update the project when processing completes
 */

import { PrismaClient } from "@prisma/client";
import Mux from "@mux/mux-node";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────

const VIDEO_EXTENSIONS = new Set([
  ".mp4", ".mov", ".avi", ".mkv", ".wmv", ".webm", ".m4v", ".mpg", ".mpeg",
  ".mxf", ".ts", ".flv", ".3gp", ".ogv", ".qt",
]);

const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".wmv": "video/x-ms-wmv",
  ".webm": "video/webm",
  ".m4v": "video/x-m4v",
  ".mpg": "video/mpeg",
  ".mpeg": "video/mpeg",
  ".mxf": "application/mxf",
  ".ts": "video/mp2t",
  ".flv": "video/x-flv",
  ".3gp": "video/3gpp",
  ".ogv": "video/ogg",
  ".qt": "video/quicktime",
};

// ─── Helpers ─────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

function parseFilename(filename: string): { title: string; brand: string | null } {
  const name = path.basename(filename, path.extname(filename));

  // Try "Brand - Title" pattern
  const dashMatch = name.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    return { brand: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }

  // Try "Brand | Title" pattern (from Wiredrive)
  const pipeMatch = name.match(/^(.+?)\s*\|\s*"?([^"]+)"?$/);
  if (pipeMatch) {
    return { brand: pipeMatch[1].trim(), title: pipeMatch[2].trim() };
  }

  // Clean up underscore/camelCase filenames
  const cleaned = name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return { brand: null, title: cleaned };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function log(emoji: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`  ${emoji}  [${ts}] ${msg}`);
}

// ─── Manifest types ──────────────────────────────────────────

interface ManifestAsset {
  wiredriveTitle?: string;
  title?: string;
  brand?: string;
  originalFilename: string;
  director: string;
  size?: string;
  type?: string;
}

interface Manifest {
  directors: Record<string, ManifestAsset[]>;
}

// ─── CLI parsing ─────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let folder = "";
  let manifestPath: string | null = null;
  let dryRun = false;
  let skipR2 = false;
  let concurrency = 2;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--manifest" && args[i + 1]) {
      manifestPath = args[++i];
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--skip-r2") {
      skipR2 = true;
    } else if (args[i] === "--concurrency" && args[i + 1]) {
      concurrency = parseInt(args[++i], 10) || 2;
    } else if (args[i] === "--help" || args[i] === "-h") {
      printHelp();
      process.exit(0);
    } else if (!folder && !args[i].startsWith("--")) {
      folder = args[i];
    }
  }

  if (!folder) {
    console.error("\n❌ Missing folder argument.\n");
    printHelp();
    process.exit(1);
  }

  return { folder, manifestPath, dryRun, skipR2, concurrency };
}

function printHelp() {
  console.log(`
🎬 FF Reels — Wiredrive Migration

Usage:
  npx tsx scripts/migrate-wiredrive.ts <folder> [options]

Arguments:
  <folder>                 Path to migration data (organized by director subfolders)

Options:
  --manifest <file>        JSON manifest from Wiredrive scraper (for richer metadata)
  --dry-run                Preview actions without uploading
  --skip-r2                Skip R2 archival upload (Mux only)
  --concurrency <n>        Parallel uploads (default: 2)
  --help, -h               Show this help

Example:
  npx tsx scripts/migrate-wiredrive.ts ./migration-data --manifest wiredrive-manifest.json
`);
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const { folder, manifestPath, dryRun, skipR2, concurrency } = parseArgs();

  console.log("\n🎬 FF Reels — Wiredrive Migration\n");
  console.log(`  Folder:      ${path.resolve(folder)}`);
  console.log(`  Manifest:    ${manifestPath || "(none — using filename parsing)"}`);
  console.log(`  Dry run:     ${dryRun ? "YES" : "no"}`);
  console.log(`  Skip R2:     ${skipR2 ? "YES" : "no"}`);
  console.log(`  Concurrency: ${concurrency}`);
  console.log();

  // ── Validate env vars ──

  const envErrors: string[] = [];
  if (!process.env.DATABASE_URL) envErrors.push("DATABASE_URL");
  if (!dryRun) {
    if (!process.env.MUX_TOKEN_ID) envErrors.push("MUX_TOKEN_ID");
    if (!process.env.MUX_TOKEN_SECRET) envErrors.push("MUX_TOKEN_SECRET");
    if (!skipR2) {
      if (!process.env.R2_ACCOUNT_ID) envErrors.push("R2_ACCOUNT_ID");
      if (!process.env.R2_ACCESS_KEY_ID) envErrors.push("R2_ACCESS_KEY_ID");
      if (!process.env.R2_SECRET_ACCESS_KEY) envErrors.push("R2_SECRET_ACCESS_KEY");
      if (!process.env.R2_BUCKET_NAME) envErrors.push("R2_BUCKET_NAME");
    }
  }

  if (envErrors.length) {
    console.error(`❌ Missing env vars: ${envErrors.join(", ")}`);
    console.error(`   Copy these from Vercel → Settings → Environment Variables into your .env file.\n`);
    process.exit(1);
  }

  // ── Load manifest (optional) ──

  let manifest: Manifest | null = null;
  if (manifestPath) {
    try {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(raw) as Manifest;
      console.log(`📋 Loaded manifest: ${Object.keys(manifest.directors).length} directors, ${Object.values(manifest.directors).flat().length} assets\n`);
    } catch (err) {
      console.error(`❌ Could not read manifest: ${manifestPath}`);
      console.error(`   ${err}`);
      process.exit(1);
    }
  }

  // ── Scan folder structure ──

  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    console.error(`❌ Folder not found: ${folder}`);
    process.exit(1);
  }

  const directorFolders = fs.readdirSync(folder)
    .filter((name) => {
      const fullPath = path.join(folder, name);
      return fs.statSync(fullPath).isDirectory() && !name.startsWith(".");
    })
    .sort();

  if (!directorFolders.length) {
    console.error(`❌ No director subfolders found in ${folder}`);
    console.error(`   Expected structure: ${folder}/Director Name/video.mp4`);
    process.exit(1);
  }

  // Build the work list
  interface UploadJob {
    directorName: string;
    filePath: string;
    filename: string;
    title: string;
    brand: string | null;
    fileSizeMb: number;
    contentType: string;
  }

  const jobs: UploadJob[] = [];
  let totalSizeBytes = 0;

  for (const dirName of directorFolders) {
    const dirPath = path.join(folder, dirName);
    const files = fs.readdirSync(dirPath).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return VIDEO_EXTENSIONS.has(ext) && !f.startsWith(".");
    });

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();

      // Check manifest for metadata
      let title: string;
      let brand: string | null;

      const manifestAsset = manifest?.directors[dirName]?.find(
        (a) => a.originalFilename === file || a.originalFilename === path.basename(file, ext)
      );

      if (manifestAsset) {
        title = manifestAsset.title || manifestAsset.wiredriveTitle || file;
        brand = manifestAsset.brand || null;
      } else {
        const parsed = parseFilename(file);
        title = parsed.title;
        brand = parsed.brand;
      }

      jobs.push({
        directorName: dirName,
        filePath,
        filename: file,
        title,
        brand,
        fileSizeMb: Math.round((stat.size / (1024 * 1024)) * 100) / 100,
        contentType: MIME_MAP[ext] || "video/mp4",
      });

      totalSizeBytes += stat.size;
    }
  }

  if (!jobs.length) {
    console.error(`❌ No video files found in any director subfolder.`);
    console.error(`   Supported formats: ${[...VIDEO_EXTENSIONS].join(", ")}`);
    process.exit(1);
  }

  // ── Print summary ──

  console.log("─".repeat(60));
  console.log(`  📂 ${directorFolders.length} directors, ${jobs.length} videos (${formatBytes(totalSizeBytes)} total)\n`);

  const byDirector: Record<string, UploadJob[]> = {};
  for (const job of jobs) {
    if (!byDirector[job.directorName]) byDirector[job.directorName] = [];
    byDirector[job.directorName].push(job);
  }

  for (const [dir, dirJobs] of Object.entries(byDirector)) {
    const totalMb = dirJobs.reduce((sum, j) => sum + j.fileSizeMb, 0);
    console.log(`  👤 ${dir} (${dirJobs.length} files, ${totalMb.toFixed(0)} MB)`);
    for (const job of dirJobs) {
      const brandStr = job.brand ? `[${job.brand}] ` : "";
      console.log(`     ${brandStr}${job.title} (${job.fileSizeMb} MB)`);
    }
    console.log();
  }

  console.log("─".repeat(60));

  if (dryRun) {
    console.log("\n🏁 DRY RUN — no uploads performed.\n");
    process.exit(0);
  }

  // ── Initialize clients ──

  const prisma = new PrismaClient();
  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });

  let r2: S3Client | null = null;
  let r2Bucket: string = "";
  if (!skipR2) {
    r2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    r2Bucket = process.env.R2_BUCKET_NAME!;
  }

  // ── Process uploads ──

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [] as { file: string; error: string }[],
  };

  // Cache director lookups
  const directorCache: Record<string, string> = {}; // name → id

  async function getOrCreateDirector(name: string): Promise<string> {
    if (directorCache[name]) return directorCache[name];

    // Look up by name (case-insensitive)
    let director = await prisma.director.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (!director) {
      // Create new director
      let slug = slugify(name);
      const existing = await prisma.director.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      director = await prisma.director.create({
        data: { name, slug, categories: [] },
      });
      log("👤", `Created director: ${name} (${director.id})`);
    } else {
      log("👤", `Found director: ${name} (${director.id})`);
    }

    directorCache[name] = director.id;
    return director.id;
  }

  async function processJob(job: UploadJob, index: number): Promise<void> {
    const prefix = `[${index + 1}/${jobs.length}]`;

    try {
      // Get or create director
      const directorId = await getOrCreateDirector(job.directorName);

      // Check for duplicates (same filename + director)
      const existing = await prisma.project.findFirst({
        where: {
          directorId,
          originalFilename: job.filename,
        },
      });

      if (existing) {
        log("⏭️", `${prefix} SKIP (already exists): ${job.filename}`);
        results.skipped++;
        return;
      }

      log("📤", `${prefix} Uploading: ${job.title} (${job.fileSizeMb} MB)`);

      // Step 1: Upload to R2
      let r2Key: string | null = null;
      let r2DownloadUrl: string | null = null;

      if (r2 && !skipR2) {
        r2Key = `originals/${directorId}/${Date.now()}-${job.filename}`;
        const fileStream = fs.readFileSync(job.filePath);

        await r2.send(
          new PutObjectCommand({
            Bucket: r2Bucket,
            Key: r2Key,
            Body: fileStream,
            ContentType: job.contentType,
          })
        );

        // Generate signed download URL for Mux to pull from
        r2DownloadUrl = await getSignedUrl(
          r2,
          new GetObjectCommand({ Bucket: r2Bucket, Key: r2Key }),
          { expiresIn: 7200 } // 2 hours for Mux to ingest
        );

        log("☁️", `${prefix} R2 upload complete: ${r2Key}`);
      }

      // Step 2: Create Mux asset
      let muxAssetId: string | null = null;

      if (r2DownloadUrl) {
        // Create asset from R2 URL (single upload, Mux pulls from R2)
        const asset = await mux.video.assets.create({
          input: [{ url: r2DownloadUrl }],
          playback_policy: ["signed"],
          encoding_tier: "baseline",
        });
        muxAssetId = asset.id;
        log("🎬", `${prefix} Mux asset created: ${asset.id}`);
      } else {
        // No R2 — use Mux direct upload
        const upload = await mux.video.uploads.create({
          cors_origin: "*",
          new_asset_settings: {
            playback_policy: ["signed"],
            encoding_tier: "baseline",
          },
        });

        // Upload file directly to Mux
        const fileBuffer = fs.readFileSync(job.filePath);
        const response = await fetch(upload.url!, {
          method: "PUT",
          body: fileBuffer,
          headers: { "Content-Type": job.contentType },
        });

        if (!response.ok) {
          throw new Error(`Mux upload failed: ${response.status} ${response.statusText}`);
        }

        // Wait briefly for Mux to create the asset, then try to get the asset ID
        // The upload object should have the asset ID once processing starts
        await new Promise((r) => setTimeout(r, 3000));
        try {
          const uploadStatus = await mux.video.uploads.retrieve(upload.id!);
          muxAssetId = uploadStatus.asset_id || null;
        } catch {
          // Asset ID not available yet — webhook will handle it
          log("⚠️", `${prefix} Mux asset ID not yet available (webhook will set it)`);
        }

        log("🎬", `${prefix} Mux upload complete${muxAssetId ? `: ${muxAssetId}` : ""}`);
      }

      // Step 3: Create Project record
      const project = await prisma.project.create({
        data: {
          directorId,
          title: job.title,
          brand: job.brand,
          originalFilename: job.filename,
          fileSizeMb: job.fileSizeMb,
          muxAssetId: muxAssetId,
          muxStatus: "preparing",
          r2Key: r2Key,
          isPublished: true, // Auto-publish migrated content
        },
      });

      // Step 4: Auto-create activity update
      await prisma.update.create({
        data: {
          type: "SPOT_ADDED",
          title: `Migrated: ${job.title}`,
          body: `Imported from Wiredrive for ${job.directorName}`,
          directorId,
          projectId: project.id,
        },
      }).catch(() => {}); // Non-critical

      log("✅", `${prefix} Done: ${job.title} → project ${project.id}`);
      results.success++;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      log("❌", `${prefix} FAILED: ${job.filename} — ${errMsg}`);
      results.failed++;
      results.errors.push({ file: job.filename, error: errMsg });
    }
  }

  // Process jobs with concurrency limit
  console.log(`\n🚀 Starting migration (concurrency: ${concurrency})...\n`);
  const startTime = Date.now();

  // Simple concurrency pool
  let running = 0;
  let nextIndex = 0;

  await new Promise<void>((resolve) => {
    function startNext() {
      while (running < concurrency && nextIndex < jobs.length) {
        const idx = nextIndex++;
        running++;
        processJob(jobs[idx], idx).finally(() => {
          running--;
          if (nextIndex >= jobs.length && running === 0) {
            resolve();
          } else {
            startNext();
          }
        });
      }
    }
    startNext();
    if (jobs.length === 0) resolve();
  });

  // ── Summary ──

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log(`  🏁 MIGRATION COMPLETE (${elapsed}s)\n`);
  console.log(`     ✅ Uploaded:  ${results.success}`);
  console.log(`     ⏭️  Skipped:   ${results.skipped}`);
  console.log(`     ❌ Failed:    ${results.failed}`);

  if (results.errors.length) {
    console.log(`\n  Errors:`);
    for (const { file, error } of results.errors) {
      console.log(`     ${file}: ${error}`);
    }
  }

  console.log(`\n  ⏳ Mux is processing your videos. They'll appear in the dashboard`);
  console.log(`     as thumbnails become available (usually 1-5 minutes per video).`);
  console.log(`     The Mux webhook at /api/mux/webhook handles status updates.\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
