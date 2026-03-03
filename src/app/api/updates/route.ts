import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/updates — List updates feed (paginated)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get("take") || "20"), 50);
  const cursor = searchParams.get("cursor") || undefined;

  const updates = await prisma.update.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      director: { select: { id: true, name: true } },
      project: { select: { id: true, title: true, brand: true, muxPlaybackId: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });

  const hasMore = updates.length > take;
  if (hasMore) updates.pop();

  return NextResponse.json({
    updates,
    nextCursor: hasMore ? updates[updates.length - 1]?.id : null,
  });
}

/**
 * POST /api/updates — Create an admin note
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ADMIN and REP can post notes
  if (session.user.role !== "ADMIN" && session.user.role !== "REP") {
    return NextResponse.json({ error: "Only team members can post updates" }, { status: 403 });
  }

  const body = await req.json();
  const { title, body: noteBody, imageUrl, isPinned, directorId } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const update = await prisma.update.create({
    data: {
      type: "ADMIN_NOTE",
      title,
      body: noteBody || null,
      imageUrl: imageUrl || null,
      isPinned: isPinned || false,
      directorId: directorId || null,
      authorId: session.user.id,
    },
    include: {
      director: { select: { id: true, name: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(update, { status: 201 });
}
