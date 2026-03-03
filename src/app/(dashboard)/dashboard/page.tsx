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

  const [
    directorCount,
    projectCount,
    reelCount,
    linkCount,
    recentViews,
    updates,
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
      take: 30,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        director: { select: { id: true, name: true } },
        project: { select: { id: true, title: true, brand: true } },
        author: { select: { id: true, name: true, email: true } },
      },
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
      <div className="mb-12">
        <h1 className="font-serif text-3xl tracking-tight-2 text-[#1A1A1A]">
          Dashboard
        </h1>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-[#999]">
          {session.user.name || session.user.email}
          <span className="mx-2 text-[#E0E0E0]">/</span>
          {roleLabel}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-16">
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0" style={{ flexBasis: "62%" }}>
          {/* Stats row */}
          <div className="flex gap-14">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group"
              >
                <p className="font-serif text-5xl tracking-tight-3 text-[#1A1A1A] group-hover:text-[#666] transition-colors">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999] group-hover:text-[#666] transition-colors">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>

          {/* Recent Views */}
          <div className="mt-16">
            <div className="flex items-baseline justify-between mb-6">
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
                  <div
                    key={view.id}
                    className={`flex items-center justify-between py-3 ${
                      i < recentViews.length - 1
                        ? "border-b border-[#F0F0EC]"
                        : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#1A1A1A] truncate">
                        <span className="font-medium">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#999] py-8">
                No views yet.{" "}
                {isAdmin
                  ? "Create and send a reel to start tracking."
                  : "Send a screening link to start tracking views."}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN -- Board */}
        <div className="flex-shrink-0" style={{ flexBasis: "35%" }}>
          <h2 className="font-serif text-xl tracking-tight-2 text-[#1A1A1A] mb-8">
            Board
          </h2>

          {/* Compose */}
          <ComposeUpdate />

          {/* Updates feed */}
          <div className="mt-10">
            {updates.length > 0 ? (
              <div>
                {updates.map((update, i) => (
                  <div
                    key={update.id}
                    className={`py-4 ${
                      i < updates.length - 1
                        ? "border-b border-[#F0F0EC]"
                        : ""
                    }`}
                  >
                    {/* Type + pin + time */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[#999]">
                        {updateTypeLabel(update.type)}
                      </span>
                      {update.isPinned && (
                        <span className="text-[10px] uppercase tracking-[0.12em] text-[#1A1A1A] font-medium">
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-[13px] text-[#1A1A1A] leading-snug">
                      {update.title}
                    </p>

                    {/* Body */}
                    {update.body && (
                      <p className="text-[12px] text-[#888] mt-1 leading-relaxed">
                        {update.body}
                      </p>
                    )}

                    {/* Director / Project */}
                    {(update.director || update.project) && (
                      <p className="text-[11px] text-[#999] mt-2">
                        {update.director && (
                          <span>{update.director.name}</span>
                        )}
                        {update.director && update.project && (
                          <span className="text-[#ddd]"> / </span>
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

                    {/* Author + time */}
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#ccc] mt-2">
                      {update.author?.name || update.author?.email || "System"}
                      <span className="mx-2 text-[#E8E8E3]">/</span>
                      {timeAgo(update.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#999] py-8">
                No updates yet. Post the first one.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
