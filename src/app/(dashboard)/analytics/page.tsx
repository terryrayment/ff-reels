import { prisma } from "@/lib/db";
import { Eye, Smartphone, Monitor, Tablet, MapPin, Mail, Building2 } from "lucide-react";
import { timeAgo, formatDuration } from "@/lib/utils";
import Link from "next/link";

export default async function AnalyticsPage() {
  const [totalViews, recentViews, screeningLinks, topLocations, topAgencies] = await Promise.all([
    prisma.reelView.count(),
    prisma.reelView.findMany({
      take: 30,
      orderBy: { startedAt: "desc" },
      include: {
        screeningLink: {
          include: {
            reel: {
              include: { director: { select: { name: true } } },
            },
          },
        },
        spotViews: {
          select: { percentWatched: true, rewatched: true, skipped: true },
        },
      },
    }),
    prisma.screeningLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        reel: {
          include: { director: { select: { name: true } } },
        },
        _count: { select: { views: true } },
      },
    }),
    // Top viewing locations
    prisma.reelView.groupBy({
      by: ["viewerCity", "viewerCountry"],
      where: { viewerCity: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Top agencies/companies
    prisma.screeningLink.groupBy({
      by: ["recipientCompany"],
      where: { recipientCompany: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const avgDuration =
    recentViews.length > 0
      ? recentViews.reduce((sum, v) => sum + (v.totalDuration || 0), 0) /
        recentViews.filter((v) => v.totalDuration).length
      : 0;

  const deviceBreakdown = recentViews.reduce(
    (acc, v) => {
      const device = v.device || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Unique recipients by email
  const uniqueEmails = new Set(
    screeningLinks
      .map((l) => l.recipientEmail)
      .filter(Boolean)
  );

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Analytics
        </h1>
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#999] mt-1.5">
          Viewing activity across all reels
        </p>
      </div>

      {/* Top stats — card container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <div className="flex gap-14">
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {totalViews}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Total Views
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {avgDuration ? formatDuration(avgDuration) : "\u2014"}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Avg. Watch Time
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {screeningLinks.length}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Active Links
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {uniqueEmails.size}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Recipients
            </p>
          </div>
          <div>
            <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A]">
              {deviceBreakdown["desktop"] || 0} / {deviceBreakdown["mobile"] || 0}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Desktop / Mobile
            </p>
          </div>
        </div>
      </div>

      {/* Three-column insights */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Locations */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Top Locations
            </h3>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-2">
              {topLocations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#1A1A1A]">
                    {loc.viewerCity}{loc.viewerCountry ? `, ${loc.viewerCountry}` : ""}
                  </span>
                  <span className="text-[11px] text-[#999] tabular-nums">{loc._count.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Location data populates as reels are viewed.
            </p>
          )}
        </div>

        {/* Agencies / Companies */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Top Agencies
            </h3>
          </div>
          {topAgencies.length > 0 ? (
            <div className="space-y-2">
              {topAgencies.map((agency, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#1A1A1A] truncate">
                    {agency.recipientCompany}
                  </span>
                  <span className="text-[11px] text-[#999] tabular-nums ml-3">{agency._count.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Add recipient companies when creating screening links.
            </p>
          )}
        </div>

        {/* Recent Recipients */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={12} className="text-[#999]" />
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Recent Recipients
            </h3>
          </div>
          {screeningLinks.filter((l) => l.recipientEmail || l.recipientName).length > 0 ? (
            <div className="space-y-2.5">
              {screeningLinks
                .filter((l) => l.recipientEmail || l.recipientName)
                .slice(0, 10)
                .map((link) => (
                  <div key={link.id} className="min-w-0">
                    <p className="text-[12px] text-[#1A1A1A] truncate">
                      {link.recipientName || link.recipientEmail}
                    </p>
                    <p className="text-[10px] text-[#ccc] truncate">
                      {link.recipientCompany
                        ? `${link.recipientCompany} · `
                        : ""}
                      {link._count.views} view{link._count.views !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Add recipient info when sending screening links.
            </p>
          )}
        </div>
      </div>

      {/* View Feed — card container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          View Feed
        </h2>

        {recentViews.length > 0 ? (
          <div className="divide-y divide-[#F0F0EC]">
            {recentViews.map((view) => {
              const avgSpotCompletion =
                view.spotViews.length > 0
                  ? Math.round(
                      view.spotViews.reduce(
                        (sum, sv) => sum + (sv.percentWatched || 0),
                        0
                      ) / view.spotViews.length
                    )
                  : null;

              return (
                <div
                  key={view.id}
                  className="flex items-center justify-between py-3.5"
                >
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
                      <p className="text-[13px] truncate">
                        <span className="text-[#1A1A1A] font-medium">
                          {view.screeningLink.recipientName || "Anonymous"}
                        </span>
                        {view.screeningLink.recipientCompany && (
                          <span className="text-[#999]">
                            {" "}({view.screeningLink.recipientCompany})
                          </span>
                        )}
                        <span className="text-[#bbb]"> viewed </span>
                        <span className="text-[#666]">
                          {view.screeningLink.reel.director.name}&apos;s{" "}
                          {view.screeningLink.reel.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {view.screeningLink.recipientEmail && (
                          <span className="text-[10px] text-[#bbb]">
                            {view.screeningLink.recipientEmail}
                          </span>
                        )}
                        {view.totalDuration != null && view.totalDuration > 0 && (
                          <span className="text-[10px] text-[#bbb]">
                            Watched {formatDuration(view.totalDuration)}
                          </span>
                        )}
                        {avgSpotCompletion !== null && (
                          <span className="text-[10px] text-[#bbb]">
                            {avgSpotCompletion}% avg completion
                          </span>
                        )}
                        {view.viewerCity && (
                          <span className="text-[10px] text-[#bbb] flex items-center gap-0.5">
                            <MapPin size={8} />
                            {view.viewerCity}
                            {view.viewerCountry ? `, ${view.viewerCountry}` : ""}
                          </span>
                        )}
                        {view.isForwarded && (
                          <span className="text-[10px] text-amber-600">
                            Forwarded
                          </span>
                        )}
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
          <div className="py-16 text-center">
            <p className="text-[13px] text-[#999]">
              No views recorded yet. Send a reel to start tracking engagement.
            </p>
          </div>
        )}
      </div>

      {/* Active Screening Links — card container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          Active Screening Links
        </h2>

        {screeningLinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 divide-y-0">
            {screeningLinks.map((link) => (
              <Link
                key={link.id}
                href={`/reels/${link.reel.id}`}
                className="group py-3.5 block border-b border-[#F0F0EC]"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#1A1A1A] group-hover:text-black transition-colors truncate font-medium">
                      {link.recipientName || link.recipientEmail || "Untitled"}
                    </p>
                    <p className="text-[11px] text-[#999] truncate mt-0.5">
                      {link.reel.director.name} — {link.reel.title}
                    </p>
                    {(link.recipientCompany || link.recipientEmail) && (
                      <p className="text-[10px] text-[#ccc] mt-0.5 truncate">
                        {[link.recipientCompany, link.recipientEmail]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-[#bbb] flex items-center gap-1 flex-shrink-0 ml-3">
                    <Eye size={10} />
                    {link._count.views}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[#999]">
              No active screening links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
