import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/marketing/project-card";
import { RevealText } from "@/components/marketing/reveal-text";
import {
  type CanonicalContentType,
  type CanonicalProject,
  getCanonicalDirector,
  getCanonicalWork,
} from "@/lib/marketing/canonical-source";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore Friends & Family director work across commercials, case studies, films, production, post, animation, and VFX.",
  alternates: { canonical: "/site/work" },
};
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

function getWork(contentType: CanonicalContentType | null) {
  const items = getCanonicalWork(contentType);
  return { items, totalCount: items.length };
}

function normalizeProjectKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDirectorPortfolioPlayId(project: CanonicalProject) {
  const director = getCanonicalDirector(project.director.slug);
  const brand = normalizeProjectKey(project.brand);
  const title = normalizeProjectKey(project.title);

  return (
    director?.portfolio.find(
      (p) =>
        normalizeProjectKey(p.brand) === brand &&
        normalizeProjectKey(p.title) === title,
    )?.id ?? null
  );
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const active = resolveDiscipline(searchParams.type);
  const activeDiscipline = DISCIPLINES.find((d) => d.slug === active)!;
  const { items, totalCount } = getWork(activeDiscipline.contentType);

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

      <nav aria-label="Filter by discipline" className="ff-filter-nav">
        {DISCIPLINES.map((d, i) => {
          const isActive = d.slug === active;
          const href =
            d.slug === "all" ? "/site/work" : `/site/work?type=${d.slug}`;
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
                  isActive ? "ff-filter-link-active" : "text-ff-muted",
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
          {items.map((p, index) => {
            const disciplineLabel = DISCIPLINES.find(
              (d) => d.contentType === p.contentType,
            )?.label;
            return (
              <ProjectCard
                key={p.id}
                project={{
                  ...p,
                  playProjectId: getDirectorPortfolioPlayId(p),
                }}
                disciplineLabel={disciplineLabel ?? null}
                showYear
                imagePriority={index < 3}
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
