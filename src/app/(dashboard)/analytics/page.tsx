import { prisma } from "@/lib/db";
import { Eye, Clock, Film, Monitor, Smartphone, Tablet } from "lucide-react";
import { timeAgo, formatDuration } from "@/lib/utils";
import Link from "next/link";

export default async function AnalyticsPage() {
  // Fetch all analytics data
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

  // Calculate some aggregate stats
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
      <h1 className="text-2xl font-light tracking-tight">Analytics</h1>
      <p className="text-sm text-white/40 mt-1">
        Viewing activity and engagement across all reels.
      </p>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 uppercase tracking-wider">Total Views</p>
            <Eye size={14} className="text-white/15" />
          </div>
          <p className="text-3xl font-light mt-2">{totalViews}</p>
        </div>
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 uppercase tracking-wider">Avg. Watch Time</p>
            <Clock size={14} className="text-white/15" />
          </div>
          <p className="text-3xl font-light mt-2">
            {avgDuration ? formatDuration(avgDuration) : "—"}
          </p>
        </div>
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 uppercase tracking-wider">Active Links</p>
            <Film size={14} className="text-white/15" />
          </div>
          <p className="text-3xl font-light mt-2">{screeningLinks.length}</p>
        </div>
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 uppercase tracking-wider">Desktop / Mobile</p>
            <Monitor size={14} className="text-white/15" />
          </div>
          <p className="text-3xl font-light mt-2">
            {deviceBreakdown["desktop"] || 0} / {deviceBreakdown["mobile"] || 0}
          </p>
        </div>
      </div>

      {/* Recent views feed */}
      <div className="mt-10">
        <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
          View Feed
        </h2>

        {recentViews.length > 0 ? (
          <div className="space-y-1">
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      {view.device === "mobile" ? (
                        <Smartphone size={12} className="text-white/25" />
                      ) : view.device === "tablet" ? (
                        <Tablet size={12} className="text-white/25" />
                      ) : (
                        <Monitor size={12} className="text-white/25" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        <span className="text-white/70">
                          {view.screeningLink.recipientName || "Anonymous"}
                        </span>
                        <span className="text-white/20"> viewed </span>
                        <span className="text-white/50">
                          {view.screeningLink.reel.director.name}&apos;s{" "}
                          {view.screeningLink.reel.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {view.totalDuration && (
                          <span className="text-[10px] text-white/25">
                            Watched {formatDuration(view.totalDuration)}
                          </span>
                        )}
                        {avgSpotCompletion !== null && (
                          <span className="text-[10px] text-white/25">
                            {avgSpotCompletion}% avg completion
                          </span>
                        )}
                        {view.viewerCity && (
                          <span className="text-[10px] text-white/25">
                            {view.viewerCity}
                            {view.viewerCountry ? `, ${view.viewerCountry}` : ""}
                          </span>
                        )}
                        {view.isForwarded && (
                          <span className="text-[10px] text-amber-400/60">
                            Forwarded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/20 flex-shrink-0 ml-4">
                    {timeAgo(view.startedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-sm text-white/25">
              No views recorded yet. Send a reel to start tracking engagement.
            </p>
          </div>
        )}
      </div>

      {/* Active Screening Links */}
      <div className="mt-10">
        <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
          Active Screening Links
        </h2>

        {screeningLinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {screeningLinks.map((link) => (
              <Link
                key={link.id}
                href={`/reels/${link.reel.id}`}
                className="p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {link.recipientName || link.recipientEmail || "Untitled"}
                    </p>
                    <p className="text-xs text-white/25 truncate mt-0.5">
                      {link.reel.director.name} — {link.reel.title}
                    </p>
                  </div>
                  <span className="text-xs text-white/30 flex items-center gap-1 flex-shrink-0 ml-2">
                    <Eye size={10} />
                    {link._count.views}
                  </span>
                </div>
                {link.recipientCompany && (
                  <p className="text-[10px] text-white/20 mt-1">{link.recipientCompany}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-sm text-white/25">
              No active screening links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
