import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { canManageReel, canViewReel } from "@/lib/auth/guards";

/**
 * GET /api/reels/[id]
 * Get a single reel with all items and screening links.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    include: {
      director: true,
      items: {
        include: { project: true },
        orderBy: { sortOrder: "asc" },
      },
      screeningLinks: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { views: true } },
        },
      },
    },
  });

  if (!reel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canViewReel(session, reel)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(reel);
}

/**
 * PATCH /api/reels/[id]
 * Update reel metadata.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reelScope = await prisma.reel.findUnique({
    where: { id: params.id },
    select: { createdById: true, directorId: true },
  });

  if (!reelScope) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canManageReel(session, reelScope)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, curatorialNote, reelType, brand, agencyName, campaignName, producer } = body;

  // Helper: empty string → null (clears the field)
  const opt = (v: string | null | undefined): string | null => (!v || v.trim() === "" ? null : v.trim());

  const reel = await prisma.reel.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(curatorialNote !== undefined && { curatorialNote }),
      ...(reelType !== undefined && { reelType }),
      ...(brand !== undefined && { brand: opt(brand) }),
      ...(agencyName !== undefined && { agencyName: opt(agencyName) }),
      ...(campaignName !== undefined && { campaignName: opt(campaignName) }),
      ...(producer !== undefined && { producer: opt(producer) }),
    },
  });

  return NextResponse.json(reel);
}

/**
 * DELETE /api/reels/[id]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.reel.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
