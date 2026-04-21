import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/treatments/[id]
 * Remove a treatment sample. ADMIN/PRODUCER only.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "PRODUCER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.treatmentSample.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
