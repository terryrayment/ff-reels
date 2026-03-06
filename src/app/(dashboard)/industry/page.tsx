import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IndustryFeed } from "./industry-feed";
import { UsersPanel } from "./users-panel";

export default async function IndustryPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role?: string; id?: string })?.role || "VIEWER";
  const userId = (session.user as { id?: string })?.id || "";
  if (role === "VIEWER") redirect("/dashboard");

  const isAdmin = role === "ADMIN";
  const tab = searchParams.tab;
  const isTeamTab = tab === "team" && isAdmin;

  // If team tab, fetch users instead of credits
  if (isTeamTab) {
    const users = await prisma.user.findMany({
      where: { role: { not: "VIEWER" } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        inviteToken: true,
        inviteTokenExpires: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const serializedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.passwordHash ? "active" : "invited",
      invitePending: !u.passwordHash,
      inviteExpired: !u.passwordHash && u.inviteTokenExpires
        ? u.inviteTokenExpires < new Date()
        : false,
      createdAt: u.createdAt.toISOString(),
    }));

    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium tracking-tight text-[#1A1A1A]">
            Industry
          </h1>
          <p className="text-[12px] text-[#999] mt-1">
            Credits, intel &amp; team management
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8">
          <Link
            href="/industry"
            className="px-4 py-2 text-[12px] font-medium rounded-lg transition-colors text-[#999] hover:text-[#666] hover:bg-white/40"
          >
            Credits
          </Link>
          <Link
            href="/industry?tab=team"
            className="px-4 py-2 text-[12px] font-medium rounded-lg transition-colors bg-[#1A1A1A] text-white"
          >
            Team
          </Link>
        </div>

        <UsersPanel initialUsers={serializedUsers} currentUserId={userId} />
      </div>
    );
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Run all queries in parallel to avoid sequential Neon round-trips
  const [credits, totalCredits, thisWeek, aiEnriched, territoryBreakdown, sourceBreakdown] =
    await Promise.all([
      prisma.industryCredit.findMany({
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.industryCredit.count({ where: { isHidden: false } }),
      prisma.industryCredit.count({
        where: { isHidden: false, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.industryCredit.count({
        where: { isHidden: false, isAiExtracted: true },
      }),
      prisma.industryCredit.groupBy({
        by: ["territory"],
        where: { isHidden: false, territory: { not: null } },
        _count: true,
      }),
      prisma.industryCredit.groupBy({
        by: ["sourceName"],
        where: { isHidden: false, sourceName: { not: null } },
        _count: true,
      }),
    ]);

  const territories = territoryBreakdown.reduce(
    (acc, t) => {
      if (t.territory) acc[t.territory] = t._count;
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
            Industry
          </h1>
          <p className="text-[12px] text-[#999] mt-1">
            Credits, intel &amp; team management
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{totalCredits}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">Total</p>
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
            <p className="text-[20px] font-light text-[#1A1A1A] tabular-nums">{aiEnriched}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em]">AI Enriched</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      {isAdmin && (
        <div className="flex items-center gap-1 mb-8">
          <Link
            href="/industry"
            className="px-4 py-2 text-[12px] font-medium rounded-lg transition-colors bg-[#1A1A1A] text-white"
          >
            Credits
          </Link>
          <Link
            href="/industry?tab=team"
            className="px-4 py-2 text-[12px] font-medium rounded-lg transition-colors text-[#999] hover:text-[#666] hover:bg-white/40"
          >
            Team
          </Link>
        </div>
      )}

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
