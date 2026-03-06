import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/contacts/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      screeningLinks: {
        include: {
          reel: {
            include: {
              director: { select: { name: true } },
              _count: { select: { items: true } },
            },
          },
          views: {
            orderBy: { startedAt: "desc" },
            include: { spotViews: { select: { percentWatched: true } } },
          },
          _count: { select: { views: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

/**
 * PATCH /api/contacts/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, role, phone, notes, tags, companyId, companyName } = body;

  // Resolve company
  let resolvedCompanyId = companyId;
  if (resolvedCompanyId === undefined && companyName?.trim()) {
    const company = await prisma.company.upsert({
      where: { name: companyName.trim() },
      create: { name: companyName.trim(), type: "Agency" },
      update: {},
    });
    resolvedCompanyId = company.id;
  }

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(role !== undefined && { role }),
      ...(phone !== undefined && { phone }),
      ...(notes !== undefined && { notes }),
      ...(tags !== undefined && { tags }),
      ...(resolvedCompanyId !== undefined && { companyId: resolvedCompanyId }),
    },
    include: { company: { select: { id: true, name: true } } },
  });

  return NextResponse.json(contact);
}

/**
 * DELETE /api/contacts/[id]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Unlink screening links (don't delete them)
  await prisma.screeningLink.updateMany({
    where: { contactId: params.id },
    data: { contactId: null },
  });

  await prisma.contact.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
