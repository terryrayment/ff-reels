import type { Metadata } from "next";
import Link from "next/link";
import { DirectorCard } from "@/components/marketing/director-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { ProjectCard } from "@/components/marketing/project-card";
import {
  getCanonicalDirectors,
  getCanonicalWork,
} from "@/lib/marketing/canonical-source";
import { getHeroPlayProjectId } from "@/lib/marketing/play-project-id";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Creative Studio" },
  description:
    "Friends & Family is a creative studio for directors, production, post, animation, and VFX across Los Angeles, New York, Sao Paulo, and Curitiba.",
  alternates: { canonical: "/site" },
};

const PROJECT_TAG_SETS = [
  ["Direction", "Production", "Campaign"],
  ["Creative Direction", "Edit", "Finish"],
  ["Post", "Animation", "VFX"],
  ["Culture", "Design", "Motion"],
] as const;

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default async function MarketingHomePage() {
  const featuredDirectors = getCanonicalDirectors().map((director) => {
    const heroProject = director.portfolio[0] ?? null;
    return {
      ...director,
      stillUrl: heroProject?.thumbnailUrl ?? director.imageUrl,
      cardPlaybackId: heroProject?.muxPlaybackId ?? null,
      sourceVideoUrl: heroProject?.sourceVideoUrl ?? null,
      playProjectId: getHeroPlayProjectId(heroProject),
    };
  });
  const recentProjects = getCanonicalWork().slice(0, 8);

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
                sourceVideoUrl={d.sourceVideoUrl}
                playProjectId={d.playProjectId}
                indexLabel={formatIndex(i)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t ff-rule">
        <div className="ff-shell ff-section-y">
          <div className="ff-page-heading-row">
            <h2 className="ff-display-section">Selected work</h2>
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
