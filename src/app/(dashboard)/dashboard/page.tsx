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
      take: 500,
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
      <div className="flex items-start justify-between mb-8 md:mb-14 gap-4">
        <div className="min-w-0">
          <h1 className="text-[42px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
            Dashboard
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#aaa]">
            {session.user.name || session.user.email}
            <span className="mx-2 text-[#ddd]">/</span>
            {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <MyActivityToggle />
          <Link
            href="/reels/build"
            className="group flex items-center gap-2 md:gap-2.5 px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-[#C45A2D] text-white hover:bg-[#A84B24] shadow-[0_2px_12px_rgba(196,90,45,0.3)] hover:shadow-[0_4px_20px_rgba(196,90,45,0.4)] transition-all duration-300"
          >
            <span className="text-[12px] md:text-[13px] font-semibold tracking-wide">
              Build Reel
            </span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>

      {/* Unified Stats Card — weekly metrics | roster counts */}
      <div className="data-card px-5 md:px-10 py-6 md:py-9 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0">
          {/* Weekly pulse — left group */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#aaa] font-medium mb-4">
              This Week
            </p>
            <div className="flex items-end gap-6 md:gap-10 flex-wrap">
              <div>
                <p className="text-[28px] md:text-[32px] font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A] leading-none">
                  {weeklyViewCount}
                </p>
                <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb]">
                  Views
                </p>
              </div>
              <div>
                <p className="text-[28px] md:text-[32px] font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A] leading-none">
                  {weeklyTotalSeconds > 0
                    ? formatDuration(weeklyTotalSeconds)
                    : "\u2014"}
                </p>
                <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb]">
                  Watch Time
                </p>
              </div>
              <div>
                <p className="text-[28px] md:text-[32px] font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A] leading-none">
                  {weeklyNewReels}
                </p>
                <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb]">
                  New Reels
                </p>
              </div>
            </div>
            {weeklyBestReel && (
              <p className="mt-4 text-[11px] text-[#bbb]">
                <span className="text-[#999] font-medium">{weeklyBestReel.director}</span>
                {" "}leading with {weeklyBestReel.count} view{weeklyBestReel.count !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Divider — horizontal on mobile, vertical on desktop */}
          <div className="h-px md:h-auto md:w-px bg-[#E8E7E3]/40 md:mx-10 flex-shrink-0" />

          {/* Roster counts — right group */}
          <div className="flex-shrink-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#aaa] font-medium mb-4">
              Roster
            </p>
            <div className="flex items-end gap-6 md:gap-8 flex-wrap">
              {rosterStats.map((stat) => (
                <Link key={stat.label} href={stat.href} className="group">
                  <p className="text-[28px] md:text-[32px] font-extralight tracking-tight-3 tabular-nums text-[#1A1A1A] group-hover:text-[#666] transition-colors leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#bbb] group-hover:text-[#999] transition-colors">
                    {stat.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hot Right Now — compact inline */}
      {hotRightNow.length > 0 && (
        <div className="data-card px-5 md:px-10 py-5 mb-8 md:mb-12">
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

      {/* Signal — full-width, compact 3-column pills */}
      <div className="data-card p-5 md:p-9 mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#777] font-medium">
            Signal
          </h2>
          <ComposeUpdate />
        </div>

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
          compact
        />
      </div>

      {/* Two-column layout — 58/42 split */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
        {/* LEFT COLUMN — Activity */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 md:gap-10 lg:basis-[58%]">
          {/* Recent Views — grouped, no dividers */}
          <div className="data-card p-5 md:p-9">
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
          <div className="data-card p-5 md:p-9">
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

        {/* RIGHT COLUMN — Directors + Leaderboard */}
        <div className="lg:basis-[38%] lg:flex-shrink-0">
          <div className="flex flex-col gap-6 md:gap-10">
            {/* Director Scorecards */}
            {scorecards.length > 0 && (
              <div className="data-card p-5 md:p-9">
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

                <div className="space-y-3">
                  {scorecards.map((d, i) => (
                    <Link
                      key={d.id}
                      href={`/directors/${d.id}`}
                      className="group flex items-center gap-3 rounded-xl bg-[#F7F6F3]/50 px-4 py-3 hover:bg-[#F0F0EC]/50 transition-all duration-300"
                    >
                      <div className="relative flex-shrink-0">
                        {d.headshotUrl ? (
                          <img
                            src={d.headshotUrl}
                            alt={d.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-medium text-[#999]">
                            {d.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        )}
                        {i === 0 && d.totalViews > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                            <Trophy size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1A1A1A] group-hover:text-black transition-colors">
                          {d.name}
                        </p>
                        <p className="text-[10px] text-[#bbb] mt-0.5">
                          {d.spotCount} spots &middot; {d.reelCount} reel{d.reelCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#aaa] tabular-nums flex items-center gap-1 flex-shrink-0">
                        <Eye size={8} />
                        {d.totalViews}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reel Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="data-card p-5 md:p-9">
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
          </div>
        </div>
      </div>
    </div>
  );
}
