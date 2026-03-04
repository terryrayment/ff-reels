import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";

/**
 * GET /api/reels/[id]/gallery
 * List gallery images for a reel with presigned download URLs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    select: { galleryStatus: true },
  });

  if (!reel) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  const images = await prisma.reelGalleryImage.findMany({
    where: { reelId: params.id },
    orderBy: { sortOrder: "asc" },
    include: {
      project: { select: { title: true, brand: true } },
    },
  });

  // Generate presigned URLs (1 hour expiry)
  const withUrls = await Promise.all(
    images.map(async (img) => ({
      id: img.id,
      projectId: img.projectId,
      projectTitle: img.project.title,
      projectBrand: img.project.brand,
      timeOffset: img.timeOffset,
      aiScore: img.aiScore,
      width: img.width,
      height: img.height,
      sortOrder: img.sortOrder,
      imageUrl: await getDownloadUrl(img.r2Key, 3600),
      thumbnailUrl: img.thumbnailR2Key
        ? await getDownloadUrl(img.thumbnailR2Key, 3600)
        : await getDownloadUrl(img.r2Key, 3600),
    })),
  );

  return NextResponse.json({
    status: reel.galleryStatus,
    images: withUrls,
  });
}
