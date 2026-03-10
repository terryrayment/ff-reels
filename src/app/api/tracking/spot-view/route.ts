import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/tracking/spot-view
 * Record or update per-spot engagement data.
 * Upserts: same viewId + projectId → update, not duplicate.
 * Public endpoint — no auth required.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      viewId,
      projectId,
      watchDuration,
      totalDuration,
      percentWatched,
      rewatched,
      skipped,
      // Richer video signals (Feature 7)
      pauseCount: clientPauseCount,
      seekForwardCount: clientSeekForward,
      seekBackwardCount: clientSeekBackward,
      fullscreenToggleCount: clientFullscreen,
      playbackRateChanges: clientPlaybackRates,
      videoQuality: clientVideoQuality,
    } = body;

    if (!viewId || !projectId) {
      return NextResponse.json(
        { error: "viewId and projectId required" },
        { status: 400 }
      );
    }

    // Validate the view exists
    const view = await prisma.reelView.findUnique({
      where: { id: viewId },
      select: { id: true },
    });

    if (!view) {
      return NextResponse.json(
        { error: "View not found" },
        { status: 404 }
      );
    }

    // Check if a SpotView already exists for this view + project
    const existing = await prisma.spotView.findFirst({
      where: { reelViewId: viewId, projectId },
    });

    if (existing) {
      // Update the existing SpotView (e.g. user continued watching)
      await prisma.spotView.update({
        where: { id: existing.id },
        data: {
          watchDuration: watchDuration ?? existing.watchDuration,
          totalDuration: totalDuration ?? existing.totalDuration,
          percentWatched: percentWatched ?? existing.percentWatched,
          rewatched: rewatched || existing.rewatched,
          skipped: skipped !== undefined ? skipped : existing.skipped,
          // Video signals — use max since client sends cumulative values
          pauseCount: Math.max(clientPauseCount ?? 0, existing.pauseCount),
          seekForwardCount: Math.max(clientSeekForward ?? 0, existing.seekForwardCount),
          seekBackwardCount: Math.max(clientSeekBackward ?? 0, existing.seekBackwardCount),
          fullscreenToggleCount: Math.max(clientFullscreen ?? 0, existing.fullscreenToggleCount),
          playbackRateChanges: clientPlaybackRates ?? existing.playbackRateChanges,
          videoQuality: clientVideoQuality ?? existing.videoQuality,
        },
      });
    } else {
      // Create new SpotView
      await prisma.spotView.create({
        data: {
          reelViewId: viewId,
          projectId,
          watchDuration: watchDuration ?? null,
          totalDuration: totalDuration ?? null,
          percentWatched: percentWatched ?? null,
          rewatched: rewatched ?? false,
          skipped: skipped ?? false,
          // Video signals
          pauseCount: clientPauseCount ?? 0,
          seekForwardCount: clientSeekForward ?? 0,
          seekBackwardCount: clientSeekBackward ?? 0,
          fullscreenToggleCount: clientFullscreen ?? 0,
          playbackRateChanges: clientPlaybackRates ?? null,
          videoQuality: clientVideoQuality ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to record spot view" },
      { status: 500 }
    );
  }
}
