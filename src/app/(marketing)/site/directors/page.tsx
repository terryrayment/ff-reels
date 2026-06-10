import type { Metadata } from "next";
import { DirectorsList } from "@/components/marketing/directors-list";
import { getCanonicalDirectors } from "@/lib/marketing/canonical-source";
import { getHeroPlayProjectId } from "@/lib/marketing/play-project-id";

export const metadata: Metadata = {
  title: "Directors",
  description:
    "Meet the Friends & Family roster of high-end commercial directors creating global campaigns for top brands and agencies.",
  alternates: { canonical: "/site/directors" },
};

export default function DirectorsPage() {
  const directors = getCanonicalDirectors().map((director) => {
    const heroProject = director.portfolio[0] ?? null;
    return {
      slug: director.slug,
      name: director.name,
      stillUrl: heroProject?.thumbnailUrl ?? director.imageUrl ?? null,
      muxPlaybackId: heroProject?.muxPlaybackId ?? null,
      sourceVideoUrl: heroProject?.sourceVideoUrl ?? null,
      playProjectId: getHeroPlayProjectId(heroProject),
    };
  });

  if (directors.length === 0) {
    return (
      <div className="ff-shell ff-page">
        <div className="ff-empty-state">
          <p>No directors published yet.</p>
        </div>
      </div>
    );
  }

  return <DirectorsList directors={directors} />;
}
