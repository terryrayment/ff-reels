import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

interface Props {
  params: { slug: string };
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

export default async function DirectorDetailPage({ params }: Props) {
  const director = await getDirector(params.slug);
  if (!director || !director.isActive) notFound();

  const grouped = groupProjects(director.projects);
  const positioning = director.categories?.[0] ?? null;
  const awards = Array.isArray(director.awards) ? director.awards : [];
  const press = Array.isArray(director.pressLinks) ? director.pressLinks : [];

  return (
    <article className="pt-32 lg:pt-40 pb-24">
      <header className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-12 lg:mb-16">
        {positioning && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#666] mb-4">
            {positioning}
          </p>
        )}
        <h1 className="text-[44px] md:text-[88px] lg:text-[120px] leading-[0.92] tracking-tight-3 font-light text-[#1A1A1A] font-helveticaDisplay">
          {director.name}
        </h1>
      </header>

      {director.videoIntroUrl && (
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-16 lg:mb-24">
          <div className="relative aspect-video overflow-hidden bg-[#0A0A0A]">
            <video
              src={`https://stream.mux.com/${director.videoIntroUrl}/high.mp4`}
              poster={`https://image.mux.com/${director.videoIntroUrl}/thumbnail.jpg?width=1920`}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {(director.bio || director.statement) && (
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-20 lg:mb-32">
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

      {grouped.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10">
          {grouped.map((group) => (
            <div key={group.key} className="mb-20 last:mb-0">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-8">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-14">
                {group.items.map((p) => {
                  const still =
                    p.thumbnailUrl ??
                    (p.muxPlaybackId
                      ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=1280`
                      : null);
                  return (
                    <div key={p.id} className="group">
                      <div className="relative aspect-video overflow-hidden bg-[#EEEDEA]">
                        {still && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={still}
                            alt={p.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.015] group-hover:opacity-95"
                          />
                        )}
                      </div>
                      <div className="mt-4">
                        {p.brand && (
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1A1A1A] font-medium">
                            {p.brand}
                          </p>
                        )}
                        <p className="text-[18px] md:text-[20px] tracking-tight-2 font-light text-[#1A1A1A] leading-[1.15] mt-1">
                          {p.title}
                        </p>
                        {(p.agency || p.year) && (
                          <p className="text-[12px] tracking-tight text-[#666] mt-2">
                            {p.agency ? `${p.agency}` : ""}
                            {p.year ? `${p.agency ? " · " : ""}${p.year}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
