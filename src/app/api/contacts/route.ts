import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/contacts
 * List all contacts with engagement stats.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      company: { select: { id: true, name: true } },
      screeningLinks: {
        select: {
          id: true,
          reelId: true,
          createdAt: true,
          reel: { select: { directorId: true } },
          views: {
            select: {
              id: true,
              startedAt: true,
              totalDuration: true,
              spotViews: { select: { percentWatched: true }, take: 20 },
            },
            orderBy: { startedAt: "desc" },
          },
          _count: { select: { views: true } },
        },
      },
    },
  });

  return NextResponse.json(contacts);
}

/**
 * POST /api/contacts
 * Create or find a contact.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, companyName, companyId, role, phone, notes, tags } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Resolve company: use companyId if provided, otherwise find-or-create by name
  let resolvedCompanyId = companyId || null;
  if (!resolvedCompanyId && companyName?.trim()) {
    const company = await prisma.company.upsert({
      where: { name: companyName.trim() },
      create: { name: companyName.trim(), type: "Agency" },
      update: {},
    });
    resolvedCompanyId = company.id;
  }

  const contact = await prisma.contact.upsert({
    where: { email: email.trim().toLowerCase() },
    create: {
      name: name || email.split("@")[0],
      email: email.trim().toLowerCase(),
      companyId: resolvedCompanyId,
      role: role || null,
      phone: phone || null,
      notes: notes || null,
      tags: tags || [],
    },
    update: {},
    include: { company: { select: { id: true, name: true } } },
  });

  return NextResponse.json(contact, { status: 201 });
}
