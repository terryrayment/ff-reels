import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

/**
 * POST /api/reels/[id]/screening-links
 * Create a new screening link for a reel.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { recipientName, recipientEmail, recipientCompany, expiresInDays, password, contactId } = body;

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : null;

  // Auto-create/link contact when email is provided
  let resolvedContactId = contactId || null;
  if (!resolvedContactId && recipientEmail?.trim()) {
    const email = recipientEmail.trim().toLowerCase();
    let companyId: string | null = null;
    if (recipientCompany?.trim()) {
      const company = await prisma.company.upsert({
        where: { name: recipientCompany.trim() },
        create: { name: recipientCompany.trim(), type: "Agency" },
        update: {},
      });
      companyId = company.id;
    }
    const contact = await prisma.contact.upsert({
      where: { email },
      create: {
        name: recipientName || email.split("@")[0],
        email,
        companyId,
        tags: [],
      },
      update: {},
    });
    resolvedContactId = contact.id;
  }

  const link = await prisma.screeningLink.create({
    data: {
      reelId: params.id,
      recipientName: recipientName || null,
      recipientEmail: recipientEmail || null,
      recipientCompany: recipientCompany || null,
      contactId: resolvedContactId,
      expiresAt,
      password: password || null,
    },
  });

  const screeningDomain = process.env.NEXT_PUBLIC_SCREENING_URL || "https://reels.friendsandfamily.tv";

  return NextResponse.json({
    ...link,
    url: `${screeningDomain}/s/${link.token}`,
  }, { status: 201 });
}
