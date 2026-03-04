import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/updates/[id] — Edit an update's title/body
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = await prisma.update.findUnique({
    where: { id: params.id },
    select: { authorId: true },
  });

  if (!update) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the author or an admin can edit
  if (update.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, body: noteBody, isPinned } = body;

  const updated = await prisma.update.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(noteBody !== undefined ? { body: noteBody } : {}),
      ...(isPinned !== undefined ? { isPinned } : {}),
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/updates/[id] — Delete an update
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = await prisma.update.findUnique({
    where: { id: params.id },
    select: { authorId: true },
  });

  if (!update) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the author or an admin can delete
  if (update.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.update.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
