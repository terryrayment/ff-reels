/**
 * Mirror Wiredrive-hosted project thumbnails into R2 and update Project.thumbnailUrl.
 *
 * Usage:
 *   npx tsx scripts/mirror-wiredrive-thumbnails.ts --director "Le Ged" --dry-run
 *   npx tsx scripts/mirror-wiredrive-thumbnails.ts --director "Le Ged"
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { uploadBuffer } from "../src/lib/r2/client";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx === -1 ? undefined : args[idx + 1];
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const DIRECTOR_NAME = getArg("director");
const DRY_RUN = hasFlag("dry-run");

if (!DIRECTOR_NAME) {
  console.error(
    'Usage: npx tsx scripts/mirror-wiredrive-thumbnails.ts --director "Name" [--dry-run]',
  );
  process.exit(1);
}

function isWiredriveUrl(url: string | null | undefined) {
  return (
    typeof url === "string" &&
    /(^https?:\/\/)?(([^/]+\.)?wiredrive\.com|wdrv\.it)\//i.test(url)
  );
}

function extensionFromContentType(contentType: string | null, fallbackUrl: string) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";

  const pathname = new URL(fallbackUrl).pathname.toLowerCase();
  if (pathname.endsWith(".png")) return "png";
  if (pathname.endsWith(".webp")) return "webp";
  if (pathname.endsWith(".gif")) return "gif";
  return "jpg";
}

function writeAuditLog(payload: object) {
  const dir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `wiredrive-thumbnails-${DIRECTOR_NAME!.replace(/[^a-zA-Z0-9_-]/g, "_")}-${stamp}.json`;
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2), "utf8");
  return fullPath;
}

async function main() {
  console.log("\nMirror Wiredrive Thumbnails");
  console.log(`Director: ${DIRECTOR_NAME}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  const projects = await prisma.project.findMany({
    where: {
      director: { name: DIRECTOR_NAME },
    },
    select: {
      id: true,
      brand: true,
      title: true,
      thumbnailUrl: true,
    },
    orderBy: [{ brand: "asc" }, { title: "asc" }],
  });

  const candidates = projects.filter((project) => isWiredriveUrl(project.thumbnailUrl));

  const audit = {
    director: DIRECTOR_NAME,
    dryRun: DRY_RUN,
    summary: {
      projectsFound: projects.length,
      wiredriveThumbnailsFound: candidates.length,
    },
    candidates,
  };

  const auditPath = writeAuditLog(audit);
  console.log(`Projects found: ${projects.length}`);
  console.log(`Wiredrive thumbnails found: ${candidates.length}`);
  console.log(`Audit log: ${auditPath}\n`);

  if (DRY_RUN || candidates.length === 0) {
    if (DRY_RUN) {
      console.log("Dry run only. No thumbnails mirrored.");
    }
    return;
  }

  const results: Array<{
    projectId: string;
    title: string;
    oldThumbnailUrl: string | null;
    newThumbnailUrl?: string;
    status: "updated" | "failed";
    error?: string;
  }> = [];

  for (const project of candidates) {
    try {
      console.log(`Mirroring ${project.brand || "Unknown"} | ${project.title}`);
      const response = await fetch(project.thumbnailUrl!);
      if (!response.ok) {
        throw new Error(`Thumbnail fetch failed with ${response.status}.`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = extensionFromContentType(contentType, project.thumbnailUrl!);
      const r2Key = `thumbnails/${project.id}/wiredrive-migrated.${ext}`;

      await uploadBuffer(r2Key, buffer, contentType);
      const mirroredUrl = `/api/projects/${project.id}/thumbnail?key=${encodeURIComponent(r2Key)}`;

      await prisma.project.update({
        where: { id: project.id },
        data: { thumbnailUrl: mirroredUrl },
      });

      results.push({
        projectId: project.id,
        title: project.title,
        oldThumbnailUrl: project.thumbnailUrl,
        newThumbnailUrl: mirroredUrl,
        status: "updated",
      });
    } catch (error) {
      results.push({
        projectId: project.id,
        title: project.title,
        oldThumbnailUrl: project.thumbnailUrl,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`  Failed: ${project.title} — ${results[results.length - 1].error}`);
    }
  }

  const resultPath = writeAuditLog({
    ...audit,
    execution: {
      updated: results.filter((result) => result.status === "updated").length,
      failed: results.filter((result) => result.status === "failed").length,
      results,
    },
  });

  console.log("\nMirror complete");
  console.log(`Updated: ${results.filter((result) => result.status === "updated").length}`);
  console.log(`Failed: ${results.filter((result) => result.status === "failed").length}`);
  console.log(`Execution log: ${resultPath}`);
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
