import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";
import { getMux } from "@/lib/mux/client";
import archiver from "archiver";
import { Readable } from "stream";

export const maxDuration = 120;

/**
 * GET /api/reels/[id]/download-videos?token=<screeningToken>
 *
 * Streams a ZIP of all video files for every spot in the reel.
 * Download source priority: R2 original → Mux static rendition (high.mp4).
 * Spots without any downloadable source are skipped silently.
 * Auth: valid session OR valid screening link token.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const token = req.nextUrl.searchParams.get("token");

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

  // Check Mux assets for mp4_support and enable if needed
  const mux = getMux();
  let preparingCount = 0;
  const assetStatuses = new Map<string, { mp4Ready: boolean }>();

  for (const item of downloadableItems) {
    const { project } = item;
    if (project.r2Key) {
      // R2 is always ready
      assetStatuses.set(project.id, { mp4Ready: true });
      continue;
    }
    if (project.muxAssetId && project.muxPlaybackId) {
      try {
        const asset = await mux.video.assets.retrieve(project.muxAssetId);
        if (asset.mp4_support !== "standard") {
          await mux.video.assets.updateMP4Support(project.muxAssetId, { mp4_support: "standard" });
          preparingCount++;
          assetStatuses.set(project.id, { mp4Ready: false });
        } else if (asset.static_renditions?.status === "ready") {
          assetStatuses.set(project.id, { mp4Ready: true });
        } else {
          preparingCount++;
          assetStatuses.set(project.id, { mp4Ready: false });
        }
      } catch {
        assetStatuses.set(project.id, { mp4Ready: false });
      }
    }
  }

  // If more than half aren't ready, tell the user to wait
  const readyItems = downloadableItems.filter(
    (item) => assetStatuses.get(item.project.id)?.mp4Ready
  );

  if (readyItems.length === 0) {
    return NextResponse.json(
      {
        error: `Downloads are being prepared for ${preparingCount} video${preparingCount === 1 ? "" : "s"}. Please try again in a minute or two.`,
        preparing: preparingCount,
      },
      { status: 202 }
    );
  }

  const zipFilename = `${reel.director.name} - ${reel.title}`
    .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
    .replace(/\s+/g, "_")
    .trim() + ".zip";

  // Stream the ZIP
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    try {
      const archive = archiver("zip", { zlib: { level: 1 } });

      archive.on("data", (chunk: Buffer) => {
        writer.write(chunk).catch(() => { archive.abort(); });
      });
      archive.on("end", () => {
        writer.close().catch(() => {});
      });
      archive.on("error", (err) => {
        console.error("[Download Videos] Archive error:", err);
        writer.close().catch(() => {});
      });

      for (let i = 0; i < readyItems.length; i++) {
        const { project, sortOrder } = readyItems[i];

        try {
          let downloadUrl: string;

          if (project.r2Key) {
            // Download from R2
            downloadUrl = await getDownloadUrl(project.r2Key, 300);
          } else if (project.muxPlaybackId) {
            // Download from Mux static rendition
            downloadUrl = `https://stream.mux.com/${project.muxPlaybackId}/high.mp4`;
          } else {
            continue;
          }

          const response = await fetch(downloadUrl);
          if (!response.ok || !response.body) continue;

          const ext = project.r2Key && project.originalFilename
            ? project.originalFilename.split(".").pop() ?? "mp4"
            : "mp4";
          const safeName = project.title
            .replace(/[^a-zA-Z0-9\s\-_]/g, "")
            .replace(/\s+/g, "_")
            .trim();
          const brand = project.brand
            ? `_${project.brand.replace(/[^a-zA-Z0-9]/g, "")}`
            : "";
          const num = String(sortOrder + 1).padStart(2, "0");
          const filename = `${num}_${safeName}${brand}.${ext}`;

          const nodeStream = Readable.fromWeb(response.body as import("stream/web").ReadableStream);
          archive.append(nodeStream, { name: filename });
        } catch (err) {
          console.error(`[Download Videos] Skipping ${project.title}:`, err);
        }
      }

      archive.finalize();
    } catch (err) {
      console.error("[Download Videos] ZIP generation failed:", err);
      writer.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
    },
  });
}
