import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/tracking/view/end
 * Close a ReelView session — called via navigator.sendBeacon on page unload.
 *
 * IMPORTANT: sendBeacon sends JSON as text/plain, so we parse with req.text().
 * Public endpoint — no auth required.
 */
export async function POST(req: NextRequest) {
  try {
    // sendBeacon sends as text/plain, req.json() may fail
    const text = await req.text();
    const body = JSON.parse(text);
    const { viewId, totalDuration } = body;

    if (!viewId) {
      return NextResponse.json(
        { error: "viewId required" },
        { status: 400 }
      );
    }

    await prisma.reelView.update({
      where: { id: viewId },
      data: {
        endedAt: new Date(),
        totalDuration: typeof totalDuration === "number" ? totalDuration : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Beacon requests can be fire-and-forget — don't break on errors
    return NextResponse.json({ ok: true });
  }
}
