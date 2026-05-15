import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { DirectorCard } from "@/components/marketing/director-card";

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
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-32 lg:pt-40 pb-24">
      <header className="flex items-baseline justify-between gap-6 mb-16">
        <h1 className="text-[56px] md:text-[80px] font-bold text-[#1A1A1A] font-helveticaDisplay leading-[0.95]">
          Directors
        </h1>
        <p className="text-[12px] uppercase tracking-[0.14em] text-[#999]">
          {directors.length} on roster
        </p>
      </header>

      {directors.length === 0 ? (
        <div className="border border-dashed border-[#E8E7E3] py-24 text-center">
          <p className="text-[14px] text-[#999]">No directors published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
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
