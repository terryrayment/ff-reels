import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { resolveProjectDownload } from "@/lib/mux/downloads";
import archiver from "archiver";
import { Readable } from "stream";
import { finished } from "stream/promises";

export const maxDuration = 300;

function buildArchiveFilename(
  project: {
    title: string | null;
    brand: string | null;
  },
  sortOrder: number,
  ext: string,
) {
  const safeName = (project.title || "video")
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/\s+/g, "_")
    .trim() || "video";
  const brand = project.brand
    ? `_${project.brand.replace(/[^a-zA-Z0-9]/g, "")}`
    : "";
  const num = String(sortOrder + 1).padStart(2, "0");
  return `${num}_${safeName}${brand}.${ext}`;
}

function buildStatusMessage(params: {
  readyCount: number;
  pendingCount: number;
  unavailableCount: number;
}) {
  if (params.readyCount === 0 && params.pendingCount > 0) {
    return "Videos are still being prepared for download. Try again shortly.";
  }

  if (params.readyCount === 0) {
    return "No downloadable files are currently ready for this reel.";
  }

  return null;
}

type ResolvedItem = {
  sortOrder: number;
  title: string | null;
  archiveFilename: string | null;
  resolution: Awaited<ReturnType<typeof resolveProjectDownload>>;
};

async function resolveReelItems(
  items: Array<{
    sortOrder: number;
    project: {
      id: string;
      title: string | null;
      brand: string | null;
      r2Key: string | null;
      originalFilename: string | null;
      muxAssetId: string | null;
      muxPlaybackId: string | null;
    };
  }>,
): Promise<ResolvedItem[]> {
  const results: ResolvedItem[] = [];
  const concurrency = 4;

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const resolution = await resolveProjectDownload(item.project);
        const ext = resolution.status === "ready" ? resolution.extension : null;
        return {
          sortOrder: item.sortOrder,
          title: item.project.title,
          archiveFilename: ext
            ? buildArchiveFilename(item.project, item.sortOrder, ext)
            : null,
          resolution,
        };
      }),
    );
    results.push(...batchResults);
  }

  return results;
}

async function appendRemoteVideoToArchive(params: {
  archive: archiver.Archiver;
  url: string;
  archiveFilename: string;
}) {
  const response = await fetch(params.url);
  if (!response.ok) {
    throw new Error(`Source fetch failed with ${response.status}.`);
  }

  if (!response.body) {
    throw new Error("Source returned no body.");
  }

  const nodeStream = Readable.fromWeb(
    response.body as import("stream/web").ReadableStream,
  );

  params.archive.append(nodeStream, { name: params.archiveFilename });
  await finished(nodeStream);
}

/**
 * GET /api/reels/[id]/download-videos?token=<screeningToken>
 *
 * Streams a ZIP of all video files for every spot in the reel.
 * Download source priority: R2 original → ready Mux static rendition.
 * Auth: valid session OR valid screening link token.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const token = req.nextUrl.searchParams.get("token");
  const preflight = req.nextUrl.searchParams.get("preflight") === "1";

  if (!session && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session && token) {
    const link = await prisma.screeningLink.findFirst({
      where: {
        token,
        isActive: true,
        reel: { id: params.id },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!link) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }

  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      director: { select: { name: true } },
      items: {
        select: {
          sortOrder: true,
          project: {
            select: {
              id: true,
              title: true,
              brand: true,
              r2Key: true,
              originalFilename: true,
              muxAssetId: true,
              muxPlaybackId: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!reel) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  // Items that have either an R2 key or a Mux playback ID
  const downloadableItems = reel.items.filter(
    (item) => item.project.r2Key || item.project.muxPlaybackId
  );

  if (downloadableItems.length === 0) {
    return NextResponse.json(
      { error: "No downloadable files available for this reel" },
      { status: 404 }
    );
  }

  const resolvedItems = await resolveReelItems(downloadableItems);
  const readyItems = resolvedItems.filter(
    (item): item is ResolvedItem & {
      archiveFilename: string;
      resolution: Extract<ResolvedItem["resolution"], { status: "ready" }>;
    } => item.resolution.status === "ready" && !!item.archiveFilename,
  );
  const pendingItems = resolvedItems.filter(
    (item): item is ResolvedItem & {
      resolution: Extract<ResolvedItem["resolution"], { status: "preparing" }>;
    } => item.resolution.status === "preparing",
  );
  const unavailableItems = resolvedItems.filter(
    (item): item is ResolvedItem & {
      resolution: Extract<ResolvedItem["resolution"], { status: "unavailable" }>;
    } => item.resolution.status === "unavailable",
  );

  const counts = {
    totalCount: downloadableItems.length,
    readyCount: readyItems.length,
    pendingCount: pendingItems.length,
    unavailableCount: unavailableItems.length,
  };
  const blockingMessage = buildStatusMessage(counts);

  if (preflight || counts.readyCount === 0) {
    if (blockingMessage) {
      return NextResponse.json(
        { error: blockingMessage, ...counts },
        { status: counts.pendingCount > 0 ? 409 : 404 },
      );
    }

    return NextResponse.json(counts);
  }

  const zipFilename = `${reel.director.name} - ${reel.title}`
    .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
    .replace(/\s+/g, "_")
    .trim() + ".zip";

  const archive = archiver("zip", {
    store: true,
    forceZip64: true,
  });

  archive.on("warning", (err) => {
    console.warn("[Download Videos] Archive warning:", err);
  });
  archive.on("error", (err) => {
    console.error("[Download Videos] Archive error:", err);
    archive.destroy(err);
  });

  void (async () => {
    try {
      const statusLines: string[] = [];

      for (const item of pendingItems) {
        statusLines.push(
          `${String(item.sortOrder + 1).padStart(2, "0")} ${item.title || "Untitled"}: ${item.resolution.message}`,
        );
      }

      for (const item of unavailableItems) {
        statusLines.push(
          `${String(item.sortOrder + 1).padStart(2, "0")} ${item.title || "Untitled"}: ${item.resolution.message}`,
        );
      }

      for (const item of readyItems) {
        const { archiveFilename, resolution, title } = item;

        try {
          await appendRemoteVideoToArchive({
            archive,
            url: resolution.url,
            archiveFilename,
          });
        } catch (err) {
          console.error(`[Download Videos] Skipping ${title}:`, err);
          statusLines.push(
            `${String(item.sortOrder + 1).padStart(2, "0")} ${title || "Untitled"}: ${
              err instanceof Error ? err.message : "Fetch failed during ZIP creation."
            }`,
          );
        }
      }

      if (statusLines.length > 0) {
        const report = [
          "Some reel videos were not included in this ZIP.",
          "",
          ...statusLines,
        ].join("\n");
        archive.append(report, { name: "DOWNLOAD_STATUS.txt" });
      }

      await archive.finalize();
    } catch (err) {
      console.error("[Download Videos] ZIP generation failed:", err);
      archive.destroy(err instanceof Error ? err : new Error("ZIP generation failed."));
    }
  })();

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
    },
  });
}
