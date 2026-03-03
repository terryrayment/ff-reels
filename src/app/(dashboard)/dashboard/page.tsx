import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { ComposeUpdate } from "@/components/dashboard/compose-update";

function updateTypeLabel(type: string): string {
  switch (type) {
    case "SPOT_ADDED":
      return "New Spot";
    case "REEL_CREATED":
      return "New Reel";
    case "DIRECTOR_ADDED":
      return "New Director";
    case "ADMIN_NOTE":
      return "Note";
    default:
      return "Update";
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  // Fetch data based on role
  const [
    directorCount,
    projectCount,
    reelCount,
    linkCount,
    recentViews,
    updates,
  ] = await Promise.all([
    // Admin-only stats
    isAdmin ? prisma.director.count({ where: { isActive: true } }) : 0,
    isAdmin ? prisma.project.count() : 0,
    // Reel count: admin sees all, rep sees theirs
    isAdmin
      ? prisma.reel.count()
      : prisma.reel.count({ where: { createdById: userId } }),
    // Active links: admin sees all, rep sees links on their reels
    isAdmin
      ? prisma.screeningLink.count({ where: { isActive: true } })
      : prisma.screeningLink.count({
          where: {
            isActive: true,
            reel: { createdById: userId },
          },
        }),
    // Recent views: admin sees all, rep sees views on their reels
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
    // Updates feed — everyone sees all
    prisma.update.findMany({
      take: 30,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        director: { select: { id: true, name: true } },
        project: { select: { id: true, title: true, brand: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  // Build stats array based on role
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
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            {session.user.name || session.user.email}{" "}
            <span className="text-[11px] text-[#ccc] uppercase tracking-wider font-medium ml-1">
              {roleLabel}
            </span>
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 flex gap-6">
        {/* LEFT COLUMN — Main content */}
        <div className="flex-1 min-w-0" style={{ flexBasis: "65%" }}>
          {/* Stats grid */}
          <div
            className={`grid gap-3 ${
              isAdmin ? "grid-cols-4" : "grid-cols-2"
            }`}
          >
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group p-4 bg-white border border-[#E8E8E3] rounded-sm hover:border-[#ccc] hover:shadow-sm transition-all"
              >
                <p className="text-[11px] text-[#999] uppercase tracking-wider font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold mt-1.5 text-[#1A1A1A]">
                  {stat.value}
                </p>
              </Link>
            ))}
          </div>

          {/* Recent Views */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-[#999] uppercase tracking-wider">
                Recent Views
              </h2>
              <Link
                href="/analytics"
                className="text-[11px] text-[#999] hover:text-[#1A1A1A] uppercase tracking-wider font-medium transition-colors"
              >
                View All
              </Link>
            </div>

            {recentViews.length > 0 ? (
              <div className="bg-white border border-[#E8E8E3] rounded-sm divide-y divide-[#F0F0EC]">
                {recentViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] truncate text-[#1A1A1A]">
                        <span className="font-medium">
                          {view.screeningLink.recipientName || "Anonymous"}
                        </span>{" "}
                        <span className="text-[#999]">viewed</span>{" "}
                        <span className="font-medium">
                          {view.screeningLink.reel.director.name}
                        </span>
                        &apos;s reel
                      </p>
                      <p className="text-[11px] text-[#ccc] truncate">
                        {view.screeningLink.recipientCompany ||
                          view.screeningLink.recipientEmail ||
                          "\u2014"}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#999] flex-shrink-0 ml-4 font-medium">
                      {timeAgo(view.startedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-white rounded-sm border border-[#E8E8E3]">
                <p className="text-[13px] text-[#999]">
                  No views yet.{" "}
                  {isAdmin
                    ? "Create and send a reel to start tracking."
                    : "Send a screening link to start tracking views."}
                </p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <h2 className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-3">
              Quick Links
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {isAdmin && (
                <Link
                  href="/directors"
                  className="p-4 bg-white border border-[#E8E8E3] rounded-sm hover:border-[#ccc] hover:shadow-sm transition-all"
                >
                  <p className="text-[13px] font-medium text-[#1A1A1A]">
                    Directors
                  </p>
                  <p className="text-[11px] text-[#999] mt-0.5">
                    Manage roster
                  </p>
                </Link>
              )}
              <Link
                href="/reels"
                className="p-4 bg-white border border-[#E8E8E3] rounded-sm hover:border-[#ccc] hover:shadow-sm transition-all"
              >
                <p className="text-[13px] font-medium text-[#1A1A1A]">
                  Reels
                </p>
                <p className="text-[11px] text-[#999] mt-0.5">
                  Build &amp; manage
                </p>
              </Link>
              <Link
                href="/analytics"
                className="p-4 bg-white border border-[#E8E8E3] rounded-sm hover:border-[#ccc] hover:shadow-sm transition-all"
              >
                <p className="text-[13px] font-medium text-[#1A1A1A]">
                  Analytics
                </p>
                <p className="text-[11px] text-[#999] mt-0.5">
                  View engagement
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Team Board */}
        <div className="flex-shrink-0" style={{ flexBasis: "35%" }}>
          <h2 className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-3">
            Team Board
          </h2>

          {/* Compose box */}
          <ComposeUpdate />

          {/* Updates feed */}
          <div className="mt-4 space-y-0">
            {updates.length > 0 ? (
              <div className="bg-white border border-[#E8E8E3] rounded-sm divide-y divide-[#F0F0EC]">
                {updates.map((update) => (
                  <div key={update.id} className="px-4 py-3">
                    {/* Meta line */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#999] bg-[#F7F6F3] px-1.5 py-0.5 rounded-sm">
                        {updateTypeLabel(update.type)}
                      </span>
                      {update.isPinned && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                          Pinned
                        </span>
                      )}
                      <span className="text-[10px] text-[#ccc] ml-auto flex-shrink-0">
                        {timeAgo(update.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[13px] font-medium text-[#1A1A1A] leading-snug">
                      {update.title}
                    </p>

                    {/* Body */}
                    {update.body && (
                      <p className="text-[12px] text-[#666] mt-1 leading-relaxed">
                        {update.body}
                      </p>
                    )}

                    {/* Director / Project tag */}
                    {(update.director || update.project) && (
                      <p className="text-[11px] text-[#999] mt-1.5">
                        {update.director && (
                          <span>{update.director.name}</span>
                        )}
                        {update.director && update.project && (
                          <span className="text-[#ccc]"> / </span>
                        )}
                        {update.project && (
                          <span>
                            {update.project.title}
                            {update.project.brand &&
                              ` (${update.project.brand})`}
                          </span>
                        )}
                      </p>
                    )}

                    {/* Author */}
                    <p className="text-[10px] text-[#ccc] mt-1.5 uppercase tracking-wider">
                      {update.author?.name || update.author?.email || "System"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-sm border border-[#E8E8E3]">
                <p className="text-[13px] text-[#999]">
                  No updates yet. Post the first one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
