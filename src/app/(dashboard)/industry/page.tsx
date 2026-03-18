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

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const alertWhere = { isHidden: false, alertEligible: true } as const;

  // Run all queries in parallel to avoid sequential Neon round-trips
  const [credits, totalAlerts, thisWeek, highTrust, territoryBreakdown, sourceBreakdown] =
    await Promise.all([
      prisma.industryCredit.findMany({
        where: alertWhere,
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true, brand: true, campaignName: true, agency: true,
          productionCompany: true, directorName: true, category: true,
          territory: true, sourceUrl: true, sourceName: true,
          thumbnailUrl: true, isVerified: true, isHidden: true,
          isAiExtracted: true, createdAt: true, scrapedAt: true,
          publishedAt: true,
          agencyCanonical: true, productionCompanyCanonical: true,
          directorNameCanonical: true, agencyTerritory: true,
          sourceTrust: true, confidence: true, alertEligible: true,
          alertRejectedReason: true,
        },
      }),
      prisma.industryCredit.count({ where: alertWhere }),
      prisma.industryCredit.count({
        where: { ...alertWhere, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.industryCredit.count({
        where: { ...alertWhere, sourceTrust: "HIGH" },
      }),
      prisma.industryCredit.groupBy({
        by: ["agencyTerritory"],
        where: { ...alertWhere, agencyTerritory: { not: null } },
        _count: true,
      }),
      prisma.industryCredit.groupBy({
        by: ["sourceName"],
        where: { ...alertWhere, sourceName: { not: null } },
        _count: true,
      }),
    ]);

  const territories = territoryBreakdown.reduce(
    (acc, t) => {
      if (t.agencyTerritory) acc[t.agencyTerritory] = t._count;
      return acc;
    },
    {} as Record<string, number>
  );

  const sources = sourceBreakdown.reduce(
    (acc, s) => {
      if (s.sourceName) acc[s.sourceName] = s._count;
      return acc;
    },
    {} as Record<string, number>
  );

  const uniqueSources = Object.keys(sources).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-[#1A1A1A]">
            Industry Pulse
            <span className="ml-2 text-[9px] font-semibold tracking-[0.1em] text-[#bbb] uppercase align-middle">Beta</span>
          </h1>
          <p className="text-[12px] text-[#999] mt-1">
            Qualified production alerts: production company, director, agency, agency territory
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{totalAlerts}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">Qualified</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{thisWeek}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">This Week</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{uniqueSources}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">Sources</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{highTrust}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">High Trust</p>
          </div>
        </div>
      </div>

      {/* Territory + Source breakdown bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Territories */}
        {Object.entries(territories)
          .sort(([, a], [, b]) => b - a)
          .map(([t, count]) => (
          <div key={t} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
            t === "WEST" ? "bg-blue-50 text-blue-600" :
            t === "EAST" ? "bg-emerald-50 text-emerald-600" :
            "bg-amber-50 text-amber-600"
          }`}>
            <span className="uppercase tracking-[0.08em]">{t}</span>
            <span className="tabular-nums opacity-60">{count}</span>
          </div>
        ))}

        <div className="w-px h-5 bg-[#E8E7E3] mx-1" />

        {/* Sources */}
        {Object.entries(sources)
          .sort(([, a], [, b]) => b - a)
          .map(([name, count]) => (
          <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F6F3] text-[11px] text-[#666]">
            <span>{name}</span>
            <span className="tabular-nums text-[#bbb]">{count}</span>
          </div>
        ))}
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
