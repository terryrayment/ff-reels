import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { resolveProjectDownload } from "@/lib/mux/downloads";
import { canAccessProject } from "@/lib/auth/guards";

/**
 * GET /api/projects/[id]/download?token=<screeningToken>
 *
 * Redirects to a downloadable video URL.
 * Priority: R2 original file → ready Mux static rendition.
 * Auth: valid session OR a valid (active, unexpired) screening link token.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const token = req.nextUrl.searchParams.get("token");
  const preflight = req.nextUrl.searchParams.get("preflight") === "1";
  let hasValidToken = false;

  if (!session && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate screening token — scoped to this project
  if (token) {
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
      if (!session) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }
    } else {
      hasValidToken = true;
    }
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      directorId: true,
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

  const hasSessionAccess = session ? canAccessProject(session, project.directorId) : false;
  if (!hasSessionAccess && !hasValidToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build a clean download filename
  const baseName = (project.title || "video")
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/\s+/g, "_")
    .trim() || "video";
  const originalExt = project.originalFilename?.split(".").pop() ?? "mp4";
  const downloadFilename = project.r2Key
    ? `${baseName}.${originalExt}`
    : `${baseName}.mp4`;
  const resolution = await resolveProjectDownload(project, downloadFilename);

  if (resolution.status === "ready") {
    if (preflight) {
      return NextResponse.json({
        status: "ready",
        downloadUrl: resolution.url,
        extension: resolution.extension,
        source: resolution.source,
      });
    }
    return NextResponse.redirect(resolution.url);
  }

  if (resolution.status === "preparing") {
    return NextResponse.json(
      { error: resolution.message, status: "preparing", requested: resolution.requested },
      { status: 409 },
    );
  }

  return NextResponse.json({ error: resolution.message }, { status: 404 });
}
