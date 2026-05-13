import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Work" };
export const revalidate = 300;

const DISCIPLINES = [
  { slug: "all", label: "All", contentType: null },
  { slug: "commercials", label: "Commercials", contentType: "SPOT" },
  { slug: "case-studies", label: "Case studies", contentType: "CASE_STUDY" },
  { slug: "films", label: "Films", contentType: "SHORT_FILM" },
] as const;

type DisciplineSlug = (typeof DISCIPLINES)[number]["slug"];

function resolveDiscipline(raw: string | undefined): DisciplineSlug {
  if (!raw) return "all";
  const match = DISCIPLINES.find((d) => d.slug === raw);
  return match?.slug ?? "all";
}

async function getWork(contentType: string | null) {
  const where = {
    muxStatus: "ready",
    director: { isActive: true, rosterStatus: "ROSTER" as const },
    ...(contentType ? { contentType } : {}),
  };

  const [items, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: 80,
      select: {
        id: true,
        title: true,
        brand: true,
        year: true,
        contentType: true,
        thumbnailUrl: true,
        muxPlaybackId: true,
        director: { select: { slug: true, name: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return { items, totalCount };
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const active = resolveDiscipline(searchParams.type);
  const activeDiscipline = DISCIPLINES.find((d) => d.slug === active)!;
  const { items, totalCount } = await getWork(activeDiscipline.contentType);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-32 lg:pt-40 pb-24">
      <header className="mb-12 flex items-baseline justify-between gap-6">
        <h1 className="text-[40px] md:text-[56px] tracking-tight-3 font-light text-[#1A1A1A]">
          Work
        </h1>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#999]">
          {totalCount} {totalCount === 1 ? "project" : "projects"}
        </p>
      </header>

      <nav
        aria-label="Filter by discipline"
        className="mb-12 -mx-1 flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-[#E8E7E3] pb-4"
      >
        {DISCIPLINES.map((d, i) => {
          const isActive = d.slug === active;
          const href = d.slug === "all" ? "/site/work" : `/site/work?type=${d.slug}`;
          return (
            <span key={d.slug} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="px-2 text-[10px] text-[#CBCAC6]">
                  ·
                </span>
              )}
              <Link
                href={href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.16em] px-1 py-1 transition-colors",
                  isActive
                    ? "text-[#1A1A1A] underline underline-offset-[6px] decoration-[#1A1A1A]"
                    : "text-[#666] hover:text-[#1A1A1A]",
                )}
              >
                {d.label}
              </Link>
            </span>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="border border-dashed border-[#E8E7E3] py-24 text-center">
          <p className="text-[14px] text-[#999]">
            No projects in this view.{" "}
            <Link href="/site/work" className="underline">
              See all
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-14">
          {items.map((p) => {
            const still =
              p.thumbnailUrl ??
              (p.muxPlaybackId
                ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=1000`
                : null);
            const disciplineLabel = DISCIPLINES.find(
              (d) => d.contentType === p.contentType,
            )?.label;
            return (
              <Link
                key={p.id}
                href={`/site/directors/${p.director.slug}`}
                className="group block"
              >
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
                  <p className="text-[12px] tracking-tight text-[#666] mt-2">
                    Dir. {p.director.name}
                    {p.year || disciplineLabel ? (
                      <span className="text-[#999]">
                        {" · "}
                        {[disciplineLabel, p.year].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {items.length > 0 && items.length < totalCount && (
        <p className="mt-12 text-[11px] uppercase tracking-[0.14em] text-[#999] text-center">
          Showing {items.length} of {totalCount}
        </p>
      )}
    </div>
  );
}
