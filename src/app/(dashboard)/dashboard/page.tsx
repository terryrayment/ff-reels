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
      <h1 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">Dashboard</h1>
      <p className="text-[13px] text-[#999] mt-0.5">
        Overview of your reel activity.
      </p>

      <div className="grid grid-cols-4 gap-3 mt-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-4 bg-white border border-[#E8E8E3] rounded-md hover:border-[#ccc] hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#999] uppercase tracking-wider font-medium">
                {stat.label}
              </p>
              <stat.icon size={13} className="text-[#ddd]" />
            </div>
            <p className="text-2xl font-semibold mt-1.5 text-[#1A1A1A]">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
            Recent Views
          </h2>
          <Link
            href="/analytics"
            className="text-[12px] text-[#999] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={10} />
          </Link>
        </div>

        {recentViews.length > 0 ? (
          <div className="bg-white border border-[#E8E8E3] rounded-md divide-y divide-[#F0F0EC]">
            {recentViews.map((view) => (
              <div
                key={view.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-[#F7F6F3] flex items-center justify-center flex-shrink-0">
                    <Eye size={11} className="text-[#bbb]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] truncate text-[#1A1A1A]">
                      {view.screeningLink.recipientName || "Anonymous"}{" "}
                      <span className="text-[#999]">viewed</span>{" "}
                      {view.screeningLink.reel.director.name}&apos;s reel
                    </p>
                    <p className="text-[11px] text-[#ccc] truncate">
                      {view.screeningLink.recipientCompany || view.screeningLink.recipientEmail || "\u2014"}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[#ccc] flex-shrink-0 ml-4">
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
          <div className="py-10 text-center bg-white rounded-md border border-[#E8E8E3]">
            <p className="text-[13px] text-[#999]">
              No views yet. Create and send a reel to start tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
