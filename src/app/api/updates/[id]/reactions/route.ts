import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

const ALLOWED_REACTIONS = new Set(["🔥", "👀", "✅", "👏"]);

async function getReactionSummary(updateId: string, userId: string) {
  const [groups, mine] = await Promise.all([
    prisma.updateReaction.groupBy({
      by: ["emoji"],
      where: { updateId },
      _count: { emoji: true },
    }),
    prisma.updateReaction.findMany({
      where: { updateId, userId },
      select: { emoji: true },
    }),
  ]);

  return {
    reactions: groups.map((group) => ({
      emoji: group.emoji,
      count: group._count.emoji,
    })),
    myReactions: mine.map((reaction) => reaction.emoji),
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP", "PRODUCER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emoji } = (await req.json()) as { emoji?: string };
  if (!emoji || !ALLOWED_REACTIONS.has(emoji)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  const update = await prisma.update.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!update) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.updateReaction.findUnique({
    where: {
      updateId_userId_emoji: {
        updateId: params.id,
        userId: session.user.id,
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.updateReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.updateReaction.create({
      data: {
        updateId: params.id,
        userId: session.user.id,
        emoji,
      },
    });
  }

  return NextResponse.json(await getReactionSummary(params.id, session.user.id));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP", "PRODUCER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emoji } = (await req.json()) as { emoji?: string };
  if (!emoji || !ALLOWED_REACTIONS.has(emoji)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  await prisma.updateReaction.deleteMany({
    where: {
      updateId: params.id,
      userId: session.user.id,
      emoji,
    },
  });

  return NextResponse.json(await getReactionSummary(params.id, session.user.id));
}
