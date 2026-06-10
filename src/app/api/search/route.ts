import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

const TEAM_ROLES = ["ADMIN", "PRODUCER", "REP"];

/**
 * GET /api/search?q=<query>
 * Global library search across spots, directors, reels, and contacts.
 * Powers the Cmd+K command palette.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !TEAM_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ spots: [], directors: [], reels: [], contacts: [] });
  }

  const contains = { contains: q, mode: "insensitive" as const };

  const [spots, directors, reels, contacts] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { title: contains },
          { brand: contains },
          { agency: contains },
          { category: contains },
        ],
      },
      select: {
        id: true,
        title: true,
        brand: true,
        agency: true,
        year: true,
        muxPlaybackId: true,
        thumbnailUrl: true,
        isPublished: true,
        director: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),

    prisma.director.findMany({
      where: { name: contains },
      select: {
        id: true,
        name: true,
        headshotUrl: true,
        rosterStatus: true,
        _count: { select: { projects: true } },
      },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),

    prisma.reel.findMany({
      where: {
        OR: [
          { title: contains },
          { brand: contains },
          { director: { name: contains } },
        ],
      },
      select: {
        id: true,
        title: true,
        brand: true,
        director: { select: { name: true } },
        _count: { select: { items: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),

    prisma.contact.findMany({
      where: {
        OR: [
          { name: contains },
          { email: contains },
          { company: { name: contains } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  return NextResponse.json({ spots, directors, reels, contacts });
}
