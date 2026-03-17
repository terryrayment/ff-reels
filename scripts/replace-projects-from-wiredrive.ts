/**
 * Replace an existing director's project Mux assets from a Wiredrive presentation.
 *
 * Matches existing Project records by normalized brand + title and swaps only the
 * Mux asset/playback IDs, preserving the existing Project IDs and relationships.
 *
 * Usage:
 *   npx tsx scripts/replace-projects-from-wiredrive.ts --url "https://wdrv.it/XXXXX" --director "Terry Rayment" --dry-run
 *   npx tsx scripts/replace-projects-from-wiredrive.ts --url "https://wdrv.it/XXXXX" --director "Terry Rayment"
 *
 * Options:
 *   --url          Wiredrive presentation URL
 *   --director     Director name in FF Reels
 *   --dry-run      Match only, no Mux or DB writes
 *   --concurrency  Parallel replacement count (default: 2)
 *   --skip-updated-within-minutes  Skip projects updated in the last N minutes
 *   --only-project-ids  Comma-separated list of project IDs to update
 */

import { PrismaClient } from "@prisma/client";
import Mux from "@mux/mux-node";
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

const PRESENTATION_URL = getArg("url");
const DIRECTOR_NAME = getArg("director");
const DRY_RUN = hasFlag("dry-run");
const concurrencyFlag = getArg("concurrency");
const CONCURRENCY = concurrencyFlag ? parseInt(concurrencyFlag, 10) || 2 : 2;
const skipUpdatedWithinMinutesFlag = getArg("skip-updated-within-minutes");
const SKIP_UPDATED_WITHIN_MINUTES = skipUpdatedWithinMinutesFlag
  ? Math.max(0, parseInt(skipUpdatedWithinMinutesFlag, 10) || 0)
  : 0;
const onlyProjectIdsFlag = getArg("only-project-ids");
const ONLY_PROJECT_IDS = onlyProjectIdsFlag
  ? new Set(
      onlyProjectIdsFlag
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
  : null;

if (!PRESENTATION_URL || !DIRECTOR_NAME) {
  console.error(
    "Usage: npx tsx scripts/replace-projects-from-wiredrive.ts --url <wiredrive-url> --director <name> [--dry-run]",
  );
  process.exit(1);
}

if (!DRY_RUN && (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET)) {
  console.error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required");
  process.exit(1);
}

const mux =
  DRY_RUN
    ? null
    : new Mux({
        tokenId: process.env.MUX_TOKEN_ID!,
        tokenSecret: process.env.MUX_TOKEN_SECRET!,
      });

interface WiredriveAsset {
  id: number;
  label: string;
  extension: string;
  numericDuration: string;
  size: number;
  mimeCategory: string;
  type: string;
  file: Record<string, { url: string }>;
}

interface ParsedAsset {
  wiredriveId: number;
  label: string;
  brand: string | null;
  title: string;
  duration: number | null;
  sizeBytes: number | null;
  extension: string;
  downloadUrl: string;
  thumbnailUrl: string | null;
  key: string;
}

type ProjectRecord = {
  id: string;
  brand: string | null;
  title: string;
  duration: number | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  updatedAt: Date;
  key: string;
};

type MatchPlan = {
  project: ProjectRecord;
  asset: ParsedAsset;
  durationDelta: number | null;
};

function extractJsonArray(html: string, startMarker: string): string | null {
  const markerIdx = html.indexOf(startMarker);
  if (markerIdx === -1) return null;

  let pos = markerIdx + startMarker.length;
  while (pos < html.length && html[pos] !== "[") pos++;
  if (pos >= html.length) return null;

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
      if (depth === 0) return html.substring(start, i + 1);
    }
  }

  return null;
}

function parseLabel(label: string): { brand: string | null; title: string } {
  const parts = label.split("|").map((s) => s.trim());
  if (parts.length >= 2) {
    return {
      brand: parts[0],
      title: parts.slice(1).join(" | "),
    };
  }
  return { brand: null, title: label };
}

