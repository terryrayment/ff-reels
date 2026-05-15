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
    <article className="pt-24 lg:pt-28 pb-24">
      {featuredProject?.muxPlaybackId && (
        <FeaturedReel
          projectId={featuredProject.id}
          muxPlaybackId={featuredProject.muxPlaybackId}
          brand={featuredProject.brand}
          title={featuredProject.title}
          directorName={director.name}
          agency={featuredProject.agency}
          year={featuredProject.year}
          transitionName={`project-${featuredProject.id}`}
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
          transitionName={`director-reel-${director.slug}`}
        />
      )}

      <header className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-14 lg:mb-18">
        {positioning && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#666] mb-3">
            {positioning}
          </p>
        )}
        <h1
          className="text-[52px] md:text-[88px] lg:text-[116px] leading-[0.9] font-black text-[#1A1A1A] font-helveticaDisplay"
          style={
            {
              viewTransitionName: `director-name-${director.slug}`,
            } as React.CSSProperties
          }
        >
          {director.name}
        </h1>
      </header>

      {grouped.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <h2 className="text-[30px] md:text-[40px] font-light text-[#1A1A1A] font-helveticaDisplay leading-none">
              Work gallery
            </h2>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#999]">
              {director.projects.length}{" "}
              {director.projects.length === 1 ? "film" : "films"}
            </p>
          </div>
          {grouped.map((group) => (
            <div key={group.key} className="mb-20 last:mb-0">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-8">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-14">
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

      {(director.bio || director.statement) && (
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-24 pt-16 border-t border-[#E8E7E3]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
                About
              </p>
            </div>
            <div className="lg:col-span-7 space-y-6">
              {director.bio && (
                <p className="text-[17px] md:text-[19px] leading-relaxed tracking-tight-2 text-[#1A1A1A] whitespace-pre-line">
                  {director.bio}
                </p>
              )}
              {director.statement && (
                <blockquote className="border-l-2 border-[#1A1A1A] pl-6 text-[16px] leading-relaxed text-[#444] italic whitespace-pre-line">
                  {director.statement}
                </blockquote>
              )}
            </div>
          </div>
        </section>
      )}

      {(awards.length > 0 || press.length > 0) && (
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-24 pt-16 border-t border-[#E8E7E3]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {awards.length > 0 && (
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-6">
                  Selected awards
                </h2>
                <ul className="space-y-2 text-[14px] tracking-tight-2 text-[#1A1A1A]">
                  {awards.slice(0, 12).map((a: unknown, i: number) => (
                    <li key={i}>{typeof a === "string" ? a : JSON.stringify(a)}</li>
                  ))}
                </ul>
              </div>
            )}
            {press.length > 0 && (
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-6">
                  Press
                </h2>
                <ul className="space-y-2 text-[14px] tracking-tight-2">
                  {press.slice(0, 12).map((p: unknown, i: number) => {
                    if (typeof p === "string") {
                      return (
                        <li key={i}>
                          <a
                            href={p}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1A1A1A] hover:text-[#666] underline underline-offset-4"
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
                            className="text-[#1A1A1A] hover:text-[#666] underline underline-offset-4"
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

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-24 pt-10 border-t border-[#E8E7E3]">
        <Link
          href="/site/directors"
          className="text-[12px] uppercase tracking-[0.14em] text-[#666] hover:text-[#1A1A1A] transition-colors"
        >
          ← All directors
        </Link>
      </div>
    </article>
  );
}
