import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectDevice } from "@/lib/analytics/device";
import { extractGeo } from "@/lib/analytics/geo";

/**
 * POST /api/tracking/view
 * Record a new ReelView when someone opens a screening page.
 * Public endpoint — no auth required.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { screeningLinkId } = body;

    if (!screeningLinkId) {
      return NextResponse.json(
        { error: "screeningLinkId required" },
        { status: 400 }
      );
    }

    // Validate the screening link exists and is active
    const link = await prisma.screeningLink.findUnique({
      where: { id: screeningLinkId },
      include: {
        reel: {
          include: {
            director: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!link || !link.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive link" },
        { status: 404 }
      );
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Link expired" }, { status: 410 });
    }

    // Extract viewer info from headers
    const geo = extractGeo(req);
    const userAgent = req.headers.get("user-agent") || null;
    const device = detectDevice(userAgent);

    // Dedup: if same IP + same link within 30 seconds, return existing view
    if (geo.ip) {
      const thirtySecsAgo = new Date(Date.now() - 30_000);
      const existing = await prisma.reelView.findFirst({
        where: {
          screeningLinkId,
          viewerIp: geo.ip,
          startedAt: { gte: thirtySecsAgo },
        },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json({ viewId: existing.id });
      }
    }

    // Forwarding detection: different IP from any prior view on this link
    let isForwarded = false;
    if (geo.ip) {
      const priorView = await prisma.reelView.findFirst({
        where: {
          screeningLinkId,
          AND: [
            { viewerIp: { not: geo.ip } },
            { viewerIp: { not: null } },
          ],
        },
        select: { id: true },
      });
      isForwarded = !!priorView;
    }

    // Create the ReelView record
    // Auto-populate viewer identity from the screening link's recipient info
    const view = await prisma.reelView.create({
      data: {
        screeningLinkId,
        viewerName: link.recipientName,
        viewerEmail: link.recipientEmail,
        viewerIp: geo.ip,
        viewerCity: geo.city,
        viewerCountry: geo.country,
        userAgent,
        device,
        isForwarded,
      },
    });

    return NextResponse.json({ viewId: view.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
