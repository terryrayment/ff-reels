import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * TEMPORARY debug endpoint — remove after login is fixed.
 * Tests: database connection, user lookup, bcrypt comparison.
 */
export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // Test 1: Can we connect to the database?
    results.dbConnected = true;
    const userCount = await prisma.user.count();
    results.userCount = userCount;

    // Test 2: Can we find the admin user?
    const user = await prisma.user.findUnique({
      where: { email: "terry@friendsandfamily.tv" },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    results.userFound = !!user;
    results.hasHash = !!user?.passwordHash;
    results.hashPrefix = user?.passwordHash?.substring(0, 7) ?? null;

    // Test 3: Does bcrypt.compare work?
    if (user?.passwordHash) {
      const isValid = await bcrypt.compare("Rapp195312!", user.passwordHash);
      results.passwordValid = isValid;
    }

    // Test 4: Check env vars
    results.hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
    results.hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    results.nextAuthUrl = process.env.NEXTAUTH_URL;
    results.nodeEnv = process.env.NODE_ENV;
    results.bcryptVersion = typeof bcrypt.compare;
  } catch (error: unknown) {
    results.error = error instanceof Error ? error.message : String(error);
    results.dbConnected = false;
  }

  return NextResponse.json(results);
}
