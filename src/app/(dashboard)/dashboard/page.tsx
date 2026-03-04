import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { timeAgo, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Flame, Trophy, Eye, TrendingUp, Zap } from "lucide-react";
import { ComposeUpdate } from "@/components/dashboard/compose-update";
import { SignalFeed } from "@/components/dashboard/signal-feed";
import { MyActivityToggle } from "@/components/dashboard/my-activity-toggle";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { mine?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;
  const showMine = searchParams.mine === "true";

  // When "My Activity" is active, filter everything by current user's reels
  const reelOwnerFilter =
    !isAdmin || showMine ? { createdById: userId } : {};
  const viewOwnerFilter =
    !isAdmin || showMine
      ? { screeningLink: { reel: { createdById: userId } } }
      : {};

  // Weekly digest: start of current week (Monday)
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  // Hot Right Now: views in last 30 minutes
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const [
    directorCount,
    projectCount,
    reelCount,
    linkCount,
    recentViews,
    updates,
    industryFeed,
    // Weekly digest
    weeklyViewCount,
    weeklyWatchTime,
    weeklyNewReels,
    // Hot Right Now
    hotRightNow,
    // Reel Leaderboard
    reelsForLeaderboard,
    // Director Scorecards
    directorsForCards,
  ] = await Promise.all([
    isAdmin && !showMine
      ? prisma.director.count({ where: { isActive: true } })
      : 0,
    isAdmin && !showMine ? prisma.project.count() : 0,
    prisma.reel.count({ where: reelOwnerFilter }),
    prisma.screeningLink.count({
      where: { isActive: true, reel: reelOwnerFilter },
    }),
    // Recent views (with sent-by info)
    prisma.reelView.findMany({
      take: 8,
      orderBy: { startedAt: "desc" },
      where: viewOwnerFilter,
      include: {
        screeningLink: {
          include: {
            reel: {
              include: {
                director: { select: { name: true } },
                createdBy: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.update.findMany({
      where: { type: { not: "REEL_VIEWED" } },
      take: 30,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        director: { select: { id: true, name: true } },
        project: { select: { id: true, title: true, brand: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.industryCredit.findMany({
      take: 25,
      where: { isHidden: false },
      orderBy: { createdAt: "desc" },
    }),
    // Weekly view count
    prisma.reelView.count({
      where: { startedAt: { gte: startOfWeek }, ...viewOwnerFilter },
    }),
    // Weekly watch time (aggregate sum)
    prisma.reelView.aggregate({
      where: {
        startedAt: { gte: startOfWeek },
        totalDuration: { not: null },
        ...viewOwnerFilter,
      },
      _sum: { totalDuration: true },
    }),
    // New reels this week
    prisma.reel.count({
      where: { createdAt: { gte: startOfWeek }, ...reelOwnerFilter },
    }),
    // Hot Right Now — views in last 30 min
    prisma.reelView.findMany({
      where: { startedAt: { gte: thirtyMinAgo }, ...viewOwnerFilter },
      orderBy: { startedAt: "desc" },
      take: 10,
      include: {
        screeningLink: {
          include: {
            reel: {
              include: {
                director: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    // Reels for leaderboard — with screening link view counts
    prisma.reel.findMany({
      where: {
        ...reelOwnerFilter,
        screeningLinks: { some: { views: { some: {} } } },
      },
      include: {
        director: { select: { name: true } },
        createdBy: { select: { name: true } },
        screeningLinks: {
          include: {
            _count: { select: { views: true } },
          },
        },
      },
      take: 50,
    }),
    // Directors for scorecards
    prisma.director.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        headshotUrl: true,
        _count: { select: { projects: true, reels: true } },
        reels: {
          select: {
            screeningLinks: {
              select: {
                _count: { select: { views: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  // Compute weekly best reel
  const weeklyBestReel = await (async () => {
    const weeklyViews = await prisma.reelView.findMany({
      where: { startedAt: { gte: startOfWeek }, ...viewOwnerFilter },
      select: {
        screeningLink: {
          select: {
            reelId: true,
            reel: {
              select: {
                title: true,
                director: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const countByReel: Record<
      string,
      { count: number; title: string; director: string }
    > = {};
    for (const v of weeklyViews) {
      const rid = v.screeningLink.reelId;
      if (!countByReel[rid]) {
        countByReel[rid] = {
          count: 0,
          title: v.screeningLink.reel.title,
          director: v.screeningLink.reel.director.name,
        };
      }
      countByReel[rid].count++;
    }

    let best: { count: number; title: string; director: string } | null = null;
    for (const key of Object.keys(countByReel)) {
      if (!best || countByReel[key].count > best.count) {
        best = countByReel[key];
      }
    }
    return best;
  })();

  // Compute reel leaderboard
  const leaderboard = reelsForLeaderboard
    .map((reel) => ({
      id: reel.id,
      title: reel.title,
      directorName: reel.director.name,
      sentBy: reel.createdBy?.name || null,
      totalViews: reel.screeningLinks.reduce(
        (sum, link) => sum + link._count.views,
        0
      ),
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 8);

  // Compute director scorecards
  const scorecards = directorsForCards
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      headshotUrl: d.headshotUrl,
      spotCount: d._count.projects,
      reelCount: d._count.reels,
      totalViews: d.reels.reduce(
        (sum, reel) =>
          sum +
          reel.screeningLinks.reduce(
            (s, link) => s + link._count.views,
            0
          ),
        0
      ),
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 6);

  const weeklyTotalSeconds = weeklyWatchTime._sum.totalDuration || 0;

  const stats =
    isAdmin && !showMine
      ? [
          { label: "Directors", value: directorCount, href: "/directors" },
          { label: "Spots", value: projectCount, href: "/directors" },
          { label: "Reels", value: reelCount, href: "/reels" },
          { label: "Active Links", value: linkCount, href: "/analytics" },
        ]
      : [
          { label: "Your Reels", value: reelCount, href: "/reels" },
          { label: "Active Links", value: linkCount, href: "/analytics" },
        ];

  const roleLabel = isAdmin ? "Producer" : "Sales Rep";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-[#999]">
            {session.user.name || session.user.email}
            <span className="mx-2 text-[#E0E0E0]">/</span>
            {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MyActivityToggle />
          <Link
            href="/reels/build"
            className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#333] transition-all duration-300 shadow-sm"
          >
            <span className="text-[13px] font-medium tracking-wide">
              Build Reel
            </span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>

      {/* Weekly Digest Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1A1A1A] to-[#333] text-white p-8 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.15),0_12px_32px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={12} className="text-amber-400" />
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-white/60 font-medium">
            This Week
          </h2>
        </div>
        <div className="flex items-end gap-12">
          <div>
            <p className="text-4xl font-light tracking-tight-3 tabular-nums">
              {weeklyViewCount}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
              Views
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 tabular-nums">
              {weeklyTotalSeconds > 0
                ? formatDuration(weeklyTotalSeconds)
                : "\u2014"}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
              Watch Time
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 tabular-nums">
              {weeklyNewReels}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
              New Reels
            </p>
          </div>
          {weeklyBestReel && (
            <div className="ml-auto text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 mb-1">
                Top Reel
              </p>
              <p className="text-[14px] font-medium text-white/90">
                {weeklyBestReel.director}
              </p>
              <p className="text-[11px] text-white/40">
                {weeklyBestReel.title} &middot; {weeklyBestReel.count} view
                {weeklyBestReel.count !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats row — card container */}
      <div className="data-card p-7 mb-6">
        <div className="flex gap-14">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="group">
              <p className="text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A] group-hover:text-[#666] transition-colors">
                {stat.value}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999] group-hover:text-[#666] transition-colors">
                {stat.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot Right Now */}
      {hotRightNow.length > 0 && (
        <div className="data-card !border-amber-200/50 p-7 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <h2 className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-medium">
              Hot Right Now
            </h2>
            <span className="text-[10px] text-amber-500/60 ml-1">
              {hotRightNow.length} active viewer
              {hotRightNow.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {hotRightNow.map((view) => (
              <Link
                key={view.id}
                href={`/analytics/link/${view.screeningLink.id}`}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50/80 border border-amber-100 hover:border-amber-200 transition-all"
              >
                <Flame size={12} className="text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12px] text-[#1A1A1A] truncate font-medium group-hover:text-black transition-colors">
                    {view.screeningLink.recipientName ||
                      view.viewerName ||
                      "Anonymous"}
                  </p>
                  <p className="text-[10px] text-[#999] truncate">
                    {view.screeningLink.reel.director.name} &middot;{" "}
                    {timeAgo(view.startedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* LEFT COLUMN */}
        <div
          className="flex-1 min-w-0 flex flex-col gap-6"
          style={{ flexBasis: "62%" }}
        >
          {/* Recent Views — with Sent By attribution */}
          <div className="data-card p-7">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
                Recent Views
              </h2>
              <Link
                href="/analytics"
                className="text-[10px] uppercase tracking-[0.15em] text-[#ccc] hover:text-[#999] transition-colors"
              >
                All
              </Link>
            </div>

            {recentViews.length > 0 ? (
              <div>
                {recentViews.map((view, i) => (
                  <Link
                    key={view.id}
                    href={`/analytics/link/${view.screeningLink.id}`}
                    className={`flex items-center justify-between py-3 group ${
                      i < recentViews.length - 1
                        ? "border-b border-[#F0F0EC]"
                        : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#1A1A1A] truncate">
                        <span className="font-medium group-hover:text-black transition-colors">
                          {view.screeningLink.recipientName || "Anonymous"}
                        </span>
                        <span className="text-[#999]"> viewed </span>
                        <span className="font-medium">
                          {view.screeningLink.reel.director.name}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-[#ccc] truncate">
                          {view.screeningLink.recipientCompany ||
                            view.screeningLink.recipientEmail ||
                            "\u2014"}
                        </p>
                        {view.screeningLink.reel.createdBy && (
                          <span className="text-[10px] text-[#bbb] flex-shrink-0">
                            sent by{" "}
                            {view.screeningLink.reel.createdBy.name ||
                              "Unknown"}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#ccc] flex-shrink-0 ml-6">
                      {timeAgo(view.startedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#999] py-6">
                No views yet.{" "}
                {isAdmin
                  ? "Create and send a reel to start tracking."
                  : "Send a screening link to start tracking views."}
              </p>
            )}
          </div>

          {/* Director Scorecards */}
          {scorecards.length > 0 && (
            <div className="data-card p-7">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
                  Director Scorecards
                </h2>
                <Link
                  href="/directors"
                  className="text-[10px] uppercase tracking-[0.15em] text-[#ccc] hover:text-[#999] transition-colors"
                >
                  All
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {scorecards.map((d, i) => (
                  <Link
                    key={d.id}
                    href={`/directors/${d.slug}`}
                    className="group relative rounded-xl border border-[#E8E7E3]/40 bg-white/40 p-4 hover:border-[#ccc] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
                  >
                    {i === 0 && d.totalViews > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                        <Trophy size={10} className="text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      {d.headshotUrl ? (
                        <img
                          src={d.headshotUrl}
                          alt={d.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#F0F0EC] flex items-center justify-center text-[11px] font-medium text-[#999]">
                          {d.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <p className="text-[13px] font-medium text-[#1A1A1A] truncate group-hover:text-black transition-colors">
                        {d.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-[#999]">
                      <span className="flex items-center gap-1">
                        <Eye size={9} />
                        {d.totalViews}
                      </span>
                      <span>{d.spotCount} spots</span>
                      <span>{d.reelCount} reels</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Industry Pulse — scrollable card container */}
          <div className="data-card p-7">
            <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
              Industry Pulse
            </h2>

            {industryFeed.length > 0 ? (
              <div className="max-h-[420px] overflow-y-auto pr-2">
                {industryFeed.map((credit, i) => (
                  <div
                    key={credit.id}
                    className={`py-3 ${
                      i < industryFeed.length - 1
                        ? "border-b border-[#F0F0EC]"
                        : ""
                    }`}
                  >
                    <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                      {[
                        credit.brand,
                        credit.campaignName,
                        credit.agency,
                        credit.productionCompany,
                        credit.directorName,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {credit.territory && (
                        <span className="text-[9px] font-medium text-[#bbb] uppercase tracking-[0.12em]">
                          {credit.territory}
                        </span>
                      )}
                      {(credit.category || credit.sourceName) && (
                        <span className="text-[10px] text-[#ccc]">
                          {credit.category && (
                            <span className="uppercase tracking-wider">
                              {credit.category}
                            </span>
                          )}
                          {credit.category && credit.sourceName && (
                            <span className="mx-1">&middot;</span>
                          )}
                          {credit.sourceName && (
                            <span className="tracking-wider">
                              via {credit.sourceName}
                            </span>
                          )}
                        </span>
                      )}
                      <span className="text-[10px] text-[#ccc] uppercase tracking-[0.1em] ml-auto flex-shrink-0">
                        {timeAgo(credit.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#999] py-6">
                Industry feed populates nightly. Check back tomorrow.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-shrink-0" style={{ flexBasis: "35%" }}>
          <div className="flex flex-col gap-6">
            {/* Reel Performance Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="data-card p-7">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={12} className="text-[#999]" />
                  <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
                    Reel Leaderboard
                  </h2>
                </div>

                <div>
                  {leaderboard.map((reel, i) => (
                    <Link
                      key={reel.id}
                      href={`/reels/${reel.id}`}
                      className={`flex items-center gap-3 py-2.5 group ${
                        i < leaderboard.length - 1
                          ? "border-b border-[#F0F0EC]"
                          : ""
                      }`}
                    >
                      <span
                        className={`text-[11px] w-5 text-right tabular-nums flex-shrink-0 font-medium ${
                          i === 0
                            ? "text-amber-500"
                            : i === 1
                              ? "text-[#999]"
                              : i === 2
                                ? "text-amber-700/50"
                                : "text-[#ccc]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#1A1A1A] truncate group-hover:text-black transition-colors font-medium">
                          {reel.directorName}
                        </p>
                        <p className="text-[10px] text-[#999] truncate">
                          {reel.title}
                          {reel.sentBy && (
                            <span className="text-[#ccc]">
                              {" "}
                              &middot; sent by {reel.sentBy}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#999] tabular-nums flex items-center gap-1 flex-shrink-0">
                        <Eye size={9} />
                        {reel.totalViews}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Signal — card container */}
            <div className="data-card p-7 sticky top-8">
              <h2 className="text-lg font-medium tracking-tight-2 text-[#1A1A1A] mb-6">
                Signal
              </h2>

              {/* Compose */}
              <ComposeUpdate />

              {/* Updates feed — client component with edit/delete */}
              <SignalFeed
                updates={updates.map((u) => ({
                  ...u,
                  createdAt: u.createdAt.toISOString(),
                  body: u.body || null,
                  director: u.director,
                  project: u.project
                    ? { ...u.project, brand: u.project.brand || null }
                    : null,
                  author: u.author
                    ? {
                        ...u.author,
                        name: u.author.name || null,
                        email: u.author.email || "",
                      }
                    : null,
                }))}
                currentUserId={userId}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
