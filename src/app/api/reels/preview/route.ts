import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

const TEAM_ROLES = ["ADMIN", "PRODUCER", "REP"];

/**
 * POST /api/reels/preview
 * Creates a short-lived signed token encoding the preview reel parameters.
 * No database records are created — the token itself carries the data.
 * Critical invariant: requires an authenticated team role — preview
 * tokens can expose unpublished work.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !TEAM_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { directorId, projectIds, title, brand, curatorialNote, agencyName, campaignName } = body;

    if (!directorId || !projectIds?.length || !title) {
      return NextResponse.json(
        { error: "directorId, projectIds, and title are required" },
        { status: 400 }
      );
    }

    // Build the payload — expires in 1 hour
    const payload = {
      directorId,
      projectIds,
      title,
      brand: brand || null,
      curatorialNote: curatorialNote || null,
      agencyName: agencyName || null,
      campaignName: campaignName || null,
      exp: Date.now() + 60 * 60 * 1000, // 1 hour
    };

    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const secret = process.env.NEXTAUTH_SECRET || "preview-fallback-secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const token = `${payloadB64}.${signature}`;

    return NextResponse.json({ previewUrl: `/preview/${token}` });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
