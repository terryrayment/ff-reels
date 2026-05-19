import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/marketing/project-card";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { FeaturedReel } from "@/components/marketing/featured-reel";

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

  const grouped = groupProjects(visibleProjects);
  const positioning = director.categories?.[0] ?? null;
  const awards = Array.isArray(director.awards) ? director.awards : [];
  const press = Array.isArray(director.pressLinks) ? director.pressLinks : [];

  return (
    <article className="pt-[88px] lg:pt-[104px] pb-24">
      {featuredProject?.muxPlaybackId && (
        <FeaturedReel
          projectId={featuredProject.id}
          muxPlaybackId={featuredProject.muxPlaybackId}
          brand={featuredProject.brand}
          title={featuredProject.title}
          directorName={director.name}
          agency={featuredProject.agency}
          year={featuredProject.year}
        />
      )}

      {!featuredProject && director.videoIntroUrl && (
        <FeaturedReel
          projectId={`intro-${director.slug}`}
          muxPlaybackId={director.videoIntroUrl}
          brand={null}
          title={`${director.name} — Reel`}
          directorName={director.name}
          agency={null}
          year={null}
        />
      )}

      <div className="marketing-transition-reveal" data-marketing-transition-reveal>
        <header className="ff-shell mb-12 lg:mb-14">
          {positioning && (
            <p className="ff-kicker-muted mb-3">
              {positioning}
            </p>
          )}
          <h1
            className="ff-display-director"
            style={
              {
                viewTransitionName: `director-name-${director.slug}`,
              } as React.CSSProperties
            }
          >
            {director.name}
          </h1>
        </header>

        <section className="ff-shell mb-14">
          <details className="group border-y ff-rule">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-ff-micro uppercase tracking-ff-micro text-ff-muted transition-colors hover:text-ff-ink [&::-webkit-details-marker]:hidden">
              <span>Bio</span>
              <span className="text-[18px] leading-none text-ff-ink group-open:hidden">
                +
              </span>
              <span className="hidden text-[18px] leading-none text-ff-ink group-open:block">
                -
              </span>
            </summary>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10">
              <div className="lg:col-span-3">
                <p className="ff-kicker">
                  About {director.name}
                </p>
              </div>
              <div className="lg:col-span-7 space-y-6">
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
                  <blockquote className="border-l-2 border-ff-ink pl-6 text-[16px] leading-relaxed text-ff-copy italic whitespace-pre-line">
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
                <h2 className="ff-kicker mb-8">
                  {group.label}
                </h2>
                <div className="ff-grid-work">
                  {group.items.map((p, i) => (
                    <ScrollReveal key={p.id} delay={Math.min(i, 4) * 0.05}>
                      <ProjectCard
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
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {(awards.length > 0 || press.length > 0) && (
          <section className="ff-shell mt-24 border-t ff-rule pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {awards.length > 0 && (
                <div>
                  <h2 className="ff-kicker mb-6">
                    Selected awards
                  </h2>
                  <ul className="space-y-2 text-ff-small text-ff-ink">
                    {awards.slice(0, 12).map((a: unknown, i: number) => (
                      <li key={i}>{typeof a === "string" ? a : JSON.stringify(a)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {press.length > 0 && (
                <div>
                  <h2 className="ff-kicker mb-6">
                    Press
                  </h2>
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

        <div className="ff-shell mt-24 border-t ff-rule pt-10">
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
