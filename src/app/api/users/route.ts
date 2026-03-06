import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email/resend";
import crypto from "crypto";

/**
 * GET /api/users
 * List all team members (non-VIEWER users). ADMIN only.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { role: { not: "VIEWER" } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: false,
      inviteToken: true,
      inviteTokenExpires: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to include a "status" field
  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.inviteToken ? "invited" : "active",
    invitePending: !!u.inviteToken,
    inviteExpired: u.inviteTokenExpires
      ? u.inviteTokenExpires < new Date()
      : false,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return NextResponse.json(result);
}

/**
 * POST /api/users
 * Invite a new team member. ADMIN only.
 * Body: { name, email, role }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, role } = body;

  if (!name || !email || !role) {
    return NextResponse.json(
      { error: "Name, email, and role are required" },
      { status: 400 }
    );
  }

  if (!["ADMIN", "PRODUCER", "REP"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be ADMIN, PRODUCER, or REP" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const inviteToken = crypto.randomUUID();
  const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      role,
      inviteToken,
      inviteTokenExpires,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Send invite email
  try {
    await sendInviteEmail(email, name, inviteToken);
  } catch (err) {
    console.error("[Users] Failed to send invite email:", err);
    // User was created, just email failed — don't roll back
  }

  return NextResponse.json(
    { ...user, status: "invited", invitePending: true },
    { status: 201 }
  );
}
