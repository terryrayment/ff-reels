import { prisma } from "@/lib/db";
import type { EngagementScore, EngagementTier } from "./types";

/* ─── Pure scoring function ───────────────────────── */

interface ScoringInput {
  avgCompletion: number; // 0-100
  rewatchRate: number; // 0-1 (fraction of views with rewatches)
  viewFrequency: number; // views per day since first view
  totalTimeSpent: number; // seconds
}

/**
 * Weighted engagement score (0-100).
 *
 * Weights:
 *   Completion  35% — how much they watch
 *   Rewatch     25% — rewatching = high interest
 *   Frequency   20% — how often they return (capped at 3/day)
 *   Time        20% — total engagement time (capped at 600s)
 */
export function computeEngagementScore(input: ScoringInput): EngagementScore {
  const completionScore = Math.min(100, Math.max(0, input.avgCompletion));
  const rewatchScore = Math.min(1, Math.max(0, input.rewatchRate)) * 100;
  const frequencyScore = Math.min(input.viewFrequency / 3, 1) * 100;
  const timeScore = Math.min(input.totalTimeSpent / 600, 1) * 100;

  const raw = Math.round(
    completionScore * 0.35 +
      rewatchScore * 0.25 +
      frequencyScore * 0.20 +
      timeScore * 0.20
  );

  const score = Math.min(100, Math.max(0, raw));
  const tier: EngagementTier =
    score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  return {
    score,
    tier,
    components: {
      completion: Math.round(completionScore),
      rewatch: Math.round(rewatchScore),
      frequency: Math.round(frequencyScore),
      timeSpent: Math.round(timeScore),
    },
  };
}

/* ─── Data query — scores per screening link ──────── */

export async function getEngagementScores(
  screeningLinkIds: string[]
): Promise<Map<string, EngagementScore>> {
  if (screeningLinkIds.length === 0) return new Map();

  const links = await prisma.screeningLink.findMany({
    where: { id: { in: screeningLinkIds } },
    include: {
      views: {
        select: {
          id: true,
          startedAt: true,
          totalDuration: true,
          spotViews: {
            select: { percentWatched: true, rewatched: true },
          },
        },
      },
    },
  });

  const map = new Map<string, EngagementScore>();

  for (const link of links) {
    if (link.views.length === 0) continue;

    // avgCompletion: average of all spotView.percentWatched
    const allSpotViews = link.views.flatMap((v) => v.spotViews);
    const completions = allSpotViews
      .filter((sv) => sv.percentWatched != null)
      .map((sv) => sv.percentWatched!);
    const avgCompletion =
      completions.length > 0
        ? completions.reduce((s, c) => s + c, 0) / completions.length
        : 0;

    // rewatchRate: fraction of views that have any rewatched spotView
    const viewsWithRewatch = link.views.filter((v) =>
      v.spotViews.some((sv) => sv.rewatched)
    ).length;
    const rewatchRate =
      link.views.length > 0 ? viewsWithRewatch / link.views.length : 0;

    // viewFrequency: totalViews / daysSinceFirstView (min 1 day)
    const firstView = link.views.reduce(
      (earliest, v) =>
        v.startedAt < earliest ? v.startedAt : earliest,
      link.views[0].startedAt
    );
    const daysSince = Math.max(
      1,
      (Date.now() - new Date(firstView).getTime()) / (1000 * 60 * 60 * 24)
    );
    const viewFrequency = link.views.length / daysSince;

    // totalTimeSpent: sum of all view durations
    const totalTimeSpent = link.views.reduce(
      (s, v) => s + (v.totalDuration || 0),
      0
    );

    map.set(
      link.id,
      computeEngagementScore({
        avgCompletion,
        rewatchRate,
        viewFrequency,
        totalTimeSpent,
      })
    );
  }

  return map;
}
