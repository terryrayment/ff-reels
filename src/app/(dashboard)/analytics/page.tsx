import { prisma } from "@/lib/db";
import { Eye, Clock, Film, Monitor, Smartphone, Tablet } from "lucide-react";
import { timeAgo, formatDuration } from "@/lib/utils";
import Link from "next/link";

export default async function AnalyticsPage() {
  const [totalViews, recentViews, screeningLinks] = await Promise.all([
    prisma.reelView.count(),
    prisma.reelView.findMany({
      take: 20,
      orderBy: { startedAt: "desc" },
      include: {
        screeningLink: {
          include: {
            reel: {
              include: { director: { select: { name: true } } },
            },
          },
        },
        spotViews: {
          select: { percentWatched: true, rewatched: true, skipped: true },
        },
      },
    }),
    prisma.screeningLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reel: {
          include: { director: { select: { name: true } } },
        },
        _count: { select: { views: true } },
      },
    }),
  ]);

  const avgDuration =
    recentViews.length > 0
      ? recentViews.reduce((sum, v) => sum + (v.totalDuration || 0), 0) /
        recentViews.filter((v) => v.totalDuration).length
      : 0;

  const deviceBreakdown = recentViews.reduce(
    (acc, v) => {
      const device = v.device || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">Analytics</h1>
      <p className="text-sm text-[#999] mt-1">
        Viewing activity and engagement across all reels.
      </p>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="p-5 bg-white border border-[#E8E8E3]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#999] uppercase tracking-wider font-semibold">Total Views</p>
            <Eye size={14} className="text-[#ccc]" />
          </div>
          <p className="text-2xl font-semibold mt-2">{totalViews}</p>
        </div>
        <div className="p-5 bg-white border border-[#E8E8E3]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#999] uppercase tracking-wider font-semibold">Avg. Watch Time</p>
            <Clock size={14} className="text-[#ccc]" />
          </div>
          <p className="text-2xl font-semibold mt-2">
            {avgDuration ? formatDuration(avgDuration) : "\u2014"}
          </p>
        </div>
        <div className="p-5 bg-white border border-[#E8E8E3]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#999] uppercase tracking-wider font-semibold">Active Links</p>
            <Film size={14} className="text-[#ccc]" />
          </div>
          <p className="text-2xl font-semibold mt-2">{screeningLinks.length}</p>
        </div>
        <div className="p-5 bg-white border border-[#E8E8E3]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#999] uppercase tracking-wider font-semibold">Desktop / Mobile</p>
            <Monitor size={14} className="text-[#ccc]" />
          </div>
          <p className="text-2xl font-semibold mt-2">
            {deviceBreakdown["desktop"] || 0} / {deviceBreakdown["mobile"] || 0}
          </p>
        </div>
      </div>

      {/* Recent views feed */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-4">
          View Feed
        </h2>

        {recentViews.length > 0 ? (
          <div className="bg-white border border-[#E8E8E3] divide-y divide-[#E8E8E3]">
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
                <div
                  key={view.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-sm bg-[#F7F6F3] flex items-center justify-center flex-shrink-0">
                      {view.device === "mobile" ? (
                        <Smartphone size={12} className="text-[#999]" />
                      ) : view.device === "tablet" ? (
                        <Tablet size={12} className="text-[#999]" />
                      ) : (
                        <Monitor size={12} className="text-[#999]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        <span className="text-[#1A1A1A] font-medium">
                          {view.screeningLink.recipientName || "Anonymous"}
                        </span>
                        <span className="text-[#999]"> viewed </span>
                        <span className="text-[#666]">
                          {view.screeningLink.reel.director.name}&apos;s{" "}
                          {view.screeningLink.reel.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {view.totalDuration && (
                          <span className="text-[10px] text-[#999]">
                            Watched {formatDuration(view.totalDuration)}
                          </span>
                        )}
                        {avgSpotCompletion !== null && (
                          <span className="text-[10px] text-[#999]">
                            {avgSpotCompletion}% avg completion
                          </span>
                        )}
                        {view.viewerCity && (
                          <span className="text-[10px] text-[#999]">
                            {view.viewerCity}
                            {view.viewerCountry ? `, ${view.viewerCountry}` : ""}
                          </span>
                        )}
                        {view.isForwarded && (
                          <span className="text-[10px] text-amber-600">
                            Forwarded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#ccc] flex-shrink-0 ml-4">
                    {timeAgo(view.startedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-white border border-[#E8E8E3]">
            <p className="text-sm text-[#999]">
              No views recorded yet. Send a reel to start tracking engagement.
            </p>
          </div>
        )}
      </div>

      {/* Active Screening Links */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-4">
          Active Screening Links
        </h2>

        {screeningLinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {screeningLinks.map((link) => (
              <Link
                key={link.id}
                href={`/reels/${link.reel.id}`}
                className="p-4 bg-white border border-[#E8E8E3] hover:border-[#ccc] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {link.recipientName || link.recipientEmail || "Untitled"}
                    </p>
                    <p className="text-xs text-[#999] truncate mt-0.5">
                      {link.reel.director.name} \u2014 {link.reel.title}
                    </p>
                  </div>
                  <span className="text-xs text-[#999] flex items-center gap-1 flex-shrink-0 ml-2">
                    <Eye size={10} />
                    {link._count.views}
                  </span>
                </div>
                {link.recipientCompany && (
                  <p className="text-[10px] text-[#ccc] mt-1">{link.recipientCompany}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-white border border-[#E8E8E3]">
            <p className="text-sm text-[#999]">
              No active screening links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
