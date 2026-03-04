import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Eye, Smartphone, Monitor, Tablet, MapPin, Mail, Building2, Flame, RotateCcw, Share2, TrendingUp } from "lucide-react";
import { timeAgo, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { DateRangePicker } from "@/components/analytics/date-range-picker";

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

  const hasDateFilter = fromDate || toDate;

  // Role-based ownership filter
  const ownerFilter = isAdmin
    ? {}
    : { reel: { createdById: userId } };

  const viewOwnerFilter = isAdmin
    ? {}
    : { screeningLink: { reel: { createdById: userId } } };

  const [totalViews, recentViews, screeningLinks, topLocations, topAgencies] =
    await Promise.all([
      prisma.reelView.count({
        where: {
          ...(hasDateFilter ? { startedAt: dateFilter } : {}),
          ...viewOwnerFilter,
        },
      }),
      prisma.reelView.findMany({
        take: 30,
        orderBy: { startedAt: "desc" },
        where: {
          ...(hasDateFilter ? { startedAt: dateFilter } : {}),
          ...viewOwnerFilter,
        },
        include: {
          screeningLink: {
            include: {
              reel: {
                include: { director: { select: { name: true } } },
              },
            },
          },
          spotViews: {
            select: {
              percentWatched: true,
              rewatched: true,
              skipped: true,
            },
          },
        },
      }),
      prisma.screeningLink.findMany({
        where: {
          isActive: true,
          ...ownerFilter,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          reel: {
            include: { director: { select: { name: true } } },
          },
          _count: { select: { views: true } },
        },
      }),
      prisma.reelView.groupBy({
        by: ["viewerCity", "viewerCountry"],
        where: {
          viewerCity: { not: null },
          ...(hasDateFilter ? { startedAt: dateFilter } : {}),
          ...viewOwnerFilter,
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.screeningLink.groupBy({
        by: ["recipientCompany"],
        where: {
          recipientCompany: { not: null },
          ...ownerFilter,
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

  // Hot Leads — links with high engagement signals
  const hotLeadLinks = await prisma.screeningLink.findMany({
    where: {
      views: { some: {} },
      ...ownerFilter,
    },
    include: {
      reel: {
        include: { director: { select: { name: true } } },
      },
      views: {
        include: {
          spotViews: { select: { percentWatched: true } },
        },
      },
      _count: { select: { views: true } },
    },
    take: 50,
  });

  const hotLeads = hotLeadLinks
    .map((link) => {
      const viewCount = link._count.views;
      const uniqueDays = new Set(
        link.views.map((v) => v.startedAt.toISOString().split("T")[0])
      ).size;
      const allSpotViews = link.views.flatMap((v) => v.spotViews);
      const avgCompletion =
        allSpotViews.length > 0
          ? allSpotViews.reduce(
              (s, sv) => s + (sv.percentWatched || 0),
              0
            ) / allSpotViews.length
          : 0;
      const score = viewCount * 2 + uniqueDays * 3 + avgCompletion / 10;
      return {
        link,
        viewCount,
        uniqueDays,
        avgCompletion: Math.round(avgCompletion),
        score,
      };
    })
    .filter(
      (h) => h.viewCount >= 2 || h.avgCompletion > 70 || h.uniqueDays >= 2
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Top Performing Spots
  const spotPerformance = await prisma.spotView.groupBy({
    by: ["projectId"],
    _avg: { percentWatched: true },
    _count: { id: true },
    orderBy: { _avg: { percentWatched: "desc" } },
    take: 10,
  });

  const spotProjectIds = spotPerformance.map((s) => s.projectId);
  const spotProjects =
    spotProjectIds.length > 0
      ? await prisma.project.findMany({
          where: { id: { in: spotProjectIds } },
          select: {
            id: true,
            title: true,
            brand: true,
            director: { select: { name: true } },
          },
        })
      : [];
  const projectMap = new Map(spotProjects.map((p) => [p.id, p]));

  const rewatchCounts = await prisma.spotView.groupBy({
    by: ["projectId"],
    where: { rewatched: true },
    _count: { id: true },
  });
  const rewatchMap = new Map(
    rewatchCounts.map((r) => [r.projectId, r._count.id])
  );

  // Compute stats
  const viewsWithDuration = recentViews.filter((v) => v.totalDuration);
  const avgDuration =
    viewsWithDuration.length > 0
      ? viewsWithDuration.reduce(
          (sum, v) => sum + (v.totalDuration || 0),
          0
        ) / viewsWithDuration.length
      : 0;

  const deviceBreakdown = recentViews.reduce(
    (acc, v) => {
      const device = v.device || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const uniqueEmails = new Set(
    screeningLinks.map((l) => l.recipientEmail).filter(Boolean)
  );

  return (
    <div>
      {/* Header + Date Filter */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
            Analytics
          </h1>
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#999] mt-1.5">
            {isAdmin
              ? "Viewing activity across all reels"
              : "Your reel engagement"}
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Top stats */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <div className="flex gap-14">
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {totalViews}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Total Views
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {avgDuration ? formatDuration(avgDuration) : "\u2014"}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Avg. Watch Time
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {screeningLinks.length}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Active Links
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {uniqueEmails.size}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Recipients
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {deviceBreakdown["desktop"] || 0} /{" "}
              {deviceBreakdown["mobile"] || 0}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Desktop / Mobile
            </p>
          </div>
        </div>
      </div>

      {/* Three-column insights */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Locations */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Top Locations
            </h3>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-2">
              {topLocations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#1A1A1A]">
                    {loc.viewerCity}
                    {loc.viewerCountry ? `, ${loc.viewerCountry}` : ""}
                  </span>
                  <span className="text-[11px] text-[#999] tabular-nums">
                    {loc._count.id}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Location data populates as reels are viewed.
            </p>
          )}
        </div>

        {/* Agencies */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Top Agencies
            </h3>
          </div>
          {topAgencies.length > 0 ? (
            <div className="space-y-2">
              {topAgencies.map((agency, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#1A1A1A] truncate">
                    {agency.recipientCompany}
                  </span>
                  <span className="text-[11px] text-[#999] tabular-nums ml-3">
                    {agency._count.id}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Add recipient companies when creating screening links.
            </p>
          )}
        </div>

        {/* Recent Recipients */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Recent Recipients
            </h3>
          </div>
          {screeningLinks.filter((l) => l.recipientEmail || l.recipientName)
            .length > 0 ? (
            <div className="space-y-2.5">
              {screeningLinks
                .filter((l) => l.recipientEmail || l.recipientName)
                .slice(0, 10)
                .map((link) => (
                  <Link
                    key={link.id}
                    href={`/analytics/link/${link.id}`}
                    className="block min-w-0 group"
                  >
                    <p className="text-[12px] text-[#1A1A1A] truncate group-hover:text-black transition-colors">
                      {link.recipientName || link.recipientEmail}
                    </p>
                    <p className="text-[10px] text-[#ccc] truncate">
                      {link.recipientCompany
                        ? `${link.recipientCompany} · `
                        : ""}
                      {link._count.views} view
                      {link._count.views !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Add recipient info when sending screening links.
            </p>
          )}
        </div>
      </div>

      {/* Hot Leads + Top Spots */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Hot Leads */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={12} className="text-amber-500" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Hot Leads
            </h3>
          </div>
          {hotLeads.length > 0 ? (
            <div className="space-y-3">
              {hotLeads.map((hl) => (
                <Link
                  key={hl.link.id}
                  href={`/analytics/link/${hl.link.id}`}
                  className="block group"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[12px] text-[#1A1A1A] truncate font-medium group-hover:text-black transition-colors">
                        {hl.link.recipientName ||
                          hl.link.recipientEmail ||
                          "Anonymous"}
                      </p>
                      <p className="text-[10px] text-[#999] truncate mt-0.5">
                        {hl.link.recipientCompany &&
                          `${hl.link.recipientCompany} · `}
                        {hl.link.reel.director.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-[10px] text-[#999] tabular-nums flex items-center gap-0.5">
                        <Eye size={9} />
                        {hl.viewCount}
                      </span>
                      {hl.uniqueDays >= 2 && (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          {hl.uniqueDays}d
                        </span>
                      )}
                      {hl.avgCompletion > 0 && (
                        <span className="text-[10px] text-[#bbb] tabular-nums">
                          {hl.avgCompletion}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Hot leads appear as engagement accumulates.
            </p>
          )}
        </div>

        {/* Top Performing Spots */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Top Performing Spots
            </h3>
          </div>
          {spotPerformance.length > 0 ? (
            <div className="space-y-2.5">
              {spotPerformance.map((sp, i) => {
                const project = projectMap.get(sp.projectId);
                if (!project) return null;
                const avgPct = Math.round(sp._avg.percentWatched || 0);
                const rw = rewatchMap.get(sp.projectId) || 0;
                return (
                  <div key={sp.projectId} className="flex items-center gap-3">
                    <span className="text-[10px] text-[#ccc] w-4 text-right tabular-nums flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#1A1A1A] truncate">
                        {project.title}
                      </p>
                      <p className="text-[10px] text-[#999] truncate">
                        {project.director.name}
                        {project.brand ? ` · ${project.brand}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {rw > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                          <RotateCcw size={8} />
                          {rw}
                        </span>
                      )}
                      <span className="text-[10px] text-[#999] tabular-nums w-8 text-right">
                        {avgPct}%
                      </span>
                      <span className="text-[10px] text-[#bbb] tabular-nums">
                        {sp._count.id} play
                        {sp._count.id !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Spot performance data appears after views are tracked.
            </p>
          )}
        </div>
      </div>

      {/* View Feed */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          View Feed
        </h2>

        {recentViews.length > 0 ? (
          <div className="divide-y divide-[#F0F0EC]">
            {recentViews.map((view) => {
              const avgSpotCompletion =
                view.spotViews.length > 0
                  ? Math.round(
                      view.spotViews.reduce(
                        (sum, sv) => sum + (sv.percentWatched || 0),
                        0
                      ) / view.spotViews.length
                    )
                  : null;

              return (
                <Link
                  key={view.id}
                  href={`/analytics/link/${view.screeningLink.id}`}
                  className="flex items-center justify-between py-3.5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-[#bbb]">
                      {view.device === "mobile" ? (
                        <Smartphone size={12} />
                      ) : view.device === "tablet" ? (
                        <Tablet size={12} />
                      ) : (
                        <Monitor size={12} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] truncate">
                        <span className="text-[#1A1A1A] font-medium group-hover:text-black transition-colors">
                          {view.viewerName || view.screeningLink.recipientName || "Anonymous"}
                        </span>
                        {view.screeningLink.recipientCompany && (
                          <span className="text-[#999]">
                            {" "}
                            ({view.screeningLink.recipientCompany})
                          </span>
                        )}
                        <span className="text-[#bbb]"> viewed </span>
                        <span className="text-[#666]">
                          {view.screeningLink.reel.director.name}&apos;s{" "}
                          {view.screeningLink.reel.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {view.totalDuration != null &&
                          view.totalDuration > 0 && (
                            <span className="text-[10px] text-[#bbb]">
                              Watched {formatDuration(view.totalDuration)}
                            </span>
                          )}
                        {avgSpotCompletion !== null && (
                          <span className="text-[10px] text-[#bbb]">
                            {avgSpotCompletion}% avg completion
                          </span>
                        )}
                        {view.viewerCity && (
                          <span className="text-[10px] text-[#bbb] flex items-center gap-0.5">
                            <MapPin size={8} />
                            {view.viewerCity}
                            {view.viewerCountry
                              ? `, ${view.viewerCountry}`
                              : ""}
                          </span>
                        )}
                        {view.isForwarded && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                            <Share2 size={8} />
                            Forwarded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#ccc] flex-shrink-0 ml-6">
                    {timeAgo(view.startedAt)}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-[13px] text-[#999]">
              No views recorded yet. Send a reel to start tracking engagement.
            </p>
          </div>
        )}
      </div>

      {/* Active Screening Links */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          Active Screening Links
        </h2>

        {screeningLinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 divide-y-0">
            {screeningLinks.map((link) => (
              <Link
                key={link.id}
                href={`/analytics/link/${link.id}`}
                className="group py-3.5 block border-b border-[#F0F0EC]"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#1A1A1A] group-hover:text-black transition-colors truncate font-medium">
                      {link.recipientName || link.recipientEmail || "Untitled"}
                    </p>
                    <p className="text-[11px] text-[#999] truncate mt-0.5">
                      {link.reel.director.name} — {link.reel.title}
                    </p>
                    {(link.recipientCompany || link.recipientEmail) && (
                      <p className="text-[10px] text-[#ccc] mt-0.5 truncate">
                        {[link.recipientCompany, link.recipientEmail]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-[#bbb] flex items-center gap-1 flex-shrink-0 ml-3">
                    <Eye size={10} />
                    {link._count.views}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[#999]">
              No active screening links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
