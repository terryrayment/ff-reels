import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { DirectorCard } from "@/components/marketing/director-card";
import { RevealText } from "@/components/marketing/reveal-text";

export const metadata: Metadata = { title: "Directors" };
export const revalidate = 300;

async function getDirectors() {
  const directors = await prisma.director.findMany({
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
  });

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

  return directors.map((d) => {
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
}

export default async function DirectorsPage() {
  const directors = await getDirectors();

  return (
    <div className="ff-shell ff-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page">
          <RevealText text="Directors" />
        </h1>
        <p className="ff-kicker">
          {directors.length} on roster
        </p>
      </header>

      {directors.length === 0 ? (
        <div className="ff-empty-state">
          <p>No directors published yet.</p>
        </div>
      ) : (
        <div className="ff-grid-directors">
          {directors.map((d) => (
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
    </div>
  );
}
