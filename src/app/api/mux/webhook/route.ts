import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMux } from "@/lib/mux/client";

/**
 * Mux Webhook handler
 * Receives events when video assets finish processing, error, etc.
 * Set this URL in your Mux Dashboard: https://dashboard.mux.com/settings/webhooks
 *
 * Flow: upload.asset_created (bridges upload → asset) → asset.ready (sets playbackId)
 *
 * Env: MUX_WEBHOOK_SECRET — from Mux dashboard webhook settings.
 * When set, webhook signature is verified. When missing, verification is
 * skipped (dev only — logs a warning).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify webhook signature when secret is configured
    const secret = process.env.MUX_WEBHOOK_SECRET;
    if (secret) {
      const mux = getMux();
      const signature = req.headers.get("mux-signature") || "";
      try {
        mux.webhooks.verifySignature(rawBody, { "mux-signature": signature }, secret);
      } catch {
        console.error("[Mux webhook] Signature verification failed");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("[Mux webhook] MUX_WEBHOOK_SECRET not set — skipping signature verification");
    }

    const body = JSON.parse(rawBody);
    const { type, data } = body;

    switch (type) {
      // Bridge upload ID → asset ID so that asset.ready can find the project
      case "video.upload.asset_created": {
        const uploadId = data.id; // This is the upload ID
        const assetId = data.asset_id;

        if (uploadId && assetId) {
          const updated = await prisma.project.updateMany({
            where: { muxUploadId: uploadId },
            data: {
              muxAssetId: assetId,
              muxStatus: "preparing",
            },
          });
          if (updated.count > 0) {
            console.log(`[Mux webhook] Linked upload ${uploadId} → asset ${assetId}`);
          }
        }
        break;
      }

      case "video.asset.ready": {
        const assetId = data.id;
        const playbackId = data.playback_ids?.[0]?.id;
        const duration = data.duration;
        const aspectRatio = data.aspect_ratio;

        // Use updateMany to avoid throwing if no project matches (e.g. deleted project)
        const updated = await prisma.project.updateMany({
          where: { muxAssetId: assetId },
          data: {
            muxPlaybackId: playbackId,
            muxStatus: "ready",
            ...(duration != null ? { duration } : {}),
            ...(aspectRatio ? { aspectRatio } : {}),
          },
        });

        if (updated.count === 0) {
          console.warn(`[Mux webhook] No project found for asset ${assetId} — may have been deleted`);
        }
        break;
      }

      case "video.asset.errored": {
        const assetId = data.id;
        await prisma.project.updateMany({
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
