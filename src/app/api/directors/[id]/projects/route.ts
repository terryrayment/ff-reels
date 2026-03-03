import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/directors/[id]/projects
 * List all projects for a director.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { directorId: params.id },
    orderBy: { sortOrder: "asc" },
    include: {
      frameGrabs: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return NextResponse.json(projects);
}

/**
 * POST /api/directors/[id]/projects
 * Create a new project for a director (metadata only — upload is separate).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, brand, agency, category, year, description, contextNote } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      directorId: params.id,
      title,
      brand: brand || null,
      agency: agency || null,
      category: category || null,
      year: year ? parseInt(year) : null,
      description: description || null,
      contextNote: contextNote || null,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
