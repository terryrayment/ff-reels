import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/marketing/project-card";
import { FeaturedReel } from "@/components/marketing/featured-reel";
import { RevealText } from "@/components/marketing/reveal-text";
import {
  type CanonicalProject,
  getCanonicalDirector,
} from "@/lib/marketing/canonical-source";

interface Props {
  params: { slug: string };
  searchParams: { play?: string };
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const director = getCanonicalDirector(params.slug);
  if (!director) return { title: "Director not found" };
  return {
    title: director.name,
    description: director.bio ?? `${director.name} — Friends & Family`,
    alternates: { canonical: `/site/directors/${params.slug}` },
  };
}

type ProjectRow = CanonicalProject;

function groupProjects(projects: ProjectRow[]) {
  return [{ key: "source-order", label: "Selected work", items: projects }];
}

export default async function DirectorDetailPage({
  params,
  searchParams,
}: Props) {
  const director = getCanonicalDirector(params.slug);
  if (!director) notFound();

  const playId =
    typeof searchParams.play === "string" ? searchParams.play : null;
  const featuredProject =
    director.portfolio.find(
      (p) => p.id === playId && (p.muxPlaybackId || p.sourceVideoUrl),
    ) ?? null;

  const visibleProjects = featuredProject
    ? director.portfolio.filter((p) => p.id !== featuredProject.id)
    : director.portfolio;
  const featuredPosterUrl = featuredProject?.muxPlaybackId
    ? `https://image.mux.com/${featuredProject.muxPlaybackId}/thumbnail.jpg?width=1280`
    : (featuredProject?.thumbnailUrl ?? null);

  const grouped = groupProjects(visibleProjects);

  return (
    <article className="pt-[88px] lg:pt-[104px] pb-24">
      <div
        className="marketing-transition-reveal"
        data-marketing-transition-reveal
      >
        <header className="ff-shell mb-8 lg:mb-10">
          <h1
            className="ff-display-director"
            data-marketing-director-name-target={director.slug}
          >
            <RevealText text={director.name} />
          </h1>
        </header>
      </div>

      {featuredProject?.muxPlaybackId && (
        <FeaturedReel
          projectId={featuredProject.id}
          muxPlaybackId={featuredProject.muxPlaybackId}
          posterUrl={featuredPosterUrl}
          brand={featuredProject.brand}
          title={featuredProject.title}
        />
      )}

      {featuredProject?.sourceVideoUrl && !featuredProject.muxPlaybackId && (
        <SourceVideoReel project={featuredProject} />
      )}

      <div
        className="marketing-transition-reveal"
        data-marketing-transition-reveal
      >
        <section className="ff-shell mb-14">
          <details className="group border-y ff-rule" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-ff-micro uppercase tracking-ff-micro text-ff-muted transition-colors hover:text-ff-ink [&::-webkit-details-marker]:hidden">
              <span>Bio</span>
              <span className="ff-accordion-mark group-open:hidden">+</span>
              <span className="ff-accordion-mark hidden group-open:block">
                -
              </span>
            </summary>
            <div className="ff-section-grid pb-10">
              <div className="ff-label-column">
                <p className="ff-kicker">About {director.name}</p>
              </div>
              <div className="ff-copy-column space-y-6">
                {director.bio ? (
                  <p className="ff-body whitespace-pre-line text-ff-ink">
                    {director.bio}
                  </p>
                ) : (
                  <p className="ff-body">
                    More background is being added to this profile.
                  </p>
                )}
              </div>
            </div>
          </details>
        </section>

        {grouped.length > 0 && (
          <section className="ff-shell">
            <div className="mb-9 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <h2 className="ff-display-section">Work gallery</h2>
              <p className="ff-kicker">
                {director.portfolio.length}{" "}
                {director.portfolio.length === 1 ? "film" : "films"}
              </p>
            </div>
            {grouped.map((group) => (
              <div key={group.key} className="mb-20 last:mb-0">
                <p className="ff-kicker-muted mb-8">{group.label}</p>
                <div className="ff-grid-work">
                  {group.items.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={{
                        id: p.id,
                        title: p.title,
                        brand: p.brand,
                        year: p.year,
                        agency: p.agency,
                        thumbnailUrl: p.thumbnailUrl,
                        muxPlaybackId: p.muxPlaybackId,
                        sourceVideoUrl: p.sourceVideoUrl,
                        director: { slug: director.slug, name: director.name },
                      }}
                      showDirector={false}
                      showAgency
                      showYear
                      thumbnailWidth={1280}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="ff-shell ff-section-stack ff-section-border">
          <Link href="/site/directors" className="ff-link-small">
            ← All directors
          </Link>
        </div>
      </div>
    </article>
  );
}

function SourceVideoReel({ project }: { project: CanonicalProject }) {
  return (
    <section className="ff-shell mb-12">
      <div className="overflow-hidden bg-black">
        <video
          className="aspect-video w-full object-cover"
          src={project.sourceVideoUrl ?? undefined}
          poster={project.thumbnailUrl ?? undefined}
          controls
          playsInline
          preload="metadata"
        />
      </div>
      <p className="ff-kicker-muted mt-4">
        {project.brand} — {project.title}
      </p>
    </section>
  );
}
