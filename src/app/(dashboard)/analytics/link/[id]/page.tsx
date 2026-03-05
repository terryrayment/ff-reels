import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Smartphone, Monitor, Tablet, MapPin, RotateCcw, SkipForward, Share2 } from "lucide-react";
import { timeAgo, formatDuration } from "@/lib/utils";

export default async function LinkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const link = await prisma.screeningLink.findUnique({
    where: { id: params.id },
    include: {
      reel: {
        include: {
          director: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          items: {
            include: { project: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      views: {
        orderBy: { startedAt: "desc" },
        include: {
          spotViews: true,
        },
      },
    },
  });

  if (!link) return notFound();

  // REP users can only see their own reels
  if (
    session.user.role === "REP" &&
    link.reel.createdBy?.id !== session.user.id
  ) {
    return notFound();
  }

  // Aggregate spot engagement across all views
  const spotEngagement = link.reel.items.map((item) => {
    const allSpotViews = link.views.flatMap((v) =>
      v.spotViews.filter((sv) => sv.projectId === item.project.id)
    );

    const totalViews = allSpotViews.length;
    const avgPercent =
      totalViews > 0
        ? Math.round(
            allSpotViews.reduce((s, sv) => s + (sv.percentWatched || 0), 0) /
              totalViews
          )
        : 0;
    const rewatchCount = allSpotViews.filter((sv) => sv.rewatched).length;
    const skipCount = allSpotViews.filter((sv) => sv.skipped).length;

    return {
      project: item.project,
      sortOrder: item.sortOrder,
      totalViews,
      avgPercent,
      rewatchCount,
      skipCount,
    };
  });

  // Group views by date for return visit detection
  const viewsByDate = new Map<string, typeof link.views>();
  link.views.forEach((v) => {
    const date = v.startedAt.toISOString().split("T")[0];
    if (!viewsByDate.has(date)) viewsByDate.set(date, []);
    viewsByDate.get(date)!.push(v);
  });

  const totalViewCount = link.views.length;
  const uniqueDays = viewsByDate.size;
  const isReturnVisitor = uniqueDays >= 2;
  const hasForwarded = link.views.some((v) => v.isForwarded);

  const viewsWithDuration = link.views.filter((v) => v.totalDuration);
  const avgDuration =
    viewsWithDuration.length > 0
      ? viewsWithDuration.reduce((s, v) => s + (v.totalDuration || 0), 0) / viewsWithDuration.length
      : 0;

  // Status
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const status = isExpired ? "Expired" : !link.isActive ? "Disabled" : "Active";
  const statusColor = status === "Active" ? "text-emerald-500" : "text-red-400";

  return (
    <div>
      {/* Back */}
      <Link
        href="/analytics"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] hover:text-[#1A1A1A] transition-colors mb-8 block"
      >
        <ArrowLeft size={11} />
        Analytics
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
            {link.recipientName || link.recipientEmail || "Anonymous Viewer"}
          </h1>
          <span className={`text-[10px] uppercase tracking-wider ${statusColor}`}>
            {status}
          </span>
        </div>
        <p className="text-[12px] text-[#999]">
          {link.recipientCompany && (
            <span>{link.recipientCompany} · </span>
          )}
          {link.reel.director.name} — {link.reel.title}
          <span className="mx-2 text-[#ddd]">/</span>
          Sent {timeAgo(link.createdAt)}
        </p>
      </div>

      {/* Engagement summary stats */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <div className="flex gap-14">
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A]">
              {totalViewCount}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Total Views
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A]">
              {avgDuration > 0 ? formatDuration(avgDuration) : "\u2014"}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Avg. Watch Time
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A]">
              {uniqueDays}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              {uniqueDays === 1 ? "Day" : "Days"} Viewed
            </p>
          </div>
          {isReturnVisitor && (
            <div className="flex items-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                Return Visitor
              </span>
            </div>
          )}
          {hasForwarded && (
            <div className="flex items-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Share2 size={9} />
                Forwarded
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Per-Spot Heatmap */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          Spot Engagement
        </h2>

        <div className="space-y-4">
          {spotEngagement.map((spot, i) => (
            <div key={spot.project.id} className="flex items-center gap-4">
              {/* Index */}
              <span className="text-[11px] text-[#ccc] w-4 text-right tabular-nums flex-shrink-0">
                {i + 1}
              </span>

              {/* Spot info */}
              <div className="w-40 flex-shrink-0 min-w-0">
                <p className="text-[12px] text-[#1A1A1A] truncate">
                  {spot.project.title}
                </p>
                <p className="text-[10px] text-[#999] truncate">
                  {spot.project.brand || "\u2014"}
                </p>
              </div>

              {/* Completion bar */}
              <div className="flex-1 min-w-0">
                <div className="h-5 bg-[#F5F5F0] rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${spot.avgPercent}%`,
                      backgroundColor:
                        spot.avgPercent >= 80
                          ? "#10b981"
                          : spot.avgPercent >= 50
                          ? "#f59e0b"
                          : spot.avgPercent >= 25
                          ? "#f97316"
                          : "#ef4444",
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[#666] mix-blend-multiply">
                    {spot.avgPercent}%
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0 w-28 justify-end">
                {spot.rewatchCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-600" title="Rewatched">
                    <RotateCcw size={9} />
                    {spot.rewatchCount}
                  </span>
                )}
                {spot.skipCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-red-400" title="Skipped">
                    <SkipForward size={9} />
                    {spot.skipCount}
                  </span>
                )}
                <span className="text-[10px] text-[#bbb] tabular-nums">
                  {spot.totalViews} play{spot.totalViews !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Timeline */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          View Timeline
        </h2>

        {link.views.length > 0 ? (
          <div className="divide-y divide-[#F0F0EC]">
            {link.views.map((view) => {
              const spotCompletions = view.spotViews
                .filter((sv) => sv.percentWatched != null)
                .map((sv) => sv.percentWatched!);
              const avgCompletion =
                spotCompletions.length > 0
                  ? Math.round(
                      spotCompletions.reduce((s, p) => s + p, 0) /
                        spotCompletions.length
                    )
                  : null;

              return (
                <div key={view.id} className="flex items-center justify-between py-3.5">
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
                      <div className="flex items-center gap-2.5">
                        {view.totalDuration != null && view.totalDuration > 0 && (
                          <span className="text-[12px] text-[#1A1A1A]">
                            Watched {formatDuration(view.totalDuration)}
                          </span>
                        )}
                        {avgCompletion !== null && (
                          <span className="text-[11px] text-[#999]">
                            {avgCompletion}% avg completion
                          </span>
                        )}
                        {view.isForwarded && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                            <Share2 size={8} />
                            Forwarded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {view.viewerCity && (
                          <span className="text-[10px] text-[#bbb] flex items-center gap-0.5">
                            <MapPin size={8} />
                            {view.viewerCity}
                            {view.viewerCountry ? `, ${view.viewerCountry}` : ""}
                          </span>
                        )}
                        <span className="text-[10px] text-[#bbb]">
                          {view.device || "desktop"}
                        </span>
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
          <p className="text-[13px] text-[#999] py-8 text-center">
            No views recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
