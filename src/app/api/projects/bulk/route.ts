import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

const TEAM_ROLES = ["ADMIN", "PRODUCER", "REP"];
const MAX_BATCH = 200;

/**
 * PATCH /api/projects/bulk
 * Update metadata or publish state on many spots at once.
 *
 * Body: { projectIds: string[], data: { isPublished?, brand?, agency?, category?, year? } }
 * Only whitelisted fields are applied; omitted fields are left unchanged.
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !TEAM_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectIds, data } = body as {
    projectIds?: unknown;
    data?: Record<string, unknown>;
  };

  if (
    !Array.isArray(projectIds) ||
    projectIds.length === 0 ||
    !projectIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "projectIds must be a non-empty array of strings" },
      { status: 400 }
    );
  }
  if (projectIds.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Too many projects — max ${MAX_BATCH} per request` },
      { status: 400 }
    );
  }
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "data is required" }, { status: 400 });
  }

  // Whitelist + normalize: empty strings clear the field (set null)
  const update: Record<string, unknown> = {};
  if (typeof data.isPublished === "boolean") update.isPublished = data.isPublished;
  for (const field of ["brand", "agency", "category"] as const) {
    if (typeof data[field] === "string") {
      const v = (data[field] as string).trim();
      update[field] = v === "" ? null : v;
    }
  }
  if (data.year !== undefined) {
    const y = Number(data.year);
    update.year = Number.isInteger(y) && y > 1900 && y < 2100 ? y : null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const result = await prisma.project.updateMany({
    where: { id: { in: projectIds } },
    data: update,
  });

  return NextResponse.json({ updated: result.count });
}
