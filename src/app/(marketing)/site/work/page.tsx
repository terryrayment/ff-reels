import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/marketing/project-card";
import { RevealText } from "@/components/marketing/reveal-text";
import { shouldUseMarketingProductionFallback } from "@/lib/marketing/prisma-fallback";
import { getFriendsAndFamilyProductionWork } from "@/lib/marketing/production-fallback";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore Friends & Family director work across commercials, case studies, films, production, post, animation, and VFX.",
  alternates: { canonical: "/site/work" },
};
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

  try {
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
  } catch (error) {
    if (!shouldUseMarketingProductionFallback(error)) throw error;
    return getFriendsAndFamilyProductionWork(contentType);
  }
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
    <div className="ff-shell ff-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page">
          <RevealText text="Work" />
        </h1>
        <p className="ff-kicker">
          {totalCount} {totalCount === 1 ? "project" : "projects"}
        </p>
      </header>

      <nav
        aria-label="Filter by discipline"
        className="ff-filter-nav"
      >
        {DISCIPLINES.map((d, i) => {
          const isActive = d.slug === active;
          const href = d.slug === "all" ? "/site/work" : `/site/work?type=${d.slug}`;
          return (
            <span key={d.slug} className="flex items-center">
              {i > 0 && (
                <span aria-hidden className="px-2 text-ff-label text-ff-line">
                  ·
                </span>
              )}
              <Link
                href={href}
                className={cn(
                  "ff-filter-link",
                  isActive
                    ? "ff-filter-link-active"
                    : "text-ff-muted",
                )}
              >
                {d.label}
              </Link>
            </span>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="ff-empty-state">
          <p>
            No projects in this view.{" "}
            <Link href="/site/work" className="underline">
              See all
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="ff-grid-work">
          {items.map((p) => {
            const disciplineLabel = DISCIPLINES.find(
              (d) => d.contentType === p.contentType,
            )?.label;
            return (
              <ProjectCard
                key={p.id}
                project={p}
                disciplineLabel={disciplineLabel ?? null}
                showYear
              />
            );
          })}
        </div>
      )}

      {items.length > 0 && items.length < totalCount && (
        <p className="ff-kicker mt-12 text-center">
          {items.length} most recent
        </p>
      )}
    </div>
  );
}
