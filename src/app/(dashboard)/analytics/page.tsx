import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { ReelAnalyticsTable, type ReelRow } from "@/components/analytics/reel-analytics-table";
import { HeroStats } from "@/components/analytics/hero-stats";
import { ViewsOverTimeChart } from "@/components/analytics/views-over-time-chart";
import { EngagementOverview } from "@/components/analytics/engagement-overview";
import { TopSpotsTable } from "@/components/analytics/top-spots-table";
import {
  getHeroStats,
  getViewsPerDay,
  getEngagementOverview,
  getTopSpots,
} from "@/lib/analytics/queries";
import { getEngagementScores } from "@/lib/analytics/scoring";
import { getCommitteeLinks } from "@/lib/analytics/committee";
import { prisma } from "@/lib/db";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  // Date range filtering
  const fromDate = searchParams.from ? new Date(searchParams.from) : null;
  const toDate = searchParams.to
    ? new Date(searchParams.to + "T23:59:59")
    : null;

  const dateFilter = {
    ...(fromDate ? { gte: fromDate } : {}),
    ...(toDate ? { lte: toDate } : {}),
  };

  const hasDateFilter = !!(fromDate || toDate);

  // Role-based ownership filters
  const reelOwnerFilter = isAdmin ? {} : { createdById: userId };
  const viewOwnerFilter = isAdmin
    ? {}
    : { screeningLink: { reel: { createdById: userId } } };
  const ownerFilter = isAdmin ? {} : { reel: { createdById: userId } };

  // ── Fetch all dashboard data in parallel ──
  const [heroStats, viewsPerDay, engagement, topSpots, reels] =
    await Promise.all([
      getHeroStats(dateFilter, hasDateFilter, viewOwnerFilter, ownerFilter, fromDate, toDate),
      getViewsPerDay(dateFilter, hasDateFilter, viewOwnerFilter, fromDate, toDate),
      getEngagementOverview(dateFilter, hasDateFilter, viewOwnerFilter),
      getTopSpots(dateFilter, hasDateFilter, viewOwnerFilter),
      // Existing reel table query
      prisma.reel.findMany({
        where: reelOwnerFilter,
        orderBy: { updatedAt: "desc" },
        take: 100,
        include: {
          director: { select: { name: true } },
          createdBy: { select: { name: true } },
          screeningLinks: {
            select: {
              id: true,
              isActive: true,
              createdAt: true,
              recipientName: true,
              recipientEmail: true,
              recipientCompany: true,
              contactId: true,
              views: {
                select: {
                  id: true,
                  viewerName: true,
                  viewerEmail: true,
                  viewerCity: true,
                  viewerCountry: true,
                  device: true,
                  startedAt: true,
                  totalDuration: true,
                  spotViews: {
                    select: { percentWatched: true },
                    take: 10,
                  },
                },
                orderBy: { startedAt: "desc" },
                take: 25,
              },
              _count: { select: { views: true } },
            },
            ...(hasDateFilter
              ? { where: { createdAt: dateFilter } }
              : {}),
          },
        },
      }),
    ]);

  // ── Compute engagement scores + committee detection ──
  const allScreeningLinkIds = reels.flatMap((r) =>
    r.screeningLinks.map((sl) => sl.id)
  );
  const [engagementScoreMap, committeeMap] = await Promise.all([
    getEngagementScores(allScreeningLinkIds),
    getCommitteeLinks(allScreeningLinkIds),
  ]);

  // ── Compute per-reel row data ──
  const reelRows: ReelRow[] = reels.map((reel) => {
    const totalViewsForReel = reel.screeningLinks.reduce(
      (sum, link) => sum + link._count.views,
      0
    );
    const totalSent = reel.screeningLinks.length;
    const activeLinks = reel.screeningLinks.filter((l) => l.isActive).length;

    const sentDates = reel.screeningLinks.map((l) => l.createdAt.getTime());
    const lastSent = sentDates.length > 0
      ? new Date(Math.max(...sentDates)).toISOString()
      : null;

    const allViews = reel.screeningLinks.flatMap((link) =>
      link.views.map((v) => {
        const avgCompletion =
          v.spotViews.length > 0
            ? Math.round(
                v.spotViews.reduce((s, sv) => s + (sv.percentWatched || 0), 0) /
                  v.spotViews.length
              )
            : null;
        return {
          id: v.id,
          viewerName: v.viewerName || link.recipientName || "Anonymous",
          viewerEmail: v.viewerEmail || link.recipientEmail || null,
          company: link.recipientCompany || null,
          contactId: link.contactId || null,
          city: v.viewerCity || null,
          country: v.viewerCountry || null,
          device: v.device || "desktop",
          startedAt: v.startedAt.toISOString(),
          duration: v.totalDuration || null,
          avgCompletion,
        };
      })
    );

    allViews.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const lastViewed = allViews.length > 0 ? allViews[0].startedAt : null;

    const recipients = reel.screeningLinks
      .filter((l) => l.recipientName || l.recipientCompany)
      .map((l) => ({
        name: l.recipientName || l.recipientEmail || null,
        company: l.recipientCompany || null,
        contactId: l.contactId || null,
      }));
    const recipient = recipients.length > 0
      ? recipients[0].name
        ? (recipients[0].company
            ? `${recipients[0].name} (${recipients[0].company})`
            : recipients[0].name)
        : recipients[0].company || null
      : null;
    const recipientCount = recipients.length;
    const recipientContactId = recipients.length > 0 ? recipients[0].contactId : null;

    const allSpotCompletions = allViews
      .map((v) => v.avgCompletion)
      .filter((c): c is number => c !== null);
    const avgCompletionPct = allSpotCompletions.length > 0
      ? Math.round(
          allSpotCompletions.reduce((s, c) => s + c, 0) / allSpotCompletions.length
        )
      : null;

    // Engagement scoring — pick the best score across all links for this reel
    let bestScore: { score: number; tier: "hot" | "warm" | "cold" } | null = null;
    for (const link of reel.screeningLinks) {
      const es = engagementScoreMap.get(link.id);
      if (es && (!bestScore || es.score > bestScore.score)) {
        bestScore = { score: es.score, tier: es.tier };
      }
    }

    // Committee detection — aggregate across all links
    let committeeCount: number | null = null;
    let committeeCompany: string | null = null;
    for (const link of reel.screeningLinks) {
      const ci = committeeMap.get(link.id);
      if (ci) {
        if (!committeeCount || ci.distinctViewerCount > committeeCount) {
          committeeCount = ci.distinctViewerCount;
          committeeCompany = ci.company;
        }
      }
    }

    return {
      id: reel.id,
      title: reel.title,
      directorName: reel.director.name,
      reelType: reel.reelType,
      sentByName: reel.createdBy?.name || "Unknown",
      totalViews: totalViewsForReel,
      totalSent,
      activeLinks,
      lastSent,
      lastViewed,
      views: allViews,
      recipient,
      recipientCount,
      recipientContactId,
      avgCompletionPct,
      engagementScore: bestScore?.score ?? null,
      engagementTier: bestScore?.tier ?? null,
      committeeCount,
      committeeCompany,
    };
  });

  return (
    <div>
      {/* Header + Date Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
        <div>
          <h1 className="text-[32px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
            Analytics
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#aaa] mt-2 md:mt-3">
            {isAdmin
              ? "All reel activity"
              : "Your reel engagement"}
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Hero Stats with Trends */}
      <HeroStats stats={heroStats} />

      {/* Reel Activity Table */}
      <ReelAnalyticsTable rows={reelRows} />

      {/* Views Over Time */}
      <ViewsOverTimeChart data={viewsPerDay} />

      {/* Engagement Overview — 3-col grid */}
      <EngagementOverview data={engagement} />

      {/* Top Performing Spots */}
      <TopSpotsTable spots={topSpots} />
    </div>
  );
}
