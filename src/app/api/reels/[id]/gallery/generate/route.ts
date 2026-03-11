import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { generateReelGallery } from "@/lib/gallery/generate";

export const maxDuration = 300;

/**
 * POST /api/reels/[id]/gallery/generate
 * Trigger AI gallery generation for a reel.
 * Scores frames with GPT-4o-mini, upscales with Real-ESRGAN.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    select: { id: true, galleryStatus: true },
  });

  if (!reel) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  if (reel.galleryStatus === "generating") {
    return NextResponse.json(
      { error: "Gallery generation already in progress" },
      { status: 409 },
    );
  }

  // Set status to generating
  await prisma.reel.update({
    where: { id: params.id },
    data: { galleryStatus: "generating" },
  });

  try {
    const result = await generateReelGallery(params.id);
    return NextResponse.json({ status: "ready", ...result });
  } catch (err) {
    console.error("[Gallery API] Generation failed:", err);
    await prisma.reel.update({
      where: { id: params.id },
      data: { galleryStatus: "failed" },
    });
    return NextResponse.json(
      { error: "Gallery generation failed", details: String(err) },
      { status: 500 },
    );
  }
}
