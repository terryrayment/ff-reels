import { prisma } from "@/lib/db";
import Link from "next/link";
import { Film, Users, Send, Eye, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const [directorCount, projectCount, reelCount, linkCount, recentViews] =
    await Promise.all([
      prisma.director.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.reel.count(),
      prisma.screeningLink.count({ where: { isActive: true } }),
      prisma.reelView.findMany({
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
      }),
    ]);

  const stats = [
    { label: "Directors", value: directorCount, icon: Users, href: "/directors" },
    { label: "Spots", value: projectCount, icon: Film, href: "/directors" },
    { label: "Reels", value: reelCount, icon: Send, href: "/reels" },
    { label: "Active Links", value: linkCount, icon: Eye, href: "/analytics" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-[#1A1A1A]">Dashboard</h1>
      <p className="text-sm text-[#999] mt-1">
        Overview of your reel activity.
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-5 bg-white border border-[#E8E8E3] rounded-xl hover:border-[#ccc] hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#999] uppercase tracking-wider">
                {stat.label}
              </p>
              <stat.icon size={14} className="text-[#ccc]" />
            </div>
            <p className="text-3xl font-light mt-2 text-[#1A1A1A]">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Views */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#999] uppercase tracking-wider">
            Recent Views
          </h2>
          <Link
            href="/analytics"
            className="text-xs text-[#999] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={10} />
          </Link>
        </div>

        {recentViews.length > 0 ? (
          <div className="bg-white border border-[#E8E8E3] rounded-xl divide-y divide-[#E8E8E3]">
            {recentViews.map((view) => (
              <div
                key={view.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#F7F6F3] flex items-center justify-center flex-shrink-0">
                    <Eye size={12} className="text-[#999]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">
                      {view.screeningLink.recipientName || "Anonymous"}{" "}
                      <span className="text-[#999]">viewed</span>{" "}
                      {view.screeningLink.reel.director.name}&apos;s reel
                    </p>
                    <p className="text-xs text-[#ccc] truncate">
                      {view.screeningLink.recipientCompany || view.screeningLink.recipientEmail || "\u2014"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#ccc] flex-shrink-0 ml-4">
                  {new Date(view.startedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-xl border border-[#E8E8E3]">
            <p className="text-sm text-[#999]">
              No views yet. Create and send a reel to start tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
