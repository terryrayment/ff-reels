import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";
import { getMux } from "@/lib/mux/client";

/**
 * GET /api/projects/[id]/download?token=<screeningToken>
 *
 * Redirects to a downloadable MP4 URL.
 * Priority: R2 original file → Mux static rendition (high.mp4).
 * Auth: valid session OR a valid (active, unexpired) screening link token.
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

  // Validate screening token if no session — scoped to this project
  if (!session && token) {
    const link = await prisma.screeningLink.findFirst({
      where: {
        token,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        reel: {
          items: {
            some: { projectId: params.id },
          },
        },
      },
    });
    if (!link) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      r2Key: true,
      originalFilename: true,
      title: true,
      muxAssetId: true,
      muxPlaybackId: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Build a clean download filename
  const baseName = project.title
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/\s+/g, "_")
    .trim();

  // Option 1: R2 original file (best quality)
  if (project.r2Key) {
    const ext = project.originalFilename
      ? project.originalFilename.split(".").pop() ?? "mp4"
      : "mp4";
    const filename = `${baseName}.${ext}`;
    const signedUrl = await getDownloadUrl(project.r2Key, 3600, `attachment; filename="${filename}"`);
    return NextResponse.redirect(signedUrl);
  }

  // Option 2: Mux static rendition (MP4)
  if (project.muxPlaybackId && project.muxAssetId) {
    try {
      const mux = getMux();
      const asset = await mux.video.assets.retrieve(project.muxAssetId);

      // Enable mp4_support if not already
      if (asset.mp4_support !== "standard") {
        await mux.video.assets.updateMP4Support(project.muxAssetId, { mp4_support: "standard" });
        return NextResponse.json(
          { error: "Download is being prepared. Please try again in a minute." },
          { status: 202 }
        );
      }

      // Check if renditions are ready
      if (asset.static_renditions?.status !== "ready") {
        return NextResponse.json(
          { error: "Download is being prepared. Please try again in a minute." },
          { status: 202 }
        );
      }

      // Use the highest quality available
      const mp4Url = `https://stream.mux.com/${project.muxPlaybackId}/high.mp4?download=${encodeURIComponent(`${baseName}.mp4`)}`;
      return NextResponse.redirect(mp4Url);
    } catch (err) {
      console.error("[Download] Mux MP4 error:", err);
    }
  }

  return NextResponse.json(
    { error: "This spot is not available for download yet. Please try again shortly." },
    { status: 404 }
  );
}
