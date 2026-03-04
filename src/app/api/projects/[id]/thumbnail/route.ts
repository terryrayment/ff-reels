import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getUploadUrl, getDownloadUrl } from "@/lib/r2/client";

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
  const downloadUrl = await getDownloadUrl(r2Key, 86400 * 365); // 1 year

  // Store the thumbnail URL immediately — the client will upload to the presigned URL
  await prisma.project.update({
    where: { id: params.id },
    data: { thumbnailUrl: downloadUrl },
  });

  return NextResponse.json({ uploadUrl, downloadUrl, r2Key });
}