function normalize(value: string | null | undefined): string {
  return (value || "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildKey(brand: string | null, title: string): string {
  return `${normalize(brand)}|${normalize(title)}`;
}

function getDownloadUrl(asset: WiredriveAsset): string | null {
  return asset.file?.download?.url || asset.file?.primary?.url || asset.file?.web?.url || null;
}

function getThumbnailUrl(asset: WiredriveAsset): string | null {
  return (
    asset.file?.large?.url ||
    asset.file?.max?.url ||
    asset.file?.small?.url ||
    asset.file?.tiny?.url ||
    null
  );
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

async function mirrorThumbnailToR2(
  projectId: string,
  wiredriveAssetId: number,
  thumbnailUrl: string | null,
) {
  if (!thumbnailUrl) return null;

  const response = await fetch(thumbnailUrl);
  if (!response.ok) {
    throw new Error(`Thumbnail fetch failed with ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = extensionFromContentType(contentType, thumbnailUrl);
  const r2Key = `thumbnails/${projectId}/wiredrive-${wiredriveAssetId}.${ext}`;

  await uploadBuffer(r2Key, buffer, contentType);
  return `/api/projects/${projectId}/thumbnail?key=${encodeURIComponent(r2Key)}`;
}

async function fetchPresentation(url: string): Promise<ParsedAsset[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Wiredrive presentation: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const jsonStr = extractJsonArray(html, "dataset:");
  if (!jsonStr) {
    throw new Error("Could not extract Wiredrive dataset from presentation page");
  }

  const assets = JSON.parse(jsonStr) as WiredriveAsset[];

  return assets
    .filter(
      (asset) =>
        asset.mimeCategory === "video" ||
        asset.type === "video" ||
        ["mp4", "mov", "m4v", "avi", "webm"].includes(
          (asset.extension || "").toLowerCase(),
        ),
    )
    .map((asset) => {
      const { brand, title } = parseLabel(asset.label);
      const downloadUrl = getDownloadUrl(asset);
      if (!downloadUrl) {
        throw new Error(`Missing download URL for Wiredrive asset: ${asset.label}`);
      }

      return {
        wiredriveId: asset.id,
        label: asset.label,
        brand,
        title,
        duration: asset.numericDuration ? parseFloat(asset.numericDuration) : null,
        sizeBytes: asset.size || null,
        extension: (asset.extension || "mp4").toLowerCase(),
        downloadUrl,
        thumbnailUrl: getThumbnailUrl(asset),
        key: buildKey(brand, title),
      };
    });
}

function groupByKey<T extends { key: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const existing = grouped.get(item.key);
    if (existing) existing.push(item);
    else grouped.set(item.key, [item]);
  }
  return grouped;
}

function pairByDuration(
  projects: ProjectRecord[],
  assets: ParsedAsset[],
): { matches: MatchPlan[]; leftovers: { projects: ProjectRecord[]; assets: ParsedAsset[] } } {
  const remainingProjects = [...projects];
  const remainingAssets = [...assets];
  const matches: MatchPlan[] = [];

  while (remainingProjects.length > 0 && remainingAssets.length > 0) {
    let bestProjectIdx = -1;
    let bestAssetIdx = -1;
    let bestDelta = Number.POSITIVE_INFINITY;

    for (let pIdx = 0; pIdx < remainingProjects.length; pIdx++) {
      for (let aIdx = 0; aIdx < remainingAssets.length; aIdx++) {
        const pDur = remainingProjects[pIdx].duration;
        const aDur = remainingAssets[aIdx].duration;
        const delta =
          pDur == null || aDur == null ? Number.POSITIVE_INFINITY : Math.abs(pDur - aDur);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestProjectIdx = pIdx;
          bestAssetIdx = aIdx;
        }
      }
    }

    if (bestProjectIdx === -1 || bestAssetIdx === -1) break;

    const [project] = remainingProjects.splice(bestProjectIdx, 1);
    const [asset] = remainingAssets.splice(bestAssetIdx, 1);
    matches.push({
      project,
      asset,
      durationDelta:
        project.duration == null || asset.duration == null
          ? null
          : Math.abs(project.duration - asset.duration),
    });
  }

  return {
    matches,
    leftovers: {
      projects: remainingProjects,
      assets: remainingAssets,
    },
  };
}

async function waitForReadyAsset(assetId: string) {
  if (!mux) throw new Error("Mux client not initialized");

  for (let attempt = 0; attempt < 120; attempt++) {
    const asset = await mux.video.assets.retrieve(assetId);
    if (asset.status === "ready" && asset.playback_ids?.[0]?.id) {
      return {
        assetId,
        playbackId: asset.playback_ids[0].id,
        duration: asset.duration ?? null,
        aspectRatio: asset.aspect_ratio ?? null,
      };
    }
    if (asset.status === "errored") {
      throw new Error(`Mux asset ${assetId} errored during processing`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error(`Timed out waiting for Mux asset ${assetId} to become ready`);
}

async function createMuxAssetFromUrl(downloadUrl: string) {
  if (!mux) throw new Error("Mux client not initialized");

  const asset = await mux.video.assets.create({
    inputs: [{ url: downloadUrl }],
    playback_policy: ["public"],
    video_quality: "plus",
    max_resolution_tier: "2160p",
  });

  return waitForReadyAsset(asset.id);
}

function writeAuditLog(payload: object) {
  const dir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `wiredrive-replace-${DIRECTOR_NAME!.replace(/[^a-zA-Z0-9_-]/g, "_")}-${stamp}.json`;
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2), "utf8");
  return fullPath;
}

async function main() {
  console.log(`\nWiredrive Replace`);
  console.log(`Director: ${DIRECTOR_NAME}`);
  console.log(`Presentation: ${PRESENTATION_URL}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  if (SKIP_UPDATED_WITHIN_MINUTES > 0) {
    console.log(`Skip updated within: ${SKIP_UPDATED_WITHIN_MINUTES} minutes`);
  }
  if (ONLY_PROJECT_IDS) {
    console.log(`Only project IDs: ${ONLY_PROJECT_IDS.size}`);
  }
  console.log("");

  const assets = await fetchPresentation(PRESENTATION_URL!);
  const director = await prisma.director.findFirst({
    where: { name: DIRECTOR_NAME },
    select: {
      id: true,
      name: true,
      projects: {
        select: {
          id: true,
          brand: true,
          title: true,
          duration: true,
          muxAssetId: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          updatedAt: true,
        },
        orderBy: [{ brand: "asc" }, { title: "asc" }],
      },
    },
  });

  if (!director) {
    throw new Error(`Director not found: ${DIRECTOR_NAME}`);
  }

  const projectCutoff =
    SKIP_UPDATED_WITHIN_MINUTES > 0
      ? new Date(Date.now() - SKIP_UPDATED_WITHIN_MINUTES * 60 * 1000)
      : null;

  const projects: ProjectRecord[] = director.projects.map((project) => ({
      ...project,
      key: buildKey(project.brand, project.title),
    }));

  const assetsByKey = groupByKey(assets);
  const projectsByKey = groupByKey(projects);

  const matchPlans: MatchPlan[] = [];
  const unmatchedAssets: ParsedAsset[] = [];
  const unmatchedProjects: ProjectRecord[] = [];
  const ambiguousGroups: Array<{
    key: string;
    assetCount: number;
    projectCount: number;
    assets: ParsedAsset[];
    projects: ProjectRecord[];
  }> = [];

  const allKeys = new Set([...assetsByKey.keys(), ...projectsByKey.keys()]);

  for (const key of allKeys) {
    const keyAssets = assetsByKey.get(key) || [];
    const keyProjects = projectsByKey.get(key) || [];

    if (keyAssets.length === 0) {
      unmatchedProjects.push(...keyProjects);
      continue;
    }
    if (keyProjects.length === 0) {
      unmatchedAssets.push(...keyAssets);
      continue;
    }

    const paired = pairByDuration(keyProjects, keyAssets);
    matchPlans.push(...paired.matches);

    if (paired.leftovers.assets.length > 0 || paired.leftovers.projects.length > 0) {
      ambiguousGroups.push({
        key,
        assetCount: keyAssets.length,
        projectCount: keyProjects.length,
        assets: keyAssets,
        projects: keyProjects,
      });
      unmatchedAssets.push(...paired.leftovers.assets);
      unmatchedProjects.push(...paired.leftovers.projects);
    }
  }

  const queuedMatchPlans = projectCutoff
    ? matchPlans.filter((plan) => plan.project.updatedAt < projectCutoff)
    : matchPlans;
  const scopedMatchPlans = ONLY_PROJECT_IDS
    ? queuedMatchPlans.filter((plan) => ONLY_PROJECT_IDS.has(plan.project.id))
    : queuedMatchPlans;
  const skippedRecentPlans = matchPlans.length - queuedMatchPlans.length;
  const skippedByProjectScope = queuedMatchPlans.length - scopedMatchPlans.length;

  const audit = {
    director: DIRECTOR_NAME,
    presentationUrl: PRESENTATION_URL,
    dryRun: DRY_RUN,
    summary: {
      assetsFound: assets.length,
      projectsFound: projects.length,
      matchesPlanned: scopedMatchPlans.length,
      skippedRecentlyUpdated: skippedRecentPlans,
      skippedOutsideProjectScope: skippedByProjectScope,
      unmatchedAssets: unmatchedAssets.length,
      unmatchedProjects: unmatchedProjects.length,
      ambiguousGroups: ambiguousGroups.length,
    },
    matches: scopedMatchPlans.map((plan) => ({
      projectId: plan.project.id,
      brand: plan.project.brand,
      title: plan.project.title,
      projectDuration: plan.project.duration,
      wiredriveDuration: plan.asset.duration,
      durationDelta: plan.durationDelta,
      oldMuxAssetId: plan.project.muxAssetId,
      oldMuxPlaybackId: plan.project.muxPlaybackId,
      wiredriveId: plan.asset.wiredriveId,
      wiredriveLabel: plan.asset.label,
      wiredriveThumbnailUrl: plan.asset.thumbnailUrl,
    })),
    unmatchedAssets: unmatchedAssets.map((asset) => ({
      wiredriveId: asset.wiredriveId,
      label: asset.label,
      duration: asset.duration,
    })),
    unmatchedProjects: unmatchedProjects.map((project) => ({
      projectId: project.id,
      brand: project.brand,
      title: project.title,
      duration: project.duration,
    })),
    ambiguousGroups: ambiguousGroups.map((group) => ({
      key: group.key,
      assetCount: group.assetCount,
      projectCount: group.projectCount,
      assets: group.assets.map((asset) => ({
        wiredriveId: asset.wiredriveId,
        label: asset.label,
        duration: asset.duration,
      })),
      projects: group.projects.map((project) => ({
        projectId: project.id,
        brand: project.brand,
        title: project.title,
        duration: project.duration,
      })),
    })),
  };

  const auditPath = writeAuditLog(audit);
  console.log(`Assets found: ${assets.length}`);
  console.log(`Projects found: ${projects.length}`);
  console.log(`Planned replacements: ${scopedMatchPlans.length}`);
  if (skippedRecentPlans > 0) {
    console.log(`Skipped recently updated: ${skippedRecentPlans}`);
  }
  if (skippedByProjectScope > 0) {
    console.log(`Skipped outside project scope: ${skippedByProjectScope}`);
  }
  console.log(`Unmatched assets: ${unmatchedAssets.length}`);
  console.log(`Unmatched projects: ${unmatchedProjects.length}`);
  console.log(`Ambiguous groups: ${ambiguousGroups.length}`);
  console.log(`Audit log: ${auditPath}\n`);

  if (ambiguousGroups.length > 0) {
    console.log("Ambiguous groups:");
    for (const group of ambiguousGroups) {
      console.log(`  - ${group.key} (${group.assetCount} assets / ${group.projectCount} projects)`);
    }
    console.log("");
  }

  if (DRY_RUN) {
    console.log("Dry run only. No Mux assets created and no DB rows updated.");
    return;
  }

  const results: Array<{
    projectId: string;
    title: string;
    oldMuxAssetId: string | null;
    newMuxAssetId?: string;
    newMuxPlaybackId?: string;
    status: "updated" | "failed";
    error?: string;
  }> = [];

  const queue = [...scopedMatchPlans];
  async function processOne(plan: MatchPlan) {
    try {
      console.log(`Replacing ${plan.project.brand || "Unknown"} | ${plan.project.title}`);
      const created = await createMuxAssetFromUrl(plan.asset.downloadUrl);
      let mirroredThumbnailUrl: string | null | undefined = undefined;

      if (plan.asset.thumbnailUrl) {
        try {
          mirroredThumbnailUrl = await mirrorThumbnailToR2(
            plan.project.id,
            plan.asset.wiredriveId,
            plan.asset.thumbnailUrl,
          );
        } catch (error) {
          console.warn(
            `  Thumbnail mirror failed for ${plan.project.title}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          mirroredThumbnailUrl = isWiredriveUrl(plan.project.thumbnailUrl) ? null : undefined;
        }
      } else if (isWiredriveUrl(plan.project.thumbnailUrl)) {
        mirroredThumbnailUrl = null;
      }

      await prisma.project.update({
        where: { id: plan.project.id },
        data: {
          muxAssetId: created.assetId,
          muxPlaybackId: created.playbackId,
          muxStatus: "ready",
          duration: created.duration,
          aspectRatio: created.aspectRatio,
          fileSizeMb: plan.asset.sizeBytes ? plan.asset.sizeBytes / (1024 * 1024) : undefined,
          thumbnailUrl: mirroredThumbnailUrl,
        },
      });

      results.push({
        projectId: plan.project.id,
        title: plan.project.title,
        oldMuxAssetId: plan.project.muxAssetId,
        newMuxAssetId: created.assetId,
        newMuxPlaybackId: created.playbackId,
        status: "updated",
      });
    } catch (error) {
      results.push({
        projectId: plan.project.id,
        title: plan.project.title,
        oldMuxAssetId: plan.project.muxAssetId,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`  Failed: ${plan.project.title} — ${results[results.length - 1].error}`);
    }
  }

  const executing = new Set<Promise<void>>();
  for (const plan of queue) {
    const task = processOne(plan).finally(() => {
      executing.delete(task);
    });
    executing.add(task);

    if (executing.size >= CONCURRENCY) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);

  const resultPath = writeAuditLog({
    ...audit,
    execution: {
      updated: results.filter((result) => result.status === "updated").length,
      failed: results.filter((result) => result.status === "failed").length,
      results,
    },
  });

  console.log("\nReplace complete");
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
