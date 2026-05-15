import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DirectorCard } from "@/components/marketing/director-card";
import { ProjectCard } from "@/components/marketing/project-card";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Commercial Production" },
};

export const revalidate = 300;

async function getHomepageData() {
  const [directors, recentProjects] = await Promise.all([
    prisma.director.findMany({
      where: { isActive: true, rosterStatus: "ROSTER" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        categories: true,
        videoIntroUrl: true,
        headshotUrl: true,
        heroThumbnailUrl: true,
        heroProjectId: true,
        projects: {
          where: { muxStatus: "ready", muxPlaybackId: { not: null } },
          orderBy: [{ year: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: {
            id: true,
            muxPlaybackId: true,
            thumbnailUrl: true,
          },
        },
      },
    }),
    prisma.project.findMany({
      where: { muxStatus: "ready" },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        brand: true,
        thumbnailUrl: true,
        muxPlaybackId: true,
        director: { select: { slug: true, name: true } },
      },
    }),
  ]);

  const heroProjectIds = directors
    .map((d) => d.heroProjectId)
    .filter((id): id is string => Boolean(id));

  const heroProjects =
    heroProjectIds.length > 0
      ? await prisma.project.findMany({
          where: { id: { in: heroProjectIds } },
          select: { id: true, thumbnailUrl: true, muxPlaybackId: true },
        })
      : [];

  const heroProjectMap = new Map(heroProjects.map((p) => [p.id, p]));

  const featuredDirectors = directors.map((d) => {
    const heroProject = d.heroProjectId
      ? heroProjectMap.get(d.heroProjectId) ?? null
      : null;
    const fallbackProject =
      heroProject?.muxPlaybackId ? heroProject : d.projects[0] ?? null;
    const stillUrl =
      d.heroThumbnailUrl ??
      heroProject?.thumbnailUrl ??
      (heroProject?.muxPlaybackId
        ? `https://image.mux.com/${heroProject.muxPlaybackId}/thumbnail.jpg?width=1280`
        : null) ??
      fallbackProject?.thumbnailUrl ??
      (fallbackProject?.muxPlaybackId
        ? `https://image.mux.com/${fallbackProject.muxPlaybackId}/thumbnail.jpg?width=1280`
        : null) ??
      d.headshotUrl ??
      null;

    return {
      ...d,
      stillUrl,
      cardPlaybackId: d.videoIntroUrl ?? fallbackProject?.muxPlaybackId ?? null,
      playProjectId: d.videoIntroUrl ? null : fallbackProject?.id ?? null,
    };
  });

  return { featuredDirectors, recentProjects };
}

export default async function MarketingHomePage() {
  const { featuredDirectors, recentProjects } = await getHomepageData();

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-28 lg:pt-32 pb-20 lg:pb-28">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#999] mb-3">
              A CREATIVE NETWORK
            </p>
            <h1 className="text-[56px] md:text-[88px] lg:text-[116px] font-black text-[#1A1A1A] font-helveticaDisplay leading-[0.9]">
              Friends &amp; Family
            </h1>
          </div>
          <p className="max-w-xl text-[15px] md:text-[17px] leading-relaxed text-[#555] tracking-tight">
            Director-led. Los Angeles, New York, São Paulo, Curitiba.
          </p>
        </div>

        {featuredDirectors.length === 0 ? (
          <EmptyMessage message="No directors published yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {featuredDirectors.map((d) => (
              <DirectorCard
                key={d.id}
                slug={d.slug}
                name={d.name}
                positioning={d.categories?.[0] ?? null}
                stillUrl={d.stillUrl}
                muxPlaybackId={d.cardPlaybackId}
                playProjectId={d.playProjectId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-[#E8E7E3]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 lg:py-32">
          <div className="flex items-end justify-between gap-6 mb-12">
            <h2 className="text-[40px] md:text-[56px] font-bold text-[#1A1A1A] font-helveticaDisplay leading-[0.95]">
              Latest work
            </h2>
            <Link
              href="/site/work"
              className="text-[12px] uppercase tracking-[0.14em] text-[#666] hover:text-[#1A1A1A] transition-colors"
            >
              View archive →
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyMessage message="No projects published yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-14">
              {recentProjects.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i, 4) * 0.05}>
                  <ProjectCard project={p} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-[#E8E7E3] py-16 text-center">
      <p className="text-[13px] text-[#999]">{message}</p>
    </div>
  );
}
