import { prisma } from "@/lib/db";
import { Eye, Smartphone, Monitor, Tablet } from "lucide-react";
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
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Analytics
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-[#999] mt-2">
          Viewing activity across all reels
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-12 mb-16">
        <div>
          <p className="text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
            {totalViews}
          </p>
          <p className="text-[10px] text-[#999] mt-1 uppercase tracking-wider">
            Total Views
          </p>
        </div>
        <div>
          <p className="text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
            {avgDuration ? formatDuration(avgDuration) : "\u2014"}
          </p>
          <p className="text-[10px] text-[#999] mt-1 uppercase tracking-wider">
            Avg. Watch Time
          </p>
        </div>
        <div>
          <p className="text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
            {screeningLinks.length}
          </p>
          <p className="text-[10px] text-[#999] mt-1 uppercase tracking-wider">
            Active Links
          </p>
        </div>
        <div>
          <p className="text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
            {deviceBreakdown["desktop"] || 0} / {deviceBreakdown["mobile"] || 0}
          </p>
          <p className="text-[10px] text-[#999] mt-1 uppercase tracking-wider">
            Desktop / Mobile
          </p>
        </div>
      </div>

      {/* Recent views feed */}
      <div>
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider mb-5">
          View Feed
        </h2>

        {recentViews.length > 0 ? (
          <div className="divide-y divide-[#E8E8E3]/60">
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
                  className="flex items-center justify-between py-3.5"
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
                        <span className="text-[#1A1A1A]">
                          {view.screeningLink.recipientName || "Anonymous"}
                        </span>
                        <span className="text-[#bbb]"> viewed </span>
                        <span className="text-[#666]">
                          {view.screeningLink.reel.director.name}&apos;s{" "}
                          {view.screeningLink.reel.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {view.totalDuration && (
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
                          <span className="text-[10px] text-[#bbb]">
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
                  <p className="text-[11px] text-[#ccc] flex-shrink-0 ml-6">
                    {timeAgo(view.startedAt)}
                  </p>
                </div>
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
      <div className="mt-16">
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider mb-5">
          Active Screening Links
        </h2>

        {screeningLinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {screeningLinks.map((link) => (
              <Link
                key={link.id}
                href={`/reels/${link.reel.id}`}
                className="group py-4 block"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[14px] text-[#1A1A1A] group-hover:text-black transition-colors truncate">
                      {link.recipientName || link.recipientEmail || "Untitled"}
                    </p>
                    <p className="text-[12px] text-[#999] truncate mt-0.5">
                      {link.reel.director.name} — {link.reel.title}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#bbb] flex items-center gap-1 flex-shrink-0 ml-3">
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
