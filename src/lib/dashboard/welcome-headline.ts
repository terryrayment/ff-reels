import { prisma } from "@/lib/db";
import { getCommitteeLinks } from "@/lib/analytics/committee";
import { getEngagementScores } from "@/lib/analytics/scoring";

export type WelcomeHeadlineKind =
  | "live"
  | "committee"
  | "forwarded"
  | "overnight"
  | "hottest"
  | "quiet";

export interface WelcomeHeadline {
  kind: WelcomeHeadlineKind;
  text: string;
  isLive: boolean;
  /** lucide icon name (component maps it); empty for the live/dot state */
  icon: string;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Resolve the single highest-priority "welcome headline" for a user's own
 * reels, drawn entirely from existing analytics signals. Returns the first
 * truthy headline in priority order: live → committee → forwarded →
 * overnight → hottest → quiet fallback. Returns null only if the user owns
 * no reels AND has no fallback to show.
 *
 * Scoped to reels the user created (Reel.createdById). All windows are
 * rolling (tz-agnostic); see plan for the lastActiveAt-delta refinement.
 */
export async function getWelcomeHeadline({
  userId,
}: {
  userId: string;
  role?: string;
}): Promise<WelcomeHeadline | null> {
  // Stage 1 — the user's reels + their screening links
  const reels = await prisma.reel.findMany({
    where: { createdById: userId },
    select: {
      id: true,
      title: true,
      screeningLinks: { select: { id: true, isActive: true } },
    },
  });

  if (reels.length === 0) {
    return {
      kind: "quiet",
      text: "Your reels are ready when you are.",
      isLive: false,
      icon: "Sparkles",
    };
  }

  const titleByReelId = new Map(reels.map((r) => [r.id, r.title]));
  const links = reels.flatMap((r) =>
    r.screeningLinks.map((l) => ({ ...l, reelId: r.id }))
  );
  const linkIds = links.map((l) => l.id);
  const reelIdByLinkId = new Map(links.map((l) => [l.id, l.reelId]));
  const activeLinkCount = links.filter((l) => l.isActive).length;

  const quiet = (): WelcomeHeadline => ({
    kind: "quiet",
    text:
      activeLinkCount > 0
        ? `All quiet — ${activeLinkCount} reel${activeLinkCount === 1 ? "" : "s"} still active in the field.`
        : "Your reels are ready when you are.",
    isLive: false,
    icon: "Sparkles",
  });

  if (linkIds.length === 0) return quiet();

  const now = Date.now();
  const thirtyMinAgo = new Date(now - 30 * MINUTE);
  const fortyEightHrAgo = new Date(now - 48 * HOUR);
  const oneDayAgo = new Date(now - 24 * HOUR);
  const sevenDaysAgo = new Date(now - 7 * 24 * HOUR);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  // Stage 2 — pull every signal in parallel, then evaluate by priority
  const [liveView, forwardedViews, dayViews, recentViews, weekViews] =
    await Promise.all([
      prisma.reelView.findFirst({
        where: { startedAt: { gte: thirtyMinAgo }, screeningLinkId: { in: linkIds } },
        orderBy: { startedAt: "desc" },
        select: {
          screeningLink: {
            select: {
              recipientCompany: true,
              recipientName: true,
              reel: { select: { title: true } },
            },
          },
        },
      }),
      prisma.reelView.findMany({
        where: {
          isForwarded: true,
          startedAt: { gte: fortyEightHrAgo },
          screeningLinkId: { in: linkIds },
        },
        select: { screeningLinkId: true },
      }),
      prisma.reelView.findMany({
        where: { startedAt: { gte: oneDayAgo }, screeningLinkId: { in: linkIds } },
        select: { screeningLink: { select: { recipientCompany: true } } },
      }),
      prisma.reelView.findMany({
        where: { startedAt: { gte: sevenDaysAgo }, screeningLinkId: { in: linkIds } },
        select: { screeningLinkId: true },
      }),
      prisma.reelView.findMany({
        where: { startedAt: { gte: startOfWeek }, screeningLinkId: { in: linkIds } },
        select: { screeningLinkId: true },
      }),
    ]);

  // 1 — Live: a client watching in the last 30 min
  if (liveView) {
    const sl = liveView.screeningLink;
    const who = sl.recipientCompany || sl.recipientName || "Someone";
    return {
      kind: "live",
      text: `${who} is watching your ${sl.reel.title} reel right now`,
      isLive: true,
      icon: "",
    };
  }

  // 2 — Committee: multiple viewers from one company on a recently-active link
  const recentLinkIds = Array.from(
    new Set(recentViews.map((v) => v.screeningLinkId))
  );
  const committee = await getCommitteeLinks(recentLinkIds);
  let bestCommittee: { linkId: string; count: number; company: string } | null = null;
  for (const [linkId, info] of Array.from(committee.entries())) {
    if (info.company && (!bestCommittee || info.distinctViewerCount > bestCommittee.count)) {
      bestCommittee = { linkId, count: info.distinctViewerCount, company: info.company };
    }
  }
  if (bestCommittee) {
    const title = titleByReelId.get(reelIdByLinkId.get(bestCommittee.linkId) ?? "");
    return {
      kind: "committee",
      text: `${bestCommittee.count} people at ${bestCommittee.company} reviewed your ${title ?? "reel"} together`,
      isLive: false,
      icon: "Users",
    };
  }

  // 3 — Forwarded: shared with new viewers in the last 48h
  if (forwardedViews.length > 0) {
    const byReel = new Map<string, number>();
    for (const v of forwardedViews) {
      const rid = reelIdByLinkId.get(v.screeningLinkId);
      if (rid) byReel.set(rid, (byReel.get(rid) ?? 0) + 1);
    }
    const [topReelId, count] = Array.from(byReel.entries()).sort((a, b) => b[1] - a[1])[0];
    const title = titleByReelId.get(topReelId);
    return {
      kind: "forwarded",
      text: `Your ${title ?? "reel"} was forwarded to ${count} new viewer${count === 1 ? "" : "s"}`,
      isLive: false,
      icon: "Forward",
    };
  }

  // 4 — Day's activity: views in the last 24h across companies
  if (dayViews.length >= 2) {
    const companies = new Set(
      dayViews
        .map((v) => v.screeningLink.recipientCompany)
        .filter((c): c is string => !!c)
    );
    const tail =
      companies.size >= 2 ? ` from ${companies.size} companies` : "";
    return {
      kind: "overnight",
      text: `Your reels pulled ${dayViews.length} views in the last day${tail}`,
      isLive: false,
      icon: "Eye",
    };
  }

  // 5 — Hottest reel this week (by views), with completion %
  if (weekViews.length > 0) {
    const viewsByReel = new Map<string, number>();
    const linksByReel = new Map<string, Set<string>>();
    for (const v of weekViews) {
      const rid = reelIdByLinkId.get(v.screeningLinkId);
      if (!rid) continue;
      viewsByReel.set(rid, (viewsByReel.get(rid) ?? 0) + 1);
      if (!linksByReel.has(rid)) linksByReel.set(rid, new Set());
      linksByReel.get(rid)!.add(v.screeningLinkId);
    }
    const [topReelId] = Array.from(viewsByReel.entries()).sort((a, b) => b[1] - a[1])[0];
    const title = titleByReelId.get(topReelId);
    const scores = await getEngagementScores(
      Array.from(linksByReel.get(topReelId) ?? [])
    );
    const completions = Array.from(scores.values()).map((s) => s.components.completion);
    const avg =
      completions.length > 0
        ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length)
        : 0;
    const tail = avg > 0 ? ` — ${avg}% completion` : "";
    return {
      kind: "hottest",
      text: `Your ${title ?? "top reel"} is your hottest this week${tail}`,
      isLive: false,
      icon: "Flame",
    };
  }

  // 6 — Quiet fallback
  return quiet();
}
