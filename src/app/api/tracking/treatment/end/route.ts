import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/tracking/treatment/end
 * Finalize a TreatmentView on page unload (usually via sendBeacon).
 * Body: { viewId, totalDuration?, pagesViewed?, maxPageReached? }
 * Public endpoint — no auth.
 */
export async function POST(req: NextRequest) {
  try {
    // sendBeacon sends Blob → text; try JSON parse with fallback
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const viewId = body.viewId as string | undefined;
    if (!viewId) {
      return NextResponse.json({ error: "viewId required" }, { status: 400 });
    }

    const totalDuration =
      typeof body.totalDuration === "number" ? body.totalDuration : null;
    const pagesViewed = Array.isArray(body.pagesViewed)
      ? (body.pagesViewed as unknown[]).filter((n) => typeof n === "number") as number[]
      : null;
    const maxPageReached =
      typeof body.maxPageReached === "number" ? body.maxPageReached : null;

    await prisma.treatmentView.update({
      where: { id: viewId },
      data: {
        endedAt: new Date(),
        ...(totalDuration !== null && { totalDuration }),
        ...(pagesViewed !== null && { pagesViewed }),
        ...(maxPageReached !== null && { maxPageReached }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Treatment Tracking] Failed to end view:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
