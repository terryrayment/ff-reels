import { prisma } from "@/lib/db";
import Link from "next/link";
import { Film, Users, Send, Eye, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  // Fetch real counts
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
      <h1 className="text-2xl font-light tracking-tight">Dashboard</h1>
      <p className="text-sm text-white/40 mt-1">
        Overview of your reel activity.
      </p>

      {/* Stat cards — clean, breathing room */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/30 uppercase tracking-wider">
                {stat.label}
              </p>
              <stat.icon size={14} className="text-white/15" />
            </div>
            <p className="text-3xl font-light mt-2">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Views */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
            Recent Views
          </h2>
          <Link
            href="/analytics"
            className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={10} />
          </Link>
        </div>

        {recentViews.length > 0 ? (
          <div className="space-y-1">
            {recentViews.map((view) => (
              <div
                key={view.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Eye size={12} className="text-white/25" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">
                      {view.screeningLink.recipientName || "Anonymous"}{" "}
                      <span className="text-white/30">viewed</span>{" "}
                      {view.screeningLink.reel.director.name}&apos;s reel
                    </p>
                    <p className="text-xs text-white/25 truncate">
                      {view.screeningLink.recipientCompany || view.screeningLink.recipientEmail || "—"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/20 flex-shrink-0 ml-4">
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
          <div className="py-12 text-center bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-sm text-white/25">
              No views yet. Create and send a reel to start tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
