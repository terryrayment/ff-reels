import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { timeAgo, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Flame, Trophy, Eye, TrendingUp } from "lucide-react";
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
      where: {
        isHidden: false,
        OR: [
          { directorName: { not: null } },
          { productionCompany: { not: null } },
        ],
      },
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

  const rosterStats =
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
  const currentUserName = session.user.name || "";

  // Group recent views by director+recipient to deduplicate
  const groupedViews: {
    key: string;
    recipientName: string;
    directorName: string;
    company: string;
    sentBy: string | null;
    count: number;
    lastSeen: Date;
    linkId: string;
  }[] = [];

  const viewGroups = new Map<string, (typeof groupedViews)[0]>();
  for (const view of recentViews) {
    const recipient =
      view.screeningLink.recipientName || view.viewerName || "Anonymous";
    const director = view.screeningLink.reel.director.name;
    const key = `${recipient}::${director}`;
    const existing = viewGroups.get(key);
    if (existing) {
      existing.count++;
      if (view.startedAt > existing.lastSeen) {
        existing.lastSeen = view.startedAt;
      }
    } else {
      const entry = {
        key,
        recipientName: recipient,
        directorName: director,
        company:
          view.screeningLink.recipientCompany ||
          view.screeningLink.recipientEmail ||
          "",
        sentBy: view.screeningLink.reel.createdBy?.name || null,
        count: 1,
        lastSeen: view.startedAt,
        linkId: view.screeningLink.id,
      };
      viewGroups.set(key, entry);
      groupedViews.push(entry);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-[32px] font-extralight tracking-tight-3 text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[#aaa]">
            {session.user.name || session.user.email}
            <span className="mx-2 text-[#E0E0E0]">/</span>
            {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MyActivityToggle />
          <Link
            href="/reels/build"
            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
          >
            <span className="text-[12px] font-medium tracking-wide">
              Build Reel
            </span>
            <ArrowRight
              size={13}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>

      {/* Unified Stats Card — weekly metrics + roster counts */}
      <div className="data-card p-8 mb-8">
        <div className="flex items-end justify-between">
          {/* Weekly pulse — left side */}
          <div className="flex items-end gap-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#aaa] mb-2">
                This Week
              </p>
              <p className="text-3xl font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A]">
                {weeklyViewCount}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#bbb]">
                Views
              </p>
            </div>
            <div>
              <p className="text-3xl font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A]">
                {weeklyTotalSeconds > 0
                  ? formatDuration(weeklyTotalSeconds)
                  : "\u2014"}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#bbb]">
                Watch Time
              </p>
            </div>
            <div>
              <p className="text-3xl font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A]">
                {weeklyNewReels}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#bbb]">
                New Reels
              </p>
            </div>
            {weeklyBestReel && (
              <div className="pl-8 ml-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#bbb] mb-1">
                  Top Reel
                </p>
                <p className="text-[13px] font-medium text-[#1A1A1A]">
                  {weeklyBestReel.director}
                </p>
                <p className="text-[11px] text-[#bbb]">
                  {weeklyBestReel.title} &middot; {weeklyBestReel.count} view
                  {weeklyBestReel.count !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Roster counts — right side, compact */}
          <div className="flex items-end gap-8">
            {rosterStats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group text-right">
                <p className="text-2xl font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A] group-hover:text-[#666] transition-colors">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#bbb] group-hover:text-[#999] transition-colors">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hot Right Now — compact inline */}
      {hotRightNow.length > 0 && (
        <div className="data-card px-8 py-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-medium">
                Live
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hotRightNow.map((view) => (
                <Link
                  key={view.id}
                  href={`/analytics/link/${view.screeningLink.id}`}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/60 hover:bg-amber-50 transition-all"
                >
                  <Flame size={10} className="text-amber-500 flex-shrink-0" />
                  <span className="text-[11px] text-[#1A1A1A] font-medium group-hover:text-black transition-colors">
                    {view.screeningLink.recipientName ||
                      view.viewerName ||
                      "Anonymous"}
                  </span>
                  <span className="text-[10px] text-[#bbb]">
                    {view.screeningLink.reel.director.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout — 58/42 split */}
      <div className="flex gap-8">
        {/* LEFT COLUMN — Activity */}
        <div
          className="flex-1 min-w-0 flex flex-col gap-8"
          style={{ flexBasis: "58%" }}
        >
          {/* Recent Views — grouped, no dividers */}
          <div className="data-card p-8">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium">
                Recent Views
              </h2>
              <Link
                href="/analytics"
                className="text-[10px] uppercase tracking-[0.15em] text-[#ccc] hover:text-[#999] transition-colors"
              >
                All
              </Link>
            </div>

            {groupedViews.length > 0 ? (
              <div className="space-y-4">
                {groupedViews.slice(0, 6).map((gv) => (
                  <Link
                    key={gv.key}
                    href={`/analytics/link/${gv.linkId}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#1A1A1A] truncate">
                        <span className="font-medium group-hover:text-black transition-colors">
                          {gv.recipientName}
                        </span>
                        <span className="text-[#aaa]"> viewed </span>
                        <span className="font-medium">
                          {gv.directorName}
                        </span>
                        {gv.count > 1 && (
                          <span className="text-[11px] text-[#bbb] ml-1.5">
                            {gv.count}x
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#ccc] truncate mt-0.5">
                        {gv.company}
                        {gv.sentBy &&
                          gv.sentBy !== currentUserName &&
                          ` · sent by ${gv.sentBy}`}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#ccc] flex-shrink-0 ml-6">
                      {timeAgo(gv.lastSeen)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#aaa] py-8 text-center">
                No views yet. Send a screening link to start tracking.
              </p>
            )}
          </div>

          {/* Industry Pulse */}
          <div className="data-card p-8">
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium mb-6">
              Industry Pulse
            </h2>

            {industryFeed.length > 0 ? (
              <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4">
                {industryFeed.map((credit) => (
                  <div key={credit.id}>
                    {credit.directorName && (
                      <p className="text-[13px] font-medium text-[#1A1A1A]">
                        {credit.directorName}
                      </p>
                    )}
                    <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">
                      {[
                        credit.productionCompany,
                        credit.brand &&
                          (credit.campaignName
                            ? `${credit.brand} \u2014 \u201C${credit.campaignName}\u201D`
                            : credit.brand),
                      ]
                        .filter(Boolean)
                        .join(" \u00B7 ")}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {credit.territory && (
                        <span className="text-[9px] font-medium text-[#bbb] uppercase tracking-[0.12em]">
                          {credit.territory}
                        </span>
                      )}
                      {credit.category && (
                        <span className="text-[9px] text-[#ccc] uppercase tracking-wider">
                          {credit.category}
                        </span>
                      )}
                      {credit.sourceName && (
                        <span className="text-[10px] text-[#ccc]">
                          via {credit.sourceName}
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
              <p className="text-[13px] text-[#aaa] py-8 text-center">
                Industry feed populates nightly. Check back tomorrow.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Directors + Leaderboard + Signal */}
        <div className="flex-shrink-0" style={{ flexBasis: "38%" }}>
          <div className="flex flex-col gap-8">
            {/* Director Scorecards — moved to right column */}
            {scorecards.length > 0 && (
              <div className="data-card p-8">
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium">
                    Directors
                  </h2>
                  <Link
                    href="/directors"
                    className="text-[10px] uppercase tracking-[0.15em] text-[#ccc] hover:text-[#999] transition-colors"
                  >
                    All
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {scorecards.map((d, i) => (
                    <Link
                      key={d.id}
                      href={`/directors/${d.slug}`}
                      className="group relative rounded-xl bg-[#F7F6F3]/60 p-4 hover:bg-[#F0F0EC]/60 transition-all duration-300"
                    >
                      {i === 0 && d.totalViews > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                          <Trophy size={10} className="text-white" />
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 mb-2">
                        {d.headshotUrl ? (
                          <img
                            src={d.headshotUrl}
                            alt={d.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-medium text-[#999]">
                            {d.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        )}
                        <p className="text-[12px] font-medium text-[#1A1A1A] truncate group-hover:text-black transition-colors">
                          {d.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-[#999]">
                        <span className="flex items-center gap-1">
                          <Eye size={8} />
                          {d.totalViews}
                        </span>
                        <span>{d.spotCount} spots</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reel Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="data-card p-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={11} className="text-[#aaa]" />
                  <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium">
                    Reel Leaderboard
                  </h2>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((reel, i) => (
                    <Link
                      key={reel.id}
                      href={`/reels/${reel.id}`}
                      className="flex items-center gap-3 group"
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
                        <p className="text-[10px] text-[#bbb] truncate">
                          {reel.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#aaa] tabular-nums flex items-center gap-1 flex-shrink-0">
                        <Eye size={9} />
                        {reel.totalViews}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Signal */}
            <div className="data-card p-8 sticky top-8">
              <h2 className="text-[15px] font-medium tracking-tight-2 text-[#1A1A1A] mb-6">
                Signal
              </h2>

              <ComposeUpdate />

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
