import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Mux Webhook handler
 * Receives events when video assets finish processing, error, etc.
 * Set this URL in your Mux Dashboard: https://dashboard.mux.com/settings/webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // TODO: Verify Mux webhook signature in production
    // https://docs.mux.com/guides/listen-for-webhooks#verify-webhook-signatures

    switch (type) {
      case "video.asset.ready": {
        const assetId = data.id;
        const playbackId = data.playback_ids?.[0]?.id;
        const duration = data.duration;
        const aspectRatio = data.aspect_ratio;

        await prisma.project.update({
          where: { muxAssetId: assetId },
          data: {
            muxPlaybackId: playbackId,
            muxStatus: "ready",
            duration,
            aspectRatio,
          },
        });
        break;
      }

      case "video.asset.errored": {
        const assetId = data.id;
        await prisma.project.update({
          where: { muxAssetId: assetId },
          data: { muxStatus: "errored" },
        });
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mux webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
