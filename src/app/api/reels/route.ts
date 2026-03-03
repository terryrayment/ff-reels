import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/reels
 * List reels with director info and item counts.
 * ADMIN sees all reels. REP sees only their own.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where =
    session.user.role === "REP"
      ? { createdById: session.user.id }
      : {};

  const reels = await prisma.reel.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      director: { select: { id: true, name: true, slug: true } },
      _count: { select: { items: true, screeningLinks: true } },
    },
  });

  return NextResponse.json(reels);
}

/**
 * POST /api/reels
 * Create a new reel. Always stores createdById.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { directorId, title, description, curatorialNote, reelType, projectIds, brand, agencyName, campaignName, producer } = body;

  if (!directorId || !title) {
    return NextResponse.json(
      { error: "directorId and title are required" },
      { status: 400 }
    );
  }

  const reel = await prisma.reel.create({
    data: {
      directorId,
      title,
      description: description || null,
      curatorialNote: curatorialNote || null,
      brand: brand || null,
      agencyName: agencyName || null,
      campaignName: campaignName || null,
      producer: producer || null,
      reelType: reelType || "CUSTOM",
      createdById: session.user.id,
      items: projectIds?.length
        ? {
            create: projectIds.map((pid: string, i: number) => ({
              projectId: pid,
              sortOrder: i,
            })),
          }
        : undefined,
    },
    include: {
      director: { select: { id: true, name: true } },
      items: { include: { project: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { items: true, screeningLinks: true } },
    },
  });

  // Auto-create activity update
  await prisma.update.create({
    data: {
      type: "REEL_CREATED",
      title: `New reel: ${title}`,
      body: `${reel.director.name} — ${reel._count.items} spot${reel._count.items !== 1 ? "s" : ""}`,
      directorId: reel.director.id,
      authorId: session.user.id,
    },
  }).catch(() => {}); // Non-critical

  return NextResponse.json(reel, { status: 201 });
}
