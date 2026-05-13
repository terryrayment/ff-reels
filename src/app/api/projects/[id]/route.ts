import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/projects/[id]
 * Get a single project with details.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      director: true,
      frameGrabs: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

/**
 * PATCH /api/projects/[id]
 * Update a project's metadata.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // DIRECTOR: can only update title on their own spots
  if (session.user.role === "DIRECTOR") {
    const directorId = session.user.directorId;
    if (!directorId) {
      return NextResponse.json({ error: "No director profile linked" }, { status: 403 });
    }
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { directorId: true },
    });
    if (!project || project.directorId !== directorId) {
      return NextResponse.json({ error: "Not your spot" }, { status: 403 });
    }
    const { title } = body;
    if (title === undefined) {
      return NextResponse.json({ error: "Only title can be updated" }, { status: 400 });
    }
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { title },
    });
    return NextResponse.json(updated);
  }

  // ADMIN / REP: full metadata update
  if (!["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title,
    brand,
    agency,
    category,
    year,
    description,
    contextNote,
    isPublished,
    sortOrder,
    thumbnailUrl,
  } = body;

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(brand !== undefined && { brand }),
      ...(agency !== undefined && { agency }),
      ...(category !== undefined && { category }),
      ...(year !== undefined && { year: year ? parseInt(year) : null }),
      ...(description !== undefined && { description }),
      ...(contextNote !== undefined && { contextNote }),
      ...(isPublished !== undefined && { isPublished }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
    },
  });

  return NextResponse.json(project);
}

/**
 * DELETE /api/projects/[id]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Also delete from Mux and R2
  await prisma.project.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
