import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Send, Plus, ExternalLink, Eye, Flame } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function ReelsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isRep = session.user.role === "REP";

  const where = isRep ? { createdById: session.user.id } : {};

  const reels = await prisma.reel.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      director: { select: { id: true, name: true } },
      items: {
        include: {
          project: {
            select: { muxPlaybackId: true, title: true },
          },
        },
        orderBy: { sortOrder: "asc" },
        take: 5,
      },
      screeningLinks: {
        select: {
          id: true,
          token: true,
          isActive: true,
          _count: { select: { views: true } },
        },
        orderBy: { createdAt: "desc" as const },
      },
      _count: { select: { items: true, screeningLinks: true } },
    },
  });

  // Get latest view per reel for "last viewed" indicator
  // Use a simple query per-reel's screening links to avoid Neon timeout
  // on distinct + relation filter combos
  const lastViewedMap: Record<string, Date> = {};
  const screeningLinkIds = reels.flatMap((r) =>
    r.screeningLinks.map((l) => l.id),
  );
  if (screeningLinkIds.length > 0) {
    const recentViews = await prisma.reelView.findMany({
      where: { screeningLinkId: { in: screeningLinkIds } },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true, screeningLinkId: true },
      take: 500,
    });

    // Build screeningLinkId → reelId lookup
    const linkToReel: Record<string, string> = {};
    for (const reel of reels) {
      for (const link of reel.screeningLinks) {
        linkToReel[link.id] = reel.id;
      }
    }

    for (const v of recentViews) {
      const rid = linkToReel[v.screeningLinkId];
      if (rid && (!lastViewedMap[rid] || v.startedAt > lastViewedMap[rid])) {
        lastViewedMap[rid] = v.startedAt;
      }
    }
  }

  // Compute per-reel stats for quick badges
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const reelsWithStats = reels.map((reel) => {
    const totalViews = reel.screeningLinks.reduce((sum, l) => sum + l._count.views, 0);
    const activeLink = reel.screeningLinks.find((l) => l.isActive);
    const lastViewed = lastViewedMap[reel.id] || null;

    // Activity status
    let activity: "hot" | "recent" | "stale" | "dead" | "none" = "none";
    if (totalViews === 0) {
      activity = reel._count.screeningLinks > 0 ? "dead" : "none";
    } else if (lastViewed && lastViewed > oneDayAgo) {
      activity = "hot";
    } else if (lastViewed && lastViewed > oneWeekAgo) {
      activity = "recent";
    } else {
      activity = "stale";
    }

    // Hot lead: 3+ views
    const isHotLead = totalViews >= 3;

    return { ...reel, totalViews, activeLink, lastViewed, activity, isHotLead };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center md:items-end justify-between mb-10 md:mb-14">
        <div>
          <h1 className="text-[32px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
            Reels
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#aaa] mt-2 md:mt-3">
            {reels.length} reel{reels.length !== 1 ? "s" : ""}{isRep ? " by you" : " created"}
          </p>
        </div>
        <Link
          href="/reels/build"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl bg-[#1A1A1A] text-white text-[12px] font-medium hover:bg-[#333] active:bg-[#444] transition-colors"
        >
          <Plus size={13} />
          Build Reel
        </Link>
      </div>

      {reelsWithStats.length > 0 ? (
        <div className="space-y-2.5 md:space-y-3">
          {reelsWithStats.map((reel) => (
            <Link
              key={reel.id}
              href={`/reels/${reel.id}`}
              className="content-card flex items-center gap-3 md:gap-5 p-3 md:p-4 group"
            >
              {/* Activity indicator dot */}
              <div className="flex-shrink-0 hidden md:block">
                {reel.activity === "hot" ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                ) : reel.activity === "recent" ? (
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                ) : reel.activity === "stale" ? (
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#ddd]" />
                ) : reel.activity === "dead" ? (
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-300" />
                ) : (
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#eee]" />
                )}
              </div>

              {/* Thumbnail strip — 2 on mobile, 3 on desktop */}
              <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                {reel.items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.id}
                    className={`w-14 h-9 md:w-20 md:h-12 bg-[#EEEDEA]/60 overflow-hidden rounded-lg ${
                      i >= 2 ? "hidden md:block" : ""
                    }`}
                  >
                    {item.project.muxPlaybackId ? (
                      <img
                        src={`https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=160&height=96&fit_mode=smartcrop`}
                        alt={item.project.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={10} className="text-[#ccc]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <h3 className="text-[14px] md:text-lg font-medium tracking-tight-2 text-[#1A1A1A] group-hover:text-black transition-colors truncate">
                    {reel.title}
                  </h3>
                  {reel.isHotLead && (
                    <span title="Hot lead — high engagement" className="flex-shrink-0">
                      <Flame size={13} className="text-amber-500" />
                    </span>
                  )}
                  <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#E0DDD8] text-[9px] text-[#999] uppercase tracking-[0.1em] flex-shrink-0">
                    <span className="w-1 h-1 rounded-full bg-[#ccc]" />
                    {reel.reelType.toLowerCase()}
                  </span>
                </div>
                <p className="text-[11px] md:text-[12px] text-[#999] mt-0.5">
                  {reel.director.name} · {reel._count.items} spot
                  {reel._count.items !== 1 ? "s" : ""}
                  <span className="md:hidden"> · {timeAgo(reel.updatedAt)}</span>
                </p>
                {reel.curatorialNote && (
                  <p className="hidden md:block text-[12px] text-[#bbb] mt-1.5 truncate italic">
                    &ldquo;{reel.curatorialNote}&rdquo;
                  </p>
                )}
              </div>

              {/* Right side — engagement stats + actions */}
              <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                {/* View count badge */}
                <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] tabular-nums ${
                  reel.totalViews > 0
                    ? "bg-[#F7F6F3] text-[#1A1A1A] font-medium"
                    : "text-[#ccc]"
                }`}>
                  <Eye size={11} className={reel.totalViews > 0 ? "text-[#999]" : "text-[#ddd]"} />
                  {reel.totalViews}
                </div>

                {/* Last viewed — desktop */}
                {reel.lastViewed && (
                  <span className="hidden md:block text-[10px] text-[#bbb] whitespace-nowrap">
                    {timeAgo(reel.lastViewed)}
                  </span>
                )}

                {/* Screening link icon */}
                {reel.activeLink && (
                  <a
                    href={`/s/${reel.activeLink.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E0DDD8] text-[#bbb] hover:text-[#1A1A1A] hover:border-[#1A1A1A]/20 hover:bg-white/50 transition-all"
                    title="Open screening link"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}

                {/* Send count — desktop */}
                <div className="hidden md:flex items-center gap-1 text-[11px] text-[#bbb]">
                  <Send size={10} />
                  {reel._count.screeningLinks}
                </div>

                {/* Mobile: compact stats */}
                <div className="md:hidden flex items-center gap-2.5">
                  {reel.totalViews > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[#999] font-medium">
                      <Eye size={9} />
                      {reel.totalViews}
                    </span>
                  )}
                  {reel._count.screeningLinks > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[#bbb]">
                      <Send size={9} />
                      {reel._count.screeningLinks}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center">
          <Film size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">No reels yet</h3>
          <p className="text-[12px] text-[#999] mt-1 max-w-sm">
            Build your first reel by selecting spots from a director&apos;s library.
          </p>
          <Link
            href="/reels/build"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-[13px] font-medium active:bg-[#333] transition-colors"
          >
            <Plus size={14} />
            Build Your First Reel
          </Link>
        </div>
      )}
    </div>
  );
}
