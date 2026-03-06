import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/users/set-password
 * Set password from invite token. No auth required (public).
 * Body: { token, password }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Find user by invite token
  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired invite link" },
      { status: 400 }
    );
  }

  // Check expiry
  if (user.inviteTokenExpires && user.inviteTokenExpires < new Date()) {
    return NextResponse.json(
      { error: "This invite link has expired. Ask your admin to resend it." },
      { status: 400 }
    );
  }

  // Hash password and activate user
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      inviteToken: null,
      inviteTokenExpires: null,
    },
  });

  return NextResponse.json({ success: true });
}
