import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/reels
 * List all reels with director info and item counts.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reels = await prisma.reel.findMany({
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
 * Create a new reel.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { directorId, title, description, curatorialNote, reelType, projectIds } = body;

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
      reelType: reelType || "CUSTOM",
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
