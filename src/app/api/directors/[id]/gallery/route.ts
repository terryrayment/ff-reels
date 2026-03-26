import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/directors/[id]/gallery
 * List gallery images for a director.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await prisma.directorGalleryImage.findMany({
    where: { directorId: params.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(images);
}

/**
 * POST /api/directors/[id]/gallery
 * Add gallery images. Body: { images: [{ url, caption?, brand? }] }
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
  const { images } = body;

  if (!Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "images array required" }, { status: 400 });
  }

  // Get current max sortOrder
  const last = await prisma.directorGalleryImage.findFirst({
    where: { directorId: params.id },
    orderBy: { sortOrder: "desc" },
  });
  const startOrder = (last?.sortOrder ?? -1) + 1;

  const created = await prisma.directorGalleryImage.createMany({
    data: images.map((img: { url: string; caption?: string; brand?: string }, i: number) => ({
      directorId: params.id,
      url: img.url,
      caption: img.caption || null,
      brand: img.brand || null,
      sortOrder: startOrder + i,
    })),
  });

  return NextResponse.json({ created: created.count }, { status: 201 });
}

/**
 * PUT /api/directors/[id]/gallery
 * Reorder gallery images. Body: { imageIds: string[] }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { imageIds } = body;

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json({ error: "imageIds array required" }, { status: 400 });
  }

  // Update sort orders in a transaction
  await prisma.$transaction(
    imageIds.map((id: string, index: number) =>
      prisma.directorGalleryImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return NextResponse.json({ reordered: imageIds.length });
}
