import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ReelsList } from "@/components/reels/reels-list";

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

  // Compute per-reel stats
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const reelsWithStats = reels.map((reel) => {
    const totalViews = reel.screeningLinks.reduce(
      (sum, l) => sum + l._count.views,
      0,
    );
    const activeLink = reel.screeningLinks.find((l) => l.isActive) || null;
    const lastViewed = lastViewedMap[reel.id] || null;

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

    const isHotLead = totalViews >= 3;

    return {
      id: reel.id,
      title: reel.title,
      reelType: reel.reelType,
      curatorialNote: reel.curatorialNote,
      updatedAt: reel.updatedAt.toISOString(),
      director: reel.director,
      items: reel.items,
      screeningLinks: reel.screeningLinks,
      _count: reel._count,
      totalViews,
      activeLink: activeLink ? { token: activeLink.token } : null,
      lastViewed: lastViewed ? lastViewed.toISOString() : null,
      activity,
      isHotLead,
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center md:items-end justify-between mb-8 md:mb-10">
        <div>
          <h1 className="text-[32px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
            Reels
          </h1>
        </div>
        <Link
          href="/reels/build"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 md:px-5 md:py-2.5 rounded-xl bg-[#1A1A1A] text-white text-[12px] font-medium hover:bg-[#333] active:bg-[#444] transition-colors"
        >
          <Plus size={13} />
          Build Reel
        </Link>
      </div>

      <ReelsList reels={reelsWithStats} isRep={isRep} />
    </div>
  );
}
