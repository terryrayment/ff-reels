import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getMux } from "@/lib/mux/client";
import { getUploadUrl } from "@/lib/r2/client";
import { prisma } from "@/lib/db";

/**
 * POST /api/upload
 * Creates a Mux direct upload URL and an R2 presigned upload URL.
 * The client uploads the video to both destinations:
 *   - Mux: for transcoding and streaming
 *   - R2: for archival of the original file
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { directorId, title, filename, contentType, fileSizeMb } = body;

    // Create a Mux direct upload
    const mux = getMux();
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      new_asset_settings: {
        playback_policy: ["signed"],
        encoding_tier: "baseline",
      },
    });

    // Create the project record with Mux upload ID so webhooks can find it
    const project = await prisma.project.create({
      data: {
        directorId,
        title,
        originalFilename: filename,
        fileSizeMb,
        muxUploadId: upload.id,
        muxStatus: "waiting",
      },
    });

    // Generate R2 presigned upload URL for the original file
    const r2Key = `originals/${directorId}/${project.id}/${filename}`;
    const r2UploadUrl = await getUploadUrl(r2Key, contentType);

    // Store the R2 key on the project
    await prisma.project.update({
      where: { id: project.id },
      data: { r2Key },
    });

    // Auto-create activity update
    const director = await prisma.director.findUnique({
      where: { id: directorId },
      select: { name: true },
    });
    await prisma.update.create({
      data: {
        type: "SPOT_ADDED",
        title: `New spot uploaded for ${director?.name || "a director"}`,
        body: title,
        directorId,
        projectId: project.id,
      },
    }).catch(() => {}); // Non-critical

    return NextResponse.json({
      projectId: project.id,
      muxUploadUrl: upload.url,
      muxUploadId: upload.id,
      r2UploadUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
