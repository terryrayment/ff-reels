import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DirectorCard } from "@/components/marketing/director-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { ProjectCard } from "@/components/marketing/project-card";
import { shouldUseMarketingProductionFallback } from "@/lib/marketing/prisma-fallback";
import { getFriendsAndFamilyProductionHomepage } from "@/lib/marketing/production-fallback";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Creative Studio" },
  description:
    "Friends & Family is a creative studio for directors, production, post, animation, and VFX across Los Angeles, New York, Sao Paulo, and Curitiba.",
  alternates: { canonical: "/site" },
};

export const revalidate = 300;

const PROJECT_TAG_SETS = [
  ["Direction", "Production", "Campaign"],
  ["Creative Direction", "Edit", "Finish"],
  ["Post", "Animation", "VFX"],
  ["Culture", "Design", "Motion"],
] as const;

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

async function getHomepageData() {
  try {
    const [directors, recentProjects] = await Promise.all([
    prisma.director.findMany({
      where: { isActive: true, rosterStatus: "ROSTER" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
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
  } catch (error) {
    if (!shouldUseMarketingProductionFallback(error)) throw error;
    return getFriendsAndFamilyProductionHomepage();
  }
}

export default async function MarketingHomePage() {
  const { featuredDirectors, recentProjects } = await getHomepageData();

  return (
    <>
      <section className="ff-shell ff-page">
        <h1 className="sr-only">Friends &amp; Family</h1>
        {featuredDirectors.length === 0 ? (
          <EmptyMessage message="No directors published yet." />
        ) : (
          <div className="ff-grid-directors">
            {featuredDirectors.map((d, i) => (
              <DirectorCard
                key={d.id}
                slug={d.slug}
                name={d.name}
                positioning={null}
                stillUrl={d.stillUrl}
                muxPlaybackId={d.cardPlaybackId}
                playProjectId={d.playProjectId}
                indexLabel={formatIndex(i)}
                indexMeta="Director"
                tags={["Director"]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t ff-rule">
        <div className="ff-shell ff-section-y">
          <div className="ff-page-heading-row">
            <h2 className="ff-display-section">
              Selected work
            </h2>
            <Magnetic>
              <Link
                href="/site/work"
                className="ff-link-small"
                data-cursor="link"
              >
                View archive →
              </Link>
            </Magnetic>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyMessage message="No projects published yet." />
          ) : (
            <div className="ff-grid-work md:grid-cols-4">
              {recentProjects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  indexLabel={formatIndex(i)}
                  indexMeta={p.brand ?? "Work"}
                  tags={PROJECT_TAG_SETS[i % PROJECT_TAG_SETS.length]}
                />
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
