import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import { Eye, TrendingUp, TrendingDown, Minus, BarChart3, Film, ArrowLeft } from "lucide-react";

export default async function MyStatsPage({
  searchParams,
}: {
  searchParams: { preview?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isPreview = session.user.role === "ADMIN" && searchParams.preview;
  const directorId = isPreview ? searchParams.preview! : session.user.directorId;

  if (!isPreview && session.user.role !== "DIRECTOR") redirect("/dashboard");

  if (!directorId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[13px] text-[#666]">Your account isn&apos;t linked to a director profile yet.</p>
        <p className="text-[12px] text-[#999] mt-1">Contact your rep to get set up.</p>
      </div>
    );
  }

  const director = await prisma.director.findUnique({
    where: { id: directorId },
    select: { name: true },
  });

  if (!director) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[13px] text-[#666]">Director profile not found.</p>
      </div>
    );
  }

  // Time ranges
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Common filter: views linked to this director's reels
  const directorReelFilter = {
    screeningLink: { reel: { directorId } },
  };

  const [
    // This week
    weeklyViews,
    weeklyWatchTime,
    // Previous week (for comparison)
    prevWeekViews,
    // Last 30 days
    monthlyViews,
    // All projects for this director
    projects,
    // Reels for this director
    reels,
    // Per-spot view data
    spotViewData,
  ] = await Promise.all([
    // This week view count
    prisma.reelView.count({
      where: { startedAt: { gte: startOfWeek }, ...directorReelFilter },
    }),
    // This week watch time
    prisma.reelView.aggregate({
      where: { startedAt: { gte: startOfWeek }, totalDuration: { not: null }, ...directorReelFilter },
      _sum: { totalDuration: true },
    }),
    // Previous week view count
    prisma.reelView.count({
      where: { startedAt: { gte: startOfPrevWeek, lt: startOfWeek }, ...directorReelFilter },
    }),
    // Monthly view count
    prisma.reelView.count({
      where: { startedAt: { gte: thirtyDaysAgo }, ...directorReelFilter },
    }),
    // Director's projects
    prisma.project.findMany({
      where: { directorId },
      select: { id: true, title: true, brand: true },
      orderBy: { brand: "asc" },
    }),
    // Director's reels with view counts
    prisma.reel.findMany({
      where: { directorId },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        screeningLinks: {
          select: {
            views: {
              where: { startedAt: { gte: thirtyDaysAgo } },
              select: { id: true, startedAt: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    // Spot-level view data (all time)
    prisma.spotView.findMany({
      where: {
        projectId: { in: (await prisma.project.findMany({ where: { directorId }, select: { id: true } })).map((p) => p.id) },
      },
      select: {
        projectId: true,
        percentWatched: true,
        rewatched: true,
      },
    }),
  ]);

  // Calculate week-over-week change
  const weeklyChange = prevWeekViews > 0
    ? Math.round(((weeklyViews - prevWeekViews) / prevWeekViews) * 100)
    : weeklyViews > 0 ? 100 : 0;

  const weeklyWatchSeconds = weeklyWatchTime._sum.totalDuration || 0;

  // Aggregate spot-level stats
  const spotStats = projects.map((project) => {
    const views = spotViewData.filter((sv) => sv.projectId === project.id);
    const totalViews = views.length;
    const avgCompletion = views.length > 0
      ? Math.round(views.reduce((sum, sv) => sum + (sv.percentWatched || 0), 0) / views.length)
      : 0;
    const rewatchCount = views.filter((sv) => sv.rewatched).length;

    return {
      id: project.id,
      title: project.title,
      brand: project.brand,
      totalViews,
      avgCompletion,
      rewatchCount,
    };
  }).sort((a, b) => b.totalViews - a.totalViews);

  // Aggregate reel-level stats
  const reelStats = reels.map((reel) => {
    const monthlyViewCount = reel.screeningLinks.reduce(
      (sum, link) => sum + link.views.length, 0
    );
    const lastViewed = reel.screeningLinks
      .flatMap((link) => link.views)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
      ?.startedAt;

    return {
      id: reel.id,
      title: reel.title,
      monthlyViewCount,
      lastViewed: lastViewed || null,
    };
  }).sort((a, b) => b.monthlyViewCount - a.monthlyViewCount);

  const previewParam = isPreview ? `?preview=${directorId}` : "";

  return (
    <div>
      {/* Admin preview banner */}
      {isPreview && (
        <div className="mb-6 flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-[3px]">
          <Eye size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-[12px] text-amber-700 flex-1">
            Viewing as <span className="font-medium">{director.name}</span>
          </p>
          <Link
            href={`/directors/${directorId}`}
            className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-800 transition-colors font-medium"
          >
            <ArrowLeft size={11} />
            Back to Admin
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 md:mb-14">
        <h1 className="text-[42px] md:text-[56px] font-extralight tracking-tight text-[#1A1A1A] leading-[1.05]">
          My Stats
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#aaa]">
          {director.name}
          <span className="mx-2 text-[#ddd]">/</span>
          Engagement Overview
        </p>
        {isPreview && (
          <div className="mt-5 flex items-center gap-4">
            <Link href={`/portfolio${previewParam}`} className="text-[11px] text-[#999] hover:text-[#666] transition-colors">
              Portfolio
            </Link>
            <Link href={`/my-reels${previewParam}`} className="text-[11px] text-[#999] hover:text-[#666] transition-colors">
              My Reels
            </Link>
            <span className="text-[11px] font-medium text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5">My Stats</span>
          </div>
        )}
      </div>

      {/* Your Week summary card */}
      <div className="data-card px-5 md:px-10 py-6 md:py-9 mb-8 md:mb-12">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#aaa] font-medium mb-4">
          Your Week
        </p>
        <div className="flex items-end gap-6 md:gap-10 flex-wrap">
          <div>
            <div className="flex items-end gap-2">
              <p className="text-[28px] md:text-[32px] font-extralight tracking-tight tabular-nums text-[#1A1A1A] leading-none">
                {weeklyViews}
              </p>
              {weeklyChange !== 0 && (
                <span className={`flex items-center gap-0.5 text-[11px] font-medium ${weeklyChange > 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {weeklyChange > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {weeklyChange > 0 ? "+" : ""}{weeklyChange}%
                </span>
              )}
              {weeklyChange === 0 && prevWeekViews > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] text-[#bbb]">
                  <Minus size={11} /> Same
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb]">Views</p>
          </div>
          <div>
            <p className="text-[28px] md:text-[32px] font-extralight tracking-tight tabular-nums text-[#1A1A1A] leading-none">
              {weeklyWatchSeconds > 0 ? formatDuration(weeklyWatchSeconds) : "\u2014"}
            </p>
            <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb]">Watch Time</p>
          </div>
          <div>
            <p className="text-[28px] md:text-[32px] font-extralight tracking-tight tabular-nums text-[#1A1A1A] leading-none">
              {monthlyViews}
            </p>
            <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb]">Last 30 Days</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
        {/* Spot Engagement */}
        <div className="flex-1 min-w-0">
          <div className="data-card p-5 md:p-9">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={11} className="text-[#aaa]" />
              <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium">
                Spot Engagement
              </h2>
            </div>

            {spotStats.length === 0 ? (
              <p className="text-[13px] text-[#aaa] py-8 text-center">
                No engagement data yet.
              </p>
            ) : (
              <div className="space-y-3">
                {spotStats.filter((s) => s.totalViews > 0).map((spot) => (
                  <div key={spot.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      {spot.brand && (
                        <p className="text-[12px] font-medium text-[#1A1A1A] truncate">{spot.brand}</p>
                      )}
                      <p className={`text-[11px] text-[#999] truncate ${spot.brand ? "" : "text-[12px] font-medium text-[#1A1A1A]"}`}>
                        {spot.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[12px] tabular-nums text-[#1A1A1A] font-medium flex items-center gap-1 justify-end">
                          <Eye size={10} className="text-[#bbb]" />
                          {spot.totalViews}
                        </p>
                      </div>
                      <div className="text-right w-12">
                        <p className="text-[11px] tabular-nums text-[#999]">
                          {spot.avgCompletion}%
                        </p>
                        <div className="w-full h-[3px] bg-[#F0F0EC] rounded-full mt-0.5">
                          <div
                            className="h-full bg-emerald-400/60 rounded-full"
                            style={{ width: `${spot.avgCompletion}%` }}
                          />
                        </div>
                      </div>
                      {spot.rewatchCount > 0 && (
                        <span className="text-[10px] text-[#bbb] tabular-nums w-8 text-right">
                          {spot.rewatchCount}x
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {spotStats.every((s) => s.totalViews === 0) && (
                  <p className="text-[13px] text-[#aaa] py-8 text-center">
                    No spot views recorded yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reel Activity */}
        <div className="lg:basis-[38%] lg:flex-shrink-0">
          <div className="data-card p-5 md:p-9">
            <div className="flex items-center gap-2 mb-6">
              <Film size={11} className="text-[#aaa]" />
              <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium">
                Reel Activity
              </h2>
              <span className="text-[9px] text-[#ccc] uppercase tracking-wider ml-auto">Last 30 days</span>
            </div>

            {reelStats.length === 0 ? (
              <p className="text-[13px] text-[#aaa] py-8 text-center">
                No reels yet.
              </p>
            ) : (
              <div className="space-y-4">
                {reelStats.map((reel) => (
                  <a
                    key={reel.id}
                    href={`/my-reels/${reel.id}${previewParam}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#1A1A1A] font-medium truncate group-hover:text-black transition-colors">
                        {reel.title}
                      </p>
                      {reel.lastViewed && (
                        <p className="text-[10px] text-[#ccc] mt-0.5">
                          Last viewed{" "}
                          {new Date(reel.lastViewed).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-[#aaa] tabular-nums flex items-center gap-1 flex-shrink-0">
                      <Eye size={9} />
                      {reel.monthlyViewCount}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
