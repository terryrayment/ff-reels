import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ComposeUpdate } from "@/components/dashboard/compose-update";
import { SignalFeed } from "@/components/dashboard/signal-feed";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  const [
    directorCount,
    projectCount,
    reelCount,
    linkCount,
    recentViews,
    updates,
    industryFeed,
  ] = await Promise.all([
    isAdmin ? prisma.director.count({ where: { isActive: true } }) : 0,
    isAdmin ? prisma.project.count() : 0,
    isAdmin
      ? prisma.reel.count()
      : prisma.reel.count({ where: { createdById: userId } }),
    isAdmin
      ? prisma.screeningLink.count({ where: { isActive: true } })
      : prisma.screeningLink.count({
          where: {
            isActive: true,
            reel: { createdById: userId },
          },
        }),
    isAdmin
      ? prisma.reelView.findMany({
          take: 8,
          orderBy: { startedAt: "desc" },
          include: {
            screeningLink: {
              include: {
                reel: {
                  include: { director: { select: { name: true } } },
                },
              },
            },
          },
        })
      : prisma.reelView.findMany({
          take: 8,
          orderBy: { startedAt: "desc" },
          where: {
            screeningLink: {
              reel: { createdById: userId },
            },
          },
          include: {
            screeningLink: {
              include: {
                reel: {
                  include: { director: { select: { name: true } } },
                },
              },
            },
          },
        }),
    prisma.update.findMany({
      where: {
        type: { not: "REEL_VIEWED" }, // Don't show auto-generated view notifications
      },
      take: 30,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        director: { select: { id: true, name: true } },
        project: { select: { id: true, title: true, brand: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    // Industry credits feed — nightly scraped from SHOTS, SHOOT, prod co sites, etc.
    prisma.industryCredit.findMany({
      take: 25,
      where: { isHidden: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = isAdmin
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
        <Link
          href="/reels/build"
          className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#333] transition-all duration-300 shadow-sm"
        >
          <span className="text-[13px] font-medium tracking-wide">Build Reel</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>

      {/* Stats row — card container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <div className="flex gap-14">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group"
            >
              <p className="text-5xl font-light tracking-tight-3 text-[#1A1A1A] group-hover:text-[#666] transition-colors">
                {stat.value}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999] group-hover:text-[#666] transition-colors">
                {stat.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 flex flex-col gap-6" style={{ flexBasis: "62%" }}>

          {/* Recent Views — card container */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
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
                      <p className="text-[11px] text-[#ccc] mt-0.5 truncate">
                        {view.screeningLink.recipientCompany ||
                          view.screeningLink.recipientEmail ||
                          "\u2014"}
                      </p>
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

          {/* Industry Pulse — scrollable card container */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
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
                    {/* Credit line — full display, no truncation */}
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
                    {/* Meta row */}
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
                            <span className="mx-1">·</span>
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

        {/* RIGHT COLUMN -- Signal — card container */}
        <div className="flex-shrink-0" style={{ flexBasis: "35%" }}>
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 sticky top-8">
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
  );
}
