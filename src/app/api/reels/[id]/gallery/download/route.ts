import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";
import archiver from "archiver";

export const maxDuration = 30;

/**
 * GET /api/reels/[id]/gallery/download
 * Stream a ZIP of all gallery images for a reel.
 * Auth: valid session OR valid screening token as query param.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Auth: session or screening token
  const session = await getServerSession(authOptions);
  const token = req.nextUrl.searchParams.get("token");

  if (!session && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate screening token if no session
  if (!session && token) {
    const link = await prisma.screeningLink.findFirst({
      where: { token, isActive: true, reel: { id: params.id } },
    });
    if (!link) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  const images = await prisma.reelGalleryImage.findMany({
    where: { reelId: params.id },
    orderBy: { sortOrder: "asc" },
    include: {
      project: { select: { title: true, brand: true } },
    },
  });

  if (images.length === 0) {
    return NextResponse.json({ error: "No gallery images" }, { status: 404 });
  }

  // Get reel title for ZIP filename
  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    select: { title: true, director: { select: { name: true } } },
  });

  const zipFilename = reel
    ? `${reel.director.name} - ${reel.title} - Gallery.zip`
        .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
        .replace(/\s+/g, "_")
    : `gallery-${params.id}.zip`;

  // Stream ZIP response
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Build ZIP in background
  (async () => {
    try {
      const archive = archiver("zip", { zlib: { level: 5 } });

      archive.on("data", (chunk: Buffer) => writer.write(chunk));
      archive.on("end", () => writer.close());
      archive.on("error", (err) => {
        console.error("[Gallery Download] Archive error:", err);
        writer.close();
      });

      for (const img of images) {
        const url = await getDownloadUrl(img.r2Key, 300);
        const response = await fetch(url);
        if (!response.ok) continue;

        const buffer = Buffer.from(await response.arrayBuffer());
        const safeName = (img.project.title || "frame")
          .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
          .replace(/\s+/g, "_");
        const brand = img.project.brand
          ? `_${img.project.brand.replace(/[^a-zA-Z0-9]/g, "")}`
          : "";
        const filename = `${String(img.sortOrder + 1).padStart(2, "0")}_${safeName}${brand}.png`;

        archive.append(buffer, { name: filename });
      }

      archive.finalize();
    } catch (err) {
      console.error("[Gallery Download] ZIP generation failed:", err);
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
