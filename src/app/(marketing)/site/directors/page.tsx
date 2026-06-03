import type { Metadata } from "next";
import { DirectorCard } from "@/components/marketing/director-card";
import { RevealText } from "@/components/marketing/reveal-text";
import { getCanonicalDirectors } from "@/lib/marketing/canonical-source";

export const metadata: Metadata = {
  title: "Directors",
  description:
    "Meet the Friends & Family roster of directors and explore their commercial, film, and branded moving-image work.",
  alternates: { canonical: "/site/directors" },
};
export default async function DirectorsPage() {
  const directors = getCanonicalDirectors().map((director) => {
    const heroProject = director.portfolio[0] ?? null;
    return {
      ...director,
      stillUrl: heroProject?.thumbnailUrl ?? director.imageUrl,
      cardPlaybackId: null,
      sourceVideoUrl: heroProject?.sourceVideoUrl ?? null,
      playProjectId: heroProject?.sourceVideoUrl ? heroProject.id : null,
    };
  });

  return (
    <div className="ff-shell ff-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page">
          <RevealText text="Directors" />
        </h1>
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
              positioning={null}
              stillUrl={d.stillUrl}
              muxPlaybackId={d.cardPlaybackId}
              sourceVideoUrl={d.sourceVideoUrl}
              playProjectId={d.playProjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
