import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectDevice } from "@/lib/analytics/device";
import { extractGeo } from "@/lib/analytics/geo";
import { PITCH_SLUGS } from "@/lib/pitch/companies";

/**
 * POST /api/tracking/pitch-view
 * Record an open on a branded pitch page (/pitch/[slug]).
 * Public endpoint — no auth, fired by a client-side beacon so that
 * email link-scanner bots (which don't run JS) are filtered out.
 */

const VALID_SLUGS = new Set([...PITCH_SLUGS, "versant"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug : null;
    const referrer =
      typeof body?.referrer === "string" && body.referrer.length < 500
        ? body.referrer
        : null;

    if (!slug || !VALID_SLUGS.has(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const geo = extractGeo(req);
    const userAgent = req.headers.get("user-agent") || null;

    await prisma.pitchPageView.create({
      data: {
        slug,
        viewerIp: geo.ip,
        city: geo.city,
        country: geo.country,
        userAgent,
        device: detectDevice(userAgent),
        referrer,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[pitch-view] failed to record view", error);
    // Never surface tracking errors to the page
    return new NextResponse(null, { status: 204 });
  }
}
