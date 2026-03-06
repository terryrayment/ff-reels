import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * GET /api/companies
 * List all companies.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    take: 200,
    include: { _count: { select: { contacts: true } } },
  });

  return NextResponse.json(companies);
}

/**
 * POST /api/companies
 * Create a company.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const company = await prisma.company.upsert({
    where: { name: name.trim() },
    create: { name: name.trim(), type: type || "Agency" },
    update: {},
  });

  return NextResponse.json(company, { status: 201 });
}
