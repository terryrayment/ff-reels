import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

/**
 * GET /api/directors
 * List all directors with project counts.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const directors = await prisma.director.findMany({
    orderBy: { sortOrder: "asc" },
    take: 200,
    include: {
      _count: { select: { projects: true, reels: true } },
    },
  });

  return NextResponse.json(directors);
}

/**
 * POST /api/directors
 * Create a new director.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, statement, categories } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Generate unique slug
  let slug = slugify(name);
  const existing = await prisma.director.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const director = await prisma.director.create({
    data: {
      name,
      slug,
      bio: bio || null,
      statement: statement || null,
      categories: categories || [],
    },
  });

  // Auto-create activity update
  await prisma.update.create({
    data: {
      type: "DIRECTOR_ADDED",
      title: `${name} added to the roster`,
      directorId: director.id,
      authorId: session.user.id,
    },
  }).catch(() => {}); // Non-critical

  return NextResponse.json(director, { status: 201 });
}
