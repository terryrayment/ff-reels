import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ReelsList } from "@/components/reels/reels-list";
import { ReelsWorkspaceSwitch } from "@/components/reels/reels-workspace-switch";

export default async function ReelsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const reels = await prisma.reel.findMany({
    orderBy: { updatedAt: "desc" },
    take: 400,
    include: {
      director: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
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
      take: 1500,
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
      createdBy: reel.createdBy
        ? { id: reel.createdBy.id, name: reel.createdBy.name ?? "Unknown" }
        : null,
    };
  });

  const canManageAll = ["ADMIN", "PRODUCER"].includes(session.user.role);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 md:mb-10">
        <div className="min-w-0">
          <p className="section-header mb-3">Shared screening assets</p>
          <h1 className="text-[42px] md:text-[56px] font-semibold tracking-tight text-[#111] leading-none">
            Reels
          </h1>
          <p className="mt-3 text-[12px] text-[#666]">
            Build, send, and manage {reelsWithStats.length} reel{reelsWithStats.length !== 1 ? "s" : ""} from one library.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <ReelsWorkspaceSwitch active="library" />
          <Link
            href="/reels/build"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 md:px-5 md:py-2.5 rounded-md bg-[#111] text-white text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-black active:bg-[#333] transition-colors"
          >
            <Plus size={13} />
            Build Reel
          </Link>
        </div>
      </div>

      <ReelsList
        reels={reelsWithStats}
        currentUserId={session.user.id}
        canManageAll={canManageAll}
      />
    </div>
  );
}
