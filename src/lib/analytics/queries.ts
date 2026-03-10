import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/utils";
import type {
  HeroStat,
  DayPoint,
  DeviceSlice,
  LocationRow,
  TopSpot,
  EngagementData,
} from "./types";

/* ─── Types for filter params ──────────────────────── */

type DateFilter = { gte?: Date; lte?: Date };
type OwnerFilter = Record<string, unknown>;

/* ─── Previous Period ──────────────────────────────── */

export function computePreviousPeriod(
  from: Date | null,
  to: Date | null
): { from: Date; to: Date } | null {
  if (!from) return null; // "All time" — no comparison
  const end = to || new Date();
  const durationMs = end.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - durationMs),
    to: new Date(from.getTime() - 1), // 1ms before current period start
  };
}

/* ─── Hero Stats ───────────────────────────────────── */

export async function getHeroStats(
  dateFilter: DateFilter,
  hasDateFilter: boolean,
  viewOwnerFilter: OwnerFilter,
  ownerFilter: OwnerFilter,
  from: Date | null,
  to: Date | null
): Promise<HeroStat[]> {
  const viewWhere = {
    ...(hasDateFilter ? { startedAt: dateFilter } : {}),
    ...viewOwnerFilter,
  };

  const [totalViews, viewsWithDuration, activeLinksCount, uniqueRecipients, deviceCounts] =
    await Promise.all([
      prisma.reelView.count({ where: viewWhere }),
      prisma.reelView.findMany({
        where: viewWhere,
        select: { totalDuration: true },
      }),
      prisma.screeningLink.count({
        where: { isActive: true, ...ownerFilter },
      }),
      prisma.screeningLink.findMany({
        where: ownerFilter,
        select: { recipientEmail: true },
        distinct: ["recipientEmail"],
      }),
      prisma.reelView.groupBy({
        by: ["device"],
        where: viewWhere,
        _count: true,
      }),
    ]);

  // Compute averages
  const durationsOnly = viewsWithDuration
    .map((v) => v.totalDuration)
    .filter((d): d is number => d != null && d > 0);
  const avgDuration =
    durationsOnly.length > 0
      ? durationsOnly.reduce((a, b) => a + b, 0) / durationsOnly.length
      : 0;
  const uniqueEmailCount = uniqueRecipients.filter((r) => r.recipientEmail).length;

  const desktopCount = deviceCounts.find((d) => d.device === "desktop")?._count ?? 0;
  const mobileCount = deviceCounts.find((d) => d.device === "mobile")?._count ?? 0;

  // ── Previous period ──
  const prev = computePreviousPeriod(from, to);
  let prevViews: number | null = null;
  let prevAvgDuration: number | null = null;
  let prevLinks: number | null = null;
  let prevRecipients: number | null = null;

  if (prev) {
    const prevDateFilter = { gte: prev.from, lte: prev.to };
    const prevViewWhere = { startedAt: prevDateFilter, ...viewOwnerFilter };

    const [pViews, pDurations, pLinks, pRecipients] = await Promise.all([
      prisma.reelView.count({ where: prevViewWhere }),
      prisma.reelView.findMany({
        where: prevViewWhere,
        select: { totalDuration: true },
      }),
      prisma.screeningLink.count({
        where: { isActive: true, createdAt: prevDateFilter, ...ownerFilter },
      }),
      prisma.screeningLink.findMany({
        where: { createdAt: prevDateFilter, ...ownerFilter },
        select: { recipientEmail: true },
        distinct: ["recipientEmail"],
      }),
    ]);

    prevViews = pViews;
    const pDurs = pDurations
      .map((v) => v.totalDuration)
      .filter((d): d is number => d != null && d > 0);
    prevAvgDuration = pDurs.length > 0 ? pDurs.reduce((a, b) => a + b, 0) / pDurs.length : 0;
    prevLinks = pLinks;
    prevRecipients = pRecipients.filter((r) => r.recipientEmail).length;
  }

  function trendPct(current: number, previous: number | null): number | null {
    if (previous == null || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }

  return [
    {
      label: "Total Views",
      value: totalViews,
      previousValue: prevViews,
      trendPct: trendPct(totalViews, prevViews),
    },
    {
      label: "Avg. Watch Time",
      value: avgDuration ? formatDuration(avgDuration) : "—",
      previousValue: prevAvgDuration ? formatDuration(prevAvgDuration) : null,
      trendPct: trendPct(avgDuration, prevAvgDuration),
    },
    {
      label: "Active Links",
      value: activeLinksCount,
      previousValue: prevLinks,
      trendPct: trendPct(activeLinksCount, prevLinks),
    },
    {
      label: "Recipients",
      value: uniqueEmailCount,
      previousValue: prevRecipients,
      trendPct: trendPct(uniqueEmailCount, prevRecipients),
    },
    {
      label: "Desktop / Mobile",
      value: `${desktopCount} / ${mobileCount}`,
    },
  ];
}

/* ─── Views Per Day ────────────────────────────────── */

export async function getViewsPerDay(
  dateFilter: DateFilter,
  hasDateFilter: boolean,
  viewOwnerFilter: OwnerFilter,
  from: Date | null,
  to: Date | null
): Promise<DayPoint[]> {
  // Default range: last 30 days if no filter
  const rangeStart = from || new Date(Date.now() - 30 * 86400000);
  const rangeEnd = to || new Date();

  const views = await prisma.reelView.findMany({
    where: {
      startedAt: { gte: rangeStart, lte: rangeEnd },
      ...viewOwnerFilter,
    },
    select: { startedAt: true },
    orderBy: { startedAt: "asc" },
  });

  // Bucket by day
  const buckets = new Map<string, number>();
  for (const v of views) {
    const day = v.startedAt.toISOString().split("T")[0];
    buckets.set(day, (buckets.get(day) || 0) + 1);
  }

  // Gap-fill
  const result: DayPoint[] = [];
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    const key = cursor.toISOString().split("T")[0];
    result.push({ date: key, views: buckets.get(key) || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

/* ─── Engagement Overview ──────────────────────────── */

export async function getEngagementOverview(
  dateFilter: DateFilter,
  hasDateFilter: boolean,
  viewOwnerFilter: OwnerFilter
): Promise<EngagementData> {
  const viewWhere = {
    ...(hasDateFilter ? { startedAt: dateFilter } : {}),
    ...viewOwnerFilter,
  };

  const [spotViews, deviceGroups, locationViews] = await Promise.all([
    // Avg completion across all spot views
    prisma.spotView.aggregate({
      where: {
        reelView: viewWhere,
      },
      _avg: { percentWatched: true },
    }),

    // Device breakdown
    prisma.reelView.groupBy({
      by: ["device"],
      where: viewWhere,
      _count: true,
    }),

    // Top locations — include views with city OR country
    prisma.reelView.findMany({
      where: {
        ...viewWhere,
        OR: [
          { viewerCity: { not: null } },
          { viewerCountry: { not: null } },
        ],
      },
      select: { viewerCity: true, viewerCountry: true },
    }),
  ]);

  const avgCompletion = Math.round(spotViews._avg.percentWatched || 0);

  const devices: DeviceSlice[] = deviceGroups
    .filter((d) => d.device)
    .map((d) => ({
      device: d.device || "unknown",
      count: d._count,
    }));

  // Aggregate locations — use country as city fallback for carrier IPs
  const locMap = new Map<string, { city: string; country: string; views: number }>();
  for (const v of locationViews) {
    const city = v.viewerCity || "";
    const country = v.viewerCountry || "";
    const key = `${city}|${country}`;
    const existing = locMap.get(key);
    if (existing) {
      existing.views++;
    } else {
      locMap.set(key, {
        city,
        country,
        views: 1,
      });
    }
  }

  const topLocations: LocationRow[] = Array.from(locMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return { avgCompletion, devices, topLocations };
}

/* ─── Top Performing Spots ─────────────────────────── */

export async function getTopSpots(
  dateFilter: DateFilter,
  hasDateFilter: boolean,
  viewOwnerFilter: OwnerFilter
): Promise<TopSpot[]> {
  const viewWhere = {
    ...(hasDateFilter ? { startedAt: dateFilter } : {}),
    ...viewOwnerFilter,
  };

  // Get spot-level aggregation
  const spotGroups = await prisma.spotView.groupBy({
    by: ["projectId"],
    where: {
      reelView: viewWhere,
    },
    _count: true,
    _avg: { percentWatched: true },
    orderBy: { _count: { projectId: "desc" } },
    take: 10,
  });

  if (spotGroups.length === 0) return [];

  const projectIds = spotGroups.map((s) => s.projectId);

  // Get rewatch/skip counts
  const [rewatchCounts, skipCounts, projects] = await Promise.all([
    prisma.spotView.groupBy({
      by: ["projectId"],
      where: {
        projectId: { in: projectIds },
        rewatched: true,
        reelView: viewWhere,
      },
      _count: true,
    }),
    prisma.spotView.groupBy({
      by: ["projectId"],
      where: {
        projectId: { in: projectIds },
        skipped: true,
        reelView: viewWhere,
      },
      _count: true,
    }),
    prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        title: true,
        director: { select: { name: true } },
      },
    }),
  ]);

  const rewatchMap = new Map(rewatchCounts.map((r) => [r.projectId, r._count]));
  const skipMap = new Map(skipCounts.map((s) => [s.projectId, s._count]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return spotGroups.map((sg) => {
    const project = projectMap.get(sg.projectId);
    return {
      projectId: sg.projectId,
      title: project?.title || "Unknown",
      directorName: project?.director?.name || "Unknown",
      plays: sg._count,
      avgCompletion: Math.round(sg._avg.percentWatched || 0),
      rewatchCount: rewatchMap.get(sg.projectId) || 0,
      skipCount: skipMap.get(sg.projectId) || 0,
    };
  });
}
