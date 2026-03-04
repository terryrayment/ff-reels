import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/directors/[id]
 * Get a single director with all projects.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const director = await prisma.director.findUnique({
    where: { id: params.id },
    include: {
      projects: {
        orderBy: { sortOrder: "asc" },
      },
      reels: {
        include: {
          _count: { select: { items: true, screeningLinks: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      lookbookItems: {
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { projects: true, reels: true } },
    },
  });

  if (!director) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(director);
}

/**
 * PATCH /api/directors/[id]
 * Update a director.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, statement, categories, isActive, sortOrder, rosterStatus } = body;

  const director = await prisma.director.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(statement !== undefined && { statement }),
      ...(categories !== undefined && { categories }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(rosterStatus !== undefined && { rosterStatus }),
    },
  });

  return NextResponse.json(director);
}

/**
 * DELETE /api/directors/[id]
 * Delete a director and all their projects.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.director.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
