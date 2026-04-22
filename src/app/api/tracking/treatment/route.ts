import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectDevice } from "@/lib/analytics/device";
import { extractGeo } from "@/lib/analytics/geo";

/**
 * POST /api/tracking/treatment
 * Record a new TreatmentView when someone opens a /t/{token} page.
 * Public endpoint — no auth required.
 * Body: { treatmentId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { treatmentId } = body as { treatmentId?: string };

    if (!treatmentId) {
      return NextResponse.json({ error: "treatmentId required" }, { status: 400 });
    }

    // Validate the treatment exists
    const treatment = await prisma.treatmentSample.findUnique({
      where: { id: treatmentId },
      select: { id: true },
    });
    if (!treatment) {
      return NextResponse.json({ error: "Treatment not found" }, { status: 404 });
    }

    const geo = extractGeo(req);
    const userAgent = req.headers.get("user-agent") || null;
    const referer = req.headers.get("referer") || null;
    const device = detectDevice(userAgent);

    // Dedup: same IP + treatment within 30s → return existing view
    if (geo.ip) {
      const thirtySecsAgo = new Date(Date.now() - 30_000);
      const existing = await prisma.treatmentView.findFirst({
        where: {
          treatmentId,
          viewerIp: geo.ip,
          startedAt: { gte: thirtySecsAgo },
        },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ viewId: existing.id });
      }
    }

    const view = await prisma.treatmentView.create({
      data: {
        treatmentId,
        viewerIp: geo.ip,
        viewerCity: geo.city,
        viewerCountry: geo.country,
        userAgent,
        referer,
        device,
      },
    });

    return NextResponse.json({ viewId: view.id });
  } catch (err) {
    console.error("[Treatment Tracking] Failed to record view:", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
