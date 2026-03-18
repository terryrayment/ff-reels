import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email/resend";
import crypto from "crypto";

/**
 * POST /api/users/forgot-password
 * Public endpoint. Sends a password reset email if the user exists.
 * Always returns 200 to avoid leaking whether an email is registered.
 * Body: { email }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  // Always return success to avoid email enumeration
  if (!user || !user.passwordHash) {
    return NextResponse.json({ success: true });
  }

  const inviteToken = crypto.randomUUID();
  const inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: { inviteToken, inviteTokenExpires },
  });

  try {
    await sendInviteEmail(user.email, user.name || "there", inviteToken, true);
  } catch (err) {
    console.error("[ForgotPassword] Failed to send reset email:", err);
    // Still return success to avoid leaking info
  }

  return NextResponse.json({ success: true });
}
