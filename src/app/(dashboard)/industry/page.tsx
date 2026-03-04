import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { IndustryFeed } from "./industry-feed";

export default async function IndustryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role?: string })?.role || "VIEWER";
  if (role === "VIEWER") redirect("/dashboard");

  // Fetch most recent 100 credits
  const credits = await prisma.industryCredit.findMany({
    where: { isHidden: false },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Stats
  const totalCredits = await prisma.industryCredit.count({ where: { isHidden: false } });
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thisWeek = await prisma.industryCredit.count({
    where: { isHidden: false, createdAt: { gte: sevenDaysAgo } },
  });

  // Territory breakdown
  const territoryBreakdown = await prisma.industryCredit.groupBy({
    by: ["territory"],
    where: { isHidden: false, territory: { not: null } },
    _count: true,
  });

  const territories = territoryBreakdown.reduce(
    (acc, t) => {
      if (t.territory) acc[t.territory] = t._count;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-[#1A1A1A]">
            Industry Pulse
          </h1>
          <p className="text-[12px] text-[#999] mt-1">
            Commercial production credits from across the industry
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{totalCredits}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">Total Credits</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{thisWeek}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">This Week</p>
          </div>
          {Object.entries(territories).map(([t, count]) => (
            <div key={t} className="text-right">
              <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{count}</p>
              <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">{t}</p>
            </div>
          ))}
        </div>
      </div>

      <IndustryFeed
        initialCredits={credits.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          scrapedAt: c.scrapedAt.toISOString(),
          publishedAt: c.publishedAt?.toISOString() || null,
        }))}
      />
    </div>
  );
}
