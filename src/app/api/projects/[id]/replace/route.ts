import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getMux } from "@/lib/mux/client";
import { getUploadUrl } from "@/lib/r2/client";

const TEAM_ROLES = ["ADMIN", "PRODUCER", "REP"];

function safeFilename(filename: string) {
  const base = filename.split(/[\\/]/).pop()?.trim() || "replacement.mp4";
  return base.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

/**
 * POST /api/projects/[id]/replace
 * Creates upload URLs for replacing the media behind an existing project.
 * Existing playback stays live until Mux marks the replacement asset ready.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !TEAM_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { filename, contentType } = body;

    if (typeof filename !== "string" || filename.trim().length === 0) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const uploadContentType =
      typeof contentType === "string" && contentType.trim()
        ? contentType.trim()
        : "application/octet-stream";

    if (!uploadContentType.startsWith("video/") && uploadContentType !== "application/octet-stream") {
      return NextResponse.json({ error: "Replacement must be a video file" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, directorId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const mux = getMux();
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "smart",
        max_resolution_tier: "2160p",
      },
    });

    const r2Key = `originals/${project.directorId}/${project.id}/replacements/${Date.now()}-${safeFilename(filename)}`;
    const r2UploadUrl = await getUploadUrl(r2Key, uploadContentType);

    await prisma.project.update({
      where: { id: project.id },
      data: {
        muxUploadId: upload.id,
      },
    });

    return NextResponse.json({
      projectId: project.id,
      muxUploadUrl: upload.url,
      muxUploadId: upload.id,
      r2UploadUrl,
      r2Key,
    });
  } catch (error) {
    console.error("Project replacement error:", error);
    return NextResponse.json({ error: "Replacement upload failed" }, { status: 500 });
  }
}
