import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email/resend";
import crypto from "crypto";

/**
 * POST /api/users/resend-invite
 * Resend invite email with a fresh token. ADMIN only.
 * Body: { userId }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only resend if user hasn't set a password yet
  if (user.passwordHash) {
    return NextResponse.json(
      { error: "This user has already set their password" },
      { status: 400 }
    );
  }

  const inviteToken = crypto.randomUUID();
  const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { inviteToken, inviteTokenExpires },
  });

  try {
    await sendInviteEmail(user.email, user.name || "there", inviteToken);
  } catch (err) {
    console.error("[Users] Failed to resend invite email:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
