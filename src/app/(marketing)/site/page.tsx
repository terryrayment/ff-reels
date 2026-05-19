import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DirectorCard } from "@/components/marketing/director-card";
import { ProjectCard } from "@/components/marketing/project-card";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Creative Network" },
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
      <section className="ff-shell ff-page">
        <div className="ff-hero-heading-row">
          <div>
            <p className="ff-kicker mb-3">
              A creative network
            </p>
            <h1 className="ff-display-hero">
              Friends &amp; Family
            </h1>
          </div>
          <p className="ff-body max-w-lg">
            Director-led. Los Angeles, New York, São Paulo, Curitiba.
          </p>
        </div>

        {featuredDirectors.length === 0 ? (
          <EmptyMessage message="No directors published yet." />
        ) : (
          <div className="ff-grid-directors">
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

      <section className="border-t ff-rule">
        <div className="ff-shell ff-section-y">
          <div className="ff-page-heading-row">
            <h2 className="ff-display-section">
              Latest work
            </h2>
            <Link
              href="/site/work"
              className="ff-link-small"
            >
              View archive →
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyMessage message="No projects published yet." />
          ) : (
            <div className="ff-grid-work">
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
    <div className="ff-empty-state">
      <p>{message}</p>
    </div>
  );
}
