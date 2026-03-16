import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";

/**
 * GET /api/projects/[id]/download?token=<screeningToken>
 *
 * Returns a short-lived signed R2 URL for the original uploaded video file.
 * Auth: valid session OR a valid (active, unexpired) screening link token.
 *
 * The original file is stored at project.r2Key which was set during upload.
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

  // Validate screening token if no session
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
    select: { r2Key: true, originalFilename: true, title: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.r2Key) {
    return NextResponse.json(
      { error: "Original file not available for this spot" },
      { status: 404 }
    );
  }

  // Build a clean download filename: prefer originalFilename, fall back to title
  const ext = project.originalFilename
    ? project.originalFilename.split(".").pop() ?? "mp4"
    : "mp4";
  const baseName = project.title
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/\s+/g, "_")
    .trim();
  const filename = `${baseName}.${ext}`;

  // Sign for 1 hour — enough time to start a large download
  const signedUrl = await getDownloadUrl(project.r2Key, 3600, `attachment; filename="${filename}"`);

  // Redirect directly to R2 — no proxying, so large files stream straight from R2
  return NextResponse.redirect(signedUrl);
}
