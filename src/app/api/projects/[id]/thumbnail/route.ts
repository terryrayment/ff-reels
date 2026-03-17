import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getUploadUrl, R2_BUCKET, r2 } from "@/lib/r2/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

function buildThumbnailProxyUrl(projectId: string, r2Key: string) {
  return `/api/projects/${projectId}/thumbnail?key=${encodeURIComponent(r2Key)}`;
}

/**
 * GET /api/projects/[id]/thumbnail?key=<r2Key>
 * Streams a stored thumbnail image from R2.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key || !key.startsWith(`thumbnails/${params.id}/`)) {
    return NextResponse.json({ error: "Invalid thumbnail key" }, { status: 400 });
  }

  try {
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );

    if (!object.Body) {
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await object.Body.transformToByteArray());

    return new Response(buffer, {
      headers: {
        "Content-Type": object.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Project Thumbnail] Failed to load thumbnail:", error);
    return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
  }
}

/**
 * POST /api/projects/[id]/thumbnail
 * Returns a presigned R2 upload URL for a custom thumbnail image.
 * After the client uploads the image, it calls PATCH to confirm.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { filename, contentType } = body;

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const r2Key = `thumbnails/${params.id}/${Date.now()}-${filename}`;
  const uploadUrl = await getUploadUrl(r2Key, contentType);
  const thumbnailUrl = buildThumbnailProxyUrl(params.id, r2Key);

  // Store the app-owned thumbnail URL immediately — the client will upload to R2 next
  await prisma.project.update({
    where: { id: params.id },
    data: { thumbnailUrl },
  });

  return NextResponse.json({ uploadUrl, downloadUrl: thumbnailUrl, r2Key });
}
