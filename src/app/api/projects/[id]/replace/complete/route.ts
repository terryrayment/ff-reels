import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

const TEAM_ROLES = ["ADMIN", "PRODUCER", "REP"];

function parseFileSizeMb(value: unknown) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? Math.round(size * 100) / 100 : null;
}

/**
 * POST /api/projects/[id]/replace/complete
 * Commits the replacement original after the client uploads it to R2.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !TEAM_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { filename, fileSizeMb, r2Key } = body;

    if (typeof filename !== "string" || filename.trim().length === 0) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    if (typeof r2Key !== "string" || r2Key.trim().length === 0) {
      return NextResponse.json({ error: "R2 key is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, directorId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const expectedPrefix = `originals/${project.directorId}/${project.id}/`;
    if (!r2Key.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: "Invalid R2 key" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        r2Key,
        originalFilename: filename,
        fileSizeMb: parseFileSizeMb(fileSizeMb),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Project replacement confirm error:", error);
    return NextResponse.json({ error: "Replacement confirm failed" }, { status: 500 });
  }
}
