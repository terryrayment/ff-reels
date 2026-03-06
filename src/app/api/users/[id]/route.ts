import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/users/[id]
 * Update a user's role. ADMIN only.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Can't change your own role
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { role } = body;

  if (!role || !["ADMIN", "PRODUCER", "REP"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be ADMIN, PRODUCER, or REP" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}

/**
 * DELETE /api/users/[id]
 * Remove a user. ADMIN only.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Can't delete yourself
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
