import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * POST /api/reels/[id]/duplicate
 * Clone a reel with all its spots. New reel gets " (Copy)" suffix.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = await prisma.reel.findUnique({
    where: { id: params.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      director: { select: { id: true, name: true } },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  const clone = await prisma.reel.create({
    data: {
      directorId: source.directorId,
      title: `${source.title} (Copy)`,
      description: source.description,
      curatorialNote: source.curatorialNote,
      brand: source.brand,
      agencyName: source.agencyName,
      campaignName: source.campaignName,
      producer: source.producer,
      reelType: source.reelType,
      createdById: session.user.id,
      items: {
        create: source.items.map((item) => ({
          projectId: item.projectId,
          sortOrder: item.sortOrder,
        })),
      },
    },
    include: {
      director: { select: { id: true, name: true } },
      _count: { select: { items: true, screeningLinks: true } },
    },
  });

  // Auto-create screening link
  const screeningLink = await prisma.screeningLink.create({
    data: {
      reelId: clone.id,
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });

  return NextResponse.json(
    { ...clone, screeningUrl: `https://reels.friendsandfamily.tv/s/${screeningLink.token}` },
    { status: 201 }
  );
}
