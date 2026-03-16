import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";
import archiver from "archiver";
import { Readable } from "stream";

export const maxDuration = 60;

/**
 * GET /api/reels/[id]/download-videos?token=<screeningToken>
 *
 * Streams a ZIP of all original video files for every spot in the reel.
 * Spots without an r2Key are skipped silently.
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

  const downloadableItems = reel.items.filter((item) => item.project.r2Key);

  if (downloadableItems.length === 0) {
    return NextResponse.json(
      { error: "No downloadable files available for this reel" },
      { status: 404 }
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
      const archive = archiver("zip", { zlib: { level: 1 } }); // level 1 = fast, videos are already compressed

      archive.on("data", (chunk: Buffer) => writer.write(chunk));
      archive.on("end", () => writer.close());
      archive.on("error", (err) => {
        console.error("[Download Videos] Archive error:", err);
        writer.close();
      });

      for (let i = 0; i < downloadableItems.length; i++) {
        const { project, sortOrder } = downloadableItems[i];
        if (!project.r2Key) continue;

        try {
          const signedUrl = await getDownloadUrl(project.r2Key, 300);
          const response = await fetch(signedUrl);
          if (!response.ok || !response.body) continue;

          const ext = project.originalFilename
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

          // Stream directly from R2 into the archive without buffering the whole file
          const nodeStream = Readable.fromWeb(response.body as import("stream/web").ReadableStream);
          archive.append(nodeStream, { name: filename });
        } catch (err) {
          console.error(`[Download Videos] Skipping ${project.title}:`, err);
        }
      }

      archive.finalize();
    } catch (err) {
      console.error("[Download Videos] ZIP generation failed:", err);
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
    },
  });
}
