import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * PUT /api/reels/[id]/items
 * Replace all items in a reel (for reordering / adding / removing).
 * Body: { projectIds: string[] } — in desired order
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectIds } = await req.json();

  if (!Array.isArray(projectIds)) {
    return NextResponse.json(
      { error: "projectIds must be an array" },
      { status: 400 }
    );
  }

  // Delete existing items and recreate in order
  await prisma.$transaction([
    prisma.reelItem.deleteMany({ where: { reelId: params.id } }),
    ...projectIds.map((pid: string, i: number) =>
      prisma.reelItem.create({
        data: {
          reelId: params.id,
          projectId: pid,
          sortOrder: i,
        },
      })
    ),
  ]);

  // Return the updated reel
  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { project: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(reel);
}
