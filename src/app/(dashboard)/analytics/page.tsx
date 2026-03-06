import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { formatDuration } from "@/lib/utils";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { ReelAnalyticsTable, type ReelRow } from "@/components/analytics/reel-analytics-table";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  // Date range filtering
  const fromDate = searchParams.from ? new Date(searchParams.from) : null;
  const toDate = searchParams.to
    ? new Date(searchParams.to + "T23:59:59")
    : null;

  const dateFilter = {
    ...(fromDate ? { gte: fromDate } : {}),
    ...(toDate ? { lte: toDate } : {}),
  };

  const hasDateFilter = fromDate || toDate;

  // Role-based ownership filters
  const reelOwnerFilter = isAdmin ? {} : { createdById: userId };
  const viewOwnerFilter = isAdmin
    ? {}
    : { screeningLink: { reel: { createdById: userId } } };
  const ownerFilter = isAdmin ? {} : { reel: { createdById: userId } };

  // ── Aggregate stats (top row) ──
  const [totalViews, recentViews, activeLinksCount, uniqueRecipients] =
    await Promise.all([
      prisma.reelView.count({
        where: {
          ...(hasDateFilter ? { startedAt: dateFilter } : {}),
          ...viewOwnerFilter,
        },
      }),
      prisma.reelView.findMany({
        take: 50,
        orderBy: { startedAt: "desc" },
        where: {
          ...(hasDateFilter ? { startedAt: dateFilter } : {}),
          ...viewOwnerFilter,
        },
        select: { totalDuration: true, device: true },
      }),
      prisma.screeningLink.count({
        where: { isActive: true, ...ownerFilter },
      }),
      prisma.screeningLink.findMany({
        where: ownerFilter,
        select: { recipientEmail: true },
        distinct: ["recipientEmail"],
      }),
    ]);

  // Compute aggregate stats
  const viewsWithDuration = recentViews.filter((v) => v.totalDuration);
  const avgDuration =
    viewsWithDuration.length > 0
      ? viewsWithDuration.reduce(
          (sum, v) => sum + (v.totalDuration || 0),
          0
        ) / viewsWithDuration.length
      : 0;

  const deviceBreakdown = recentViews.reduce(
    (acc, v) => {
      const device = v.device || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const uniqueEmailCount = uniqueRecipients.filter((r) => r.recipientEmail).length;

  // ── Per-reel data for table ──
  const reels = await prisma.reel.findMany({
    where: reelOwnerFilter,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      director: { select: { name: true } },
      createdBy: { select: { name: true } },
      screeningLinks: {
        select: {
          id: true,
          isActive: true,
          createdAt: true,
          recipientName: true,
          recipientEmail: true,
          recipientCompany: true,
          contactId: true,
          views: {
            select: {
              id: true,
              viewerName: true,
              viewerEmail: true,
              viewerCity: true,
              viewerCountry: true,
              device: true,
              startedAt: true,
              totalDuration: true,
              spotViews: {
                select: { percentWatched: true },
                take: 10,
              },
            },
            orderBy: { startedAt: "desc" },
            take: 25,
          },
          _count: { select: { views: true } },
        },
        ...(hasDateFilter
          ? { where: { createdAt: dateFilter } }
          : {}),
      },
    },
  });

  // Compute per-reel row data
  const reelRows: ReelRow[] = reels.map((reel) => {
    const totalViewsForReel = reel.screeningLinks.reduce(
      (sum, link) => sum + link._count.views,
      0
    );
    const totalSent = reel.screeningLinks.length;
    const activeLinks = reel.screeningLinks.filter((l) => l.isActive).length;

    // Last sent = most recent screening link createdAt
    const sentDates = reel.screeningLinks.map((l) => l.createdAt.getTime());
    const lastSent = sentDates.length > 0
      ? new Date(Math.max(...sentDates)).toISOString()
      : null;

    // Flatten all views across all links for this reel
    const allViews = reel.screeningLinks.flatMap((link) =>
      link.views.map((v) => {
        const avgCompletion =
          v.spotViews.length > 0
            ? Math.round(
                v.spotViews.reduce((s, sv) => s + (sv.percentWatched || 0), 0) /
                  v.spotViews.length
              )
            : null;
        return {
          id: v.id,
          viewerName: v.viewerName || link.recipientName || "Anonymous",
          viewerEmail: v.viewerEmail || link.recipientEmail || null,
          company: link.recipientCompany || null,
          contactId: link.contactId || null,
          city: v.viewerCity || null,
          country: v.viewerCountry || null,
          device: v.device || "desktop",
          startedAt: v.startedAt.toISOString(),
          duration: v.totalDuration || null,
          avgCompletion,
        };
      })
    );

    // Sort views by most recent first
    allViews.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const lastViewed = allViews.length > 0 ? allViews[0].startedAt : null;

    // Recipient — first non-null recipient name or company across links
    const recipients = reel.screeningLinks
      .filter((l) => l.recipientName || l.recipientCompany)
      .map((l) => ({
        name: l.recipientName || l.recipientEmail || null,
        company: l.recipientCompany || null,
        contactId: l.contactId || null,
      }));
    const recipient = recipients.length > 0
      ? recipients[0].name
        ? (recipients[0].company
            ? `${recipients[0].name} (${recipients[0].company})`
            : recipients[0].name)
        : recipients[0].company || null
      : null;
    const recipientCount = recipients.length;
    const recipientContactId = recipients.length > 0 ? recipients[0].contactId : null;

    // Avg completion % across all spot views
    const allSpotCompletions = allViews
      .map((v) => v.avgCompletion)
      .filter((c): c is number => c !== null);
    const avgCompletionPct = allSpotCompletions.length > 0
      ? Math.round(
          allSpotCompletions.reduce((s, c) => s + c, 0) / allSpotCompletions.length
        )
      : null;

    // Hot lead detection: 3+ views, or viewed on multiple days, or high completion
    const uniqueViewDays = new Set(
      allViews.map((v) => v.startedAt.split("T")[0])
    ).size;
    const isHotLead =
      totalViewsForReel >= 3 ||
      uniqueViewDays >= 2 ||
      (avgCompletionPct !== null && avgCompletionPct > 70);

    return {
      id: reel.id,
      title: reel.title,
      directorName: reel.director.name,
      reelType: reel.reelType,
      sentByName: reel.createdBy?.name || "Unknown",
      totalViews: totalViewsForReel,
      totalSent,
      activeLinks,
      lastSent,
      lastViewed,
      views: allViews,
      recipient,
      recipientCount,
      recipientContactId,
      avgCompletionPct,
      isHotLead,
    };
  });

  return (
    <div>
      {/* Header + Date Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
        <div>
          <h1 className="text-[32px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
            Analytics
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#aaa] mt-2 md:mt-3">
            {isAdmin
              ? "All reel activity"
              : "Your reel engagement"}
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Top stats */}
      <div className="data-card p-6 md:p-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-14">
          <div>
            <p className="text-[32px] md:text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A]">
              {totalViews}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Total Views
            </p>
          </div>
          <div>
            <p className="text-[32px] md:text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A]">
              {avgDuration ? formatDuration(avgDuration) : "\u2014"}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Avg. Watch Time
            </p>
          </div>
          <div>
            <p className="text-[32px] md:text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A]">
              {activeLinksCount}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Active Links
            </p>
          </div>
          <div>
            <p className="text-[32px] md:text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A]">
              {uniqueEmailCount}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Recipients
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-[32px] md:text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A]">
              {deviceBreakdown["desktop"] || 0} /{" "}
              {deviceBreakdown["mobile"] || 0}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Desktop / Mobile
            </p>
          </div>
        </div>
      </div>

      {/* Wiredrive-style reel table */}
      <ReelAnalyticsTable rows={reelRows} />
    </div>
  );
}
