import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/marketing/project-card";
import { FeaturedReel } from "@/components/marketing/featured-reel";
import { RevealText } from "@/components/marketing/reveal-text";

interface Props {
  params: { slug: string };
  searchParams: { play?: string };
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await prisma.director.findUnique({
    where: { slug: params.slug },
    select: { name: true, bio: true, statement: true },
  });
  if (!d) return { title: "Director not found" };
  return {
    title: d.name,
    description: d.statement ?? d.bio ?? `${d.name} — Friends & Family`,
  };
}

async function getDirector(slug: string) {
  return prisma.director.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      statement: true,
      videoIntroUrl: true,
      categories: true,
      awards: true,
      pressLinks: true,
      clientLogos: true,
      isActive: true,
      rosterStatus: true,
      projects: {
        where: { muxStatus: "ready" },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          brand: true,
          agency: true,
          year: true,
          thumbnailUrl: true,
          muxPlaybackId: true,
          category: true,
          contentType: true,
        },
      },
    },
  });
}

type DirectorRecord = NonNullable<Awaited<ReturnType<typeof getDirector>>>;
type ProjectRow = DirectorRecord["projects"][number];

function groupProjects(projects: ProjectRow[]) {
  const order: Record<string, number> = {
    SPOT: 0,
    CASE_STUDY: 1,
    SHORT_FILM: 2,
  };
  const labels: Record<string, string> = {
    SPOT: "Commercials",
    CASE_STUDY: "Case Studies",
    SHORT_FILM: "Films",
  };
  const groups = new Map<string, ProjectRow[]>();
  for (const p of projects) {
    const k = p.contentType ?? "SPOT";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  return Array.from(groups.entries())
    .sort((a, b) => (order[a[0]] ?? 99) - (order[b[0]] ?? 99))
    .map(([key, items]) => ({ key, label: labels[key] ?? key, items }));
}

export default async function DirectorDetailPage({ params, searchParams }: Props) {
  const director = await getDirector(params.slug);
  if (!director || !director.isActive) notFound();

  const playId = typeof searchParams.play === "string" ? searchParams.play : null;
  const featuredProject =
    playId && director.projects.find((p) => p.id === playId && p.muxPlaybackId)
      ? director.projects.find((p) => p.id === playId && p.muxPlaybackId)!
      : null;

  const visibleProjects = featuredProject
    ? director.projects.filter((p) => p.id !== featuredProject.id)
    : director.projects;
  const featuredPosterUrl =
    featuredProject?.thumbnailUrl ??
    (featuredProject?.muxPlaybackId
      ? `https://image.mux.com/${featuredProject.muxPlaybackId}/thumbnail.jpg?width=1280`
      : null);

  const grouped = groupProjects(visibleProjects);
  const positioning = director.categories?.[0] ?? null;
  const awards = Array.isArray(director.awards) ? director.awards : [];
  const press = Array.isArray(director.pressLinks) ? director.pressLinks : [];

  return (
    <article className="pt-[88px] lg:pt-[104px] pb-24">
      <div className="marketing-transition-reveal" data-marketing-transition-reveal>
        <header className="ff-shell mb-8 lg:mb-10">
          {positioning && (
            <p className="ff-kicker-muted mb-3">
              {positioning}
            </p>
          )}
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

      {!featuredProject && director.videoIntroUrl && (
        <FeaturedReel
          projectId={`intro-${director.slug}`}
          muxPlaybackId={director.videoIntroUrl}
          brand={null}
          title={`${director.name} — Reel`}
        />
      )}

      <div className="marketing-transition-reveal" data-marketing-transition-reveal>
        <section className="ff-shell mb-14">
          <details className="group border-y ff-rule" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-ff-micro uppercase tracking-ff-micro text-ff-muted transition-colors hover:text-ff-ink [&::-webkit-details-marker]:hidden">
              <span>Bio</span>
              <span className="ff-accordion-mark group-open:hidden">
                +
              </span>
              <span className="ff-accordion-mark hidden group-open:block">
                -
              </span>
            </summary>
            <div className="ff-section-grid pb-10">
              <div className="ff-label-column">
                <p className="ff-kicker">
                  About {director.name}
                </p>
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
                {director.statement && (
                  <blockquote className="ff-quote whitespace-pre-line">
                    {director.statement}
                  </blockquote>
                )}
              </div>
            </div>
          </details>
        </section>

        {grouped.length > 0 && (
          <section className="ff-shell">
            <div className="mb-9 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <h2 className="ff-display-section">
                Work gallery
              </h2>
              <p className="ff-kicker">
                {director.projects.length}{" "}
                {director.projects.length === 1 ? "film" : "films"}
              </p>
            </div>
            {grouped.map((group) => (
              <div key={group.key} className="mb-20 last:mb-0">
                <p className="ff-kicker-muted mb-8">
                  {group.label}
                </p>
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

        {(awards.length > 0 || press.length > 0) && (
          <section className="ff-shell ff-section-stack ff-section-border">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {awards.length > 0 && (
                <div>
                  <p className="ff-kicker-muted mb-6">
                    Selected awards
                  </p>
                  <ul className="space-y-2 text-ff-small text-ff-ink">
                    {awards.slice(0, 12).map((a: unknown, i: number) => (
                      <li key={i}>{typeof a === "string" ? a : JSON.stringify(a)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {press.length > 0 && (
                <div>
                  <p className="ff-kicker-muted mb-6">
                    Press
                  </p>
                  <ul className="space-y-2 text-ff-small">
                    {press.slice(0, 12).map((p: unknown, i: number) => {
                      if (typeof p === "string") {
                        return (
                          <li key={i}>
                            <a
                              href={p}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ff-ink hover:text-ff-muted underline underline-offset-4"
                            >
                              {p}
                            </a>
                          </li>
                        );
                      }
                      const obj = p as { url?: string; label?: string; title?: string };
                      if (obj && typeof obj === "object" && obj.url) {
                        return (
                          <li key={i}>
                            <a
                              href={obj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ff-ink hover:text-ff-muted underline underline-offset-4"
                            >
                              {obj.label ?? obj.title ?? obj.url}
                            </a>
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="ff-shell ff-section-stack ff-section-border">
          <Link
            href="/site/directors"
            className="ff-link-small"
          >
            ← All directors
          </Link>
        </div>
      </div>
    </article>
  );
}
