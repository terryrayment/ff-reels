/**
 * Import Theo LeSourd from Wiredrive
 *
 * Creates director (OFF_ROSTER) + project records + downloads video files.
 * Mux upload is skipped (no MUX_TOKEN_ID/MUX_TOKEN_SECRET).
 *
 * Usage:
 *   npx tsx scripts/import-theo-lesourd.ts
 *   npx tsx scripts/import-theo-lesourd.ts --dry-run
 *   npx tsx scripts/import-theo-lesourd.ts --skip-download
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_DOWNLOAD = process.argv.includes("--skip-download");

const DIRECTOR_NAME = "Theo LeSourd";
const DIRECTOR_SLUG = "theo-lesourd";
const ROSTER_STATUS = "OFF_ROSTER";
const WIREDRIVE_URL = "https://wdrv.it/1d11a97a3";
const OUTPUT_DIR = "./wiredrive-downloads/Theo_LeSourd";

// ── Asset data extracted from Wiredrive presentation ────────────

interface Asset {
  id: number;
  title: string;
  brand: string | null;
  duration: number;
  sizeMb: number;
  extension: string;
  downloadUrl: string;
  thumbnailUrl: string;
  originalFilename: string;
}

const assets: Asset[] = [
  {
    id: 141138747,
    title: "Slate",
    brand: "Theo Le Sourd",
    duration: 5.01,
    sizeMb: 65.99,
    extension: "mov",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/141138747/size/primary/ts/1707424452/type/library/client/WD-WV2DA/TheoLesourd_FF_Slate_2.mov?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/141138747/size/large/ts/1707381261/type/library/client/WD-WV2DA/141138747_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "TheoLesourd_FF_Slate_2.mov",
  },
  {
    id: 137835552,
    title: "andromeda // WIP",
    brand: null,
    duration: 73.2,
    sizeMb: 937.51,
    extension: "mov",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/137835552/size/primary/ts/1695141429/type/library/client/WD-WV2DA/0918_Andromeda.v4.4_online.mov?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/137835552/size/large/ts/1695090576/type/library/client/WD-WV2DA/137835552_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "0918_Andromeda.v4.4_online.mov",
  },
  {
    id: 134419855,
    title: "boom boom",
    brand: "Lewis OfMan",
    duration: 133.67,
    sizeMb: 1740.8,
    extension: "mov",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134419855/size/primary/ts/1683765983/type/library/client/WD-WV2DA/4.+Lewis+OfMan_Boom+Boom_master_422+HQ.mov?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134419855/size/large/ts/1683808470/type/library/client/WD-WV2DA/134419855_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "4. Lewis OfMan_Boom Boom_master_422 HQ.mov",
  },
  {
    id: 134517212,
    title: "boom boom [cut down]",
    brand: "Lewis OfMan",
    duration: 30.33,
    sizeMb: 181.96,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134517212/size/primary/ts/1684177614/type/library/client/WD-WV2DA/Lewis+OfMan_+Boom+Boom+MV_30s.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134517212/size/large/ts/1684134289/type/library/client/WD-WV2DA/134517212_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "Lewis OfMan_ Boom Boom MV_30s.mp4",
  },
  {
    id: 134287112,
    title: "discover",
    brand: "Ground Cover",
    duration: 60.0,
    sizeMb: 1208.32,
    extension: "mov",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134287112/size/primary/ts/1683567472/type/library/client/WD-WV2DA/1.+Ground+Cover_422+HQ.mov?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134287112/size/large/ts/1683524132/type/library/client/WD-WV2DA/134287112_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "1. Ground Cover_422 HQ.mov",
  },
  {
    id: 137835563,
    title: "find the greatness",
    brand: "Air Jordan",
    duration: 27.13,
    sizeMb: 825.4,
    extension: "mov",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/137835563/size/primary/ts/1695141457/type/library/client/WD-WV2DA/0915_Air+Jordan_Find+the+Greatness_422+HQ.mov?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/137835563/size/large/ts/1695090408/type/library/client/WD-WV2DA/137835563_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "0915_Air Jordan_Find the Greatness_422 HQ.mov",
  },
  {
    id: 134447079,
    title: "hold your breath [short film]",
    brand: null,
    duration: 733.82,
    sizeMb: 876.76,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134447079/size/primary/ts/1761591467/type/library/client/WD-WV2DA/2.+Hold+Your+Breath_Short+Film_h264_1.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134447079/size/large/ts/1761548777/type/library/client/WD-WV2DA/134447079_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "2. Hold Your Breath_Short Film_h264_1.mp4",
  },
  {
    id: 134418689,
    title: "Lewis OfMan x nyc",
    brand: "Lewis OfMan",
    duration: 60.02,
    sizeMb: 286.15,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134418689/size/primary/ts/1683763984/type/library/client/WD-WV2DA/2.+Lewis+OfMan+x+NYC_H264.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134418689/size/large/ts/1683718142/type/library/client/WD-WV2DA/134418689_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "2. Lewis OfMan x NYC_H264.mp4",
  },
  {
    id: 134418727,
    title: "life",
    brand: "Neil Baselo",
    duration: 101.08,
    sizeMb: 123.97,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134418727/size/primary/ts/1761591519/type/library/client/WD-WV2DA/2.+Neil+Baselo_Life_master_422+HQ.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134418727/size/large/ts/1761548408/type/library/client/WD-WV2DA/134418727_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "2. Neil Baselo_Life_master_422 HQ.mp4",
  },
  {
    id: 134517214,
    title: "life [cut-down]",
    brand: "Neil Baselo",
    duration: 30.0,
    sizeMb: 179.93,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134517214/size/primary/ts/1684177131/type/library/client/WD-WV2DA/Neil+Baselo_Life+MV_30s.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134517214/size/large/ts/1684133797/type/library/client/WD-WV2DA/134517214_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "Neil Baselo_Life MV_30s.mp4",
  },
  {
    id: 137809840,
    title: "mother",
    brand: "Brandt",
    duration: 90.0,
    sizeMb: 205.51,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/137809840/size/primary/ts/1695048257/type/library/client/WD-WV2DA/Brandt_DC_h264.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/137809840/size/large/ts/1695005052/type/library/client/WD-WV2DA/137809840_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "Brandt_DC_h264.mp4",
  },
  {
    id: 134418726,
    title: "purple",
    brand: "Retriever",
    duration: 156.96,
    sizeMb: 193.24,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134418726/size/primary/ts/1761590241/type/library/client/WD-WV2DA/1.+Retriever_Purple_master_422+HQ.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134418726/size/large/ts/1761547116/type/library/client/WD-WV2DA/134418726_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "1. Retriever_Purple_master_422 HQ.mp4",
  },
  {
    id: 134517215,
    title: "purple [cut-down]",
    brand: "Retriever",
    duration: 30.0,
    sizeMb: 180.02,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134517215/size/primary/ts/1684176601/type/library/client/WD-WV2DA/Retriever_Purple+MV_30s.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134517215/size/large/ts/1684133437/type/library/client/WD-WV2DA/134517215_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "Retriever_Purple MV_30s.mp4",
  },
  {
    id: 134419730,
    title: "ressaisis toi",
    brand: "ML",
    duration: 139.63,
    sizeMb: 170.75,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134419730/size/primary/ts/1761590714/type/library/client/WD-WV2DA/3.+ML_Ressaisis-toi_master_4444.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134419730/size/large/ts/1761547584/type/library/client/WD-WV2DA/134419730_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "3. ML_Ressaisis-toi_master_4444.mp4",
  },
  {
    id: 134517213,
    title: "ressaisis toi [cut-down]",
    brand: "ML",
    duration: 30.33,
    sizeMb: 181.84,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134517213/size/primary/ts/1684177351/type/library/client/WD-WV2DA/ML_Ressaisis-toi+MV_30s.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134517213/size/large/ts/1684133995/type/library/client/WD-WV2DA/134517213_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "ML_Ressaisis-toi MV_30s.mp4",
  },
  {
    id: 134518764,
    title: "sometimes i wonder [part ii]",
    brand: null,
    duration: 100.46,
    sizeMb: 594.38,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134518764/size/primary/ts/1684179881/type/library/client/WD-WV2DA/Sometimes+I+Wonder+Part+2_1min30.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134518764/size/large/ts/1684136327/type/library/client/WD-WV2DA/134518764_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "Sometimes I Wonder Part 2_1min30.mp4",
  },
  {
    id: 134518757,
    title: "sometimes i wonder [part i]",
    brand: null,
    duration: 89.96,
    sizeMb: 540.74,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134518757/size/primary/ts/1684178769/type/library/client/WD-WV2DA/Sometimes+I+Wonder+Part+1_1min30.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134518757/size/large/ts/1684135156/type/library/client/WD-WV2DA/134518757_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "Sometimes I Wonder Part 1_1min30.mp4",
  },
  {
    id: 134420686,
    title: "sometimes i wonder [short film]",
    brand: null,
    duration: 341.75,
    sizeMb: 1576.96,
    extension: "mp4",
    downloadUrl:
      "https://download.wiredrive.com/asset/assetId/134420686/size/primary/ts/1683822812/type/library/client/WD-WV2DA/1.+Sometimes+I+Wonder_Short+Film_h264.mp4?token=1d11a97a3&category=pres&action=download",
    thumbnailUrl:
      "https://download.wiredrive.com/asset/assetId/134420686/size/large/ts/1683770047/type/library/client/WD-WV2DA/134420686_large.jpg?token=1d11a97a3&category=pres&action=view",
    originalFilename: "1. Sometimes I Wonder_Short Film_h264.mp4",
  },
];

// ── Download helper ─────────────────────────────────────
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
          downloadFile(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
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

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  Wiredrive Import: ${DIRECTOR_NAME}`);
  console.log(`  Source: ${WIREDRIVE_URL}`);
  console.log(`  Roster Status: ${ROSTER_STATUS}`);
  console.log(`  Assets: ${assets.length}`);
  console.log(`  Dry run: ${DRY_RUN ? "YES" : "no"}`);
  console.log(`  Skip download: ${SKIP_DOWNLOAD ? "YES" : "no"}`);
  console.log(`${"=".repeat(70)}\n`);

  // List all assets
  console.log("Videos to import:");
  console.log("-".repeat(70));
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const dur = a.duration
      ? `${Math.floor(a.duration / 60)}:${String(
          Math.floor(a.duration % 60)
        ).padStart(2, "0")}`
      : "--";
    const brand = a.brand ? `[${a.brand}] ` : "";
    console.log(
      `  ${String(i + 1).padStart(2)}. ${brand}${a.title}  [${dur}]  ${a.sizeMb.toFixed(0)} MB`
    );
  }
  console.log("-".repeat(70));
  console.log();

  if (DRY_RUN) {
    console.log("DRY RUN -- no database changes or downloads performed.\n");
    return;
  }

  // 1. Find or create director
  let director = await prisma.director.findFirst({
    where: { slug: DIRECTOR_SLUG },
  });

  if (!director) {
    director = await prisma.director.create({
      data: {
        name: DIRECTOR_NAME,
        slug: DIRECTOR_SLUG,
        rosterStatus: ROSTER_STATUS,
        categories: [],
      },
    });
    console.log(
      `Created director: ${director.name} (${director.id}) [${ROSTER_STATUS}]`
    );
  } else {
    // Update roster status if needed
    if (director.rosterStatus !== ROSTER_STATUS) {
      director = await prisma.director.update({
        where: { id: director.id },
        data: { rosterStatus: ROSTER_STATUS },
      });
      console.log(
        `Updated director roster status: ${director.name} -> ${ROSTER_STATUS}`
      );
    } else {
      console.log(
        `Using existing director: ${director.name} (${director.id}) [${director.rosterStatus}]`
      );
    }
  }

  // 2. Create project records and download files
  let imported = 0;
  let skipped = 0;
  let downloadErrors = 0;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const prefix = `[${i + 1}/${assets.length}]`;

    // Check for existing project (by title + director)
    const existing = await prisma.project.findFirst({
      where: {
        directorId: director.id,
        title: asset.title,
      },
    });

    if (existing) {
      console.log(`${prefix} SKIP (exists): ${asset.title}`);
      skipped++;
      continue;
    }

    // Create project record
    const project = await prisma.project.create({
      data: {
        directorId: director.id,
        title: asset.title,
        brand: asset.brand,
        duration: asset.duration,
        muxStatus: "waiting",
        originalFilename: asset.originalFilename,
        fileSizeMb: asset.sizeMb,
        thumbnailUrl: asset.thumbnailUrl,
        isPublished: true,
      },
    });
    console.log(`${prefix} Created project: ${asset.title} (${project.id})`);
    imported++;

    // Download video file
    if (!SKIP_DOWNLOAD) {
      const safeName = asset.title
        .replace(/[^a-zA-Z0-9_\-\[\] ]/g, "_")
        .substring(0, 80)
        .trim();
      const localPath = path.join(OUTPUT_DIR, `${safeName}.${asset.extension}`);

      if (fs.existsSync(localPath)) {
        const existingSize = fs.statSync(localPath).size;
        console.log(
          `${prefix}   File exists (${(existingSize / 1024 / 1024).toFixed(1)} MB), skipping download`
        );
      } else {
        console.log(`${prefix}   Downloading to ${localPath}...`);
        try {
          await downloadFile(asset.downloadUrl, localPath);
          const fileSize = fs.statSync(localPath).size;
          console.log(
            `${prefix}   Downloaded (${(fileSize / 1024 / 1024).toFixed(1)} MB)`
          );
        } catch (err) {
          console.log(`${prefix}   Download FAILED: ${err}`);
          downloadErrors++;
        }
      }
    }
  }

  // 3. Create activity update for the import
  try {
    await prisma.update.create({
      data: {
        type: "DIRECTOR_ADDED",
        title: `Added: ${DIRECTOR_NAME} (off-roster)`,
        body: `Imported ${imported} projects from Wiredrive (${WIREDRIVE_URL})`,
        directorId: director.id,
      },
    });
  } catch {
    // Non-critical
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(
    `  Import complete: ${imported} imported, ${skipped} skipped, ${downloadErrors} download errors`
  );
  console.log(`${"=".repeat(70)}\n`);
}

main()
  .catch((err) => {
    console.error("\nImport failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
