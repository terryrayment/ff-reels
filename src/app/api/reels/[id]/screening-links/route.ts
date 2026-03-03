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
  const { recipientName, recipientEmail, recipientCompany, expiresInDays, password } = body;

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : null;

  const link = await prisma.screeningLink.create({
    data: {
      reelId: params.id,
      recipientName: recipientName || null,
      recipientEmail: recipientEmail || null,
      recipientCompany: recipientCompany || null,
      expiresAt,
      password: password || null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json({
    ...link,
    url: `${appUrl}/s/${link.token}`,
  }, { status: 201 });
}
