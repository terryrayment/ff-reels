import type { Metadata } from "next";
import Link from "next/link";
import { DirectorCard } from "@/components/marketing/director-card";
import { ProjectCard } from "@/components/marketing/project-card";
import {
  getCanonicalDirector,
  getCanonicalWork,
} from "@/lib/marketing/canonical-source";
import { getHeroPlayProjectId } from "@/lib/marketing/play-project-id";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Commercial Production" },
  description:
    "Friends & Family is a commercial production company representing directors, creators, and culture-makers.",
  alternates: { canonical: "/site" },
};

const HOME_ROUTES = [
  {
    index: "01",
    label: "Work",
    href: "/site/work",
    description: "Selected films, commercials, and moving-image work.",
  },
  {
    index: "02",
    label: "Talent",
    href: "/site/directors",
    description: "Directors and creators represented by Friends & Family.",
  },
  {
    index: "03",
    label: "The Youth",
    href: "/site/youth",
    description: "Culture-led work, new voices, and youth-facing projects.",
  },
  {
    index: "04",
    label: "Colossal",
    href: "/site/colossal",
    description: "Large-scale creative production and extended worlds.",
  },
  {
    index: "05",
    label: "About",
    href: "/site/about",
    description: "Who we are.",
  },
  {
    index: "06",
    label: "Contact",
    href: "/site/contact",
    description: "Start a project.",
  },
] as const;

/** Homepage-only selection — does not change global Work archive order. */
const FEATURED_WORK_IDS = [
  "source-work-001-caleb-slain-ford-lobo",
  "source-work-003-bueno-citi-can-i-click-it",
  "source-work-002-matt-dilmore-little-caesars-pizza-bot",
  "source-work-055-terry-rayment-cadillac-tree-hunting",
  "source-work-020-james-frost-nike-human-printing-press",
] as const;

/** Homepage-only selection — does not change global Talent roster order. */
const FEATURED_DIRECTOR_SLUGS = [
  "bueno",
  "cody-cloud",
  "caleb-slain",
  "james-frost",
  "terry-rayment",
  "boma-iluma",
] as const;

function getFeaturedWork() {
  const byId = new Map(getCanonicalWork().map((project) => [project.id, project]));
  return FEATURED_WORK_IDS.map((id) => byId.get(id)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project),
  );
}

function getFeaturedDirectors() {
  return FEATURED_DIRECTOR_SLUGS.map((slug) => getCanonicalDirector(slug)).filter(
    (director): director is NonNullable<typeof director> => Boolean(director),
  );
}

export default function MarketingHomePage() {
  const featuredWork = getFeaturedWork();
  const featuredDirectors = getFeaturedDirectors().map((director) => {
    const heroProject = director.portfolio[0] ?? null;
    return {
      director,
      stillUrl: heroProject?.thumbnailUrl ?? director.imageUrl,
      muxPlaybackId: heroProject?.muxPlaybackId ?? null,
      sourceVideoUrl: heroProject?.sourceVideoUrl ?? null,
      playProjectId: getHeroPlayProjectId(heroProject),
    };
  });

  return (
    <div className="ff-home">
      <section className="ff-shell ff-page ff-home-hero">
        <div className="ff-home-statement-row">
          <div>
            <h1 className="ff-display-hero ff-home-statement">Friends &amp; Family</h1>
          </div>
          <p className="ff-body ff-home-statement-side">
            Commercial films, culture work, and director-led production.
          </p>
        </div>
      </section>

      <nav
        className="ff-shell ff-home-route-index"
        aria-label="Explore Friends & Family"
      >
        <ul className="ff-home-route-list">
          {HOME_ROUTES.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className="ff-home-route-link"
                data-cursor="link"
              >
                <span className="ff-home-route-link__index">{route.index}</span>
                <span className="ff-home-route-link__body">
                  <span className="ff-home-route-link__label">{route.label}</span>
                  <span className="ff-home-route-link__desc">
                    {route.description}
                  </span>
                </span>
                <span className="ff-home-route-link__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {featuredWork.length > 0 && (
        <section className="ff-shell ff-home-section ff-section-border">
          <div className="ff-home-section-heading">
            <p className="ff-kicker-muted">Selected work</p>
            <div className="ff-home-section-heading-row">
              <h2 className="ff-display-section">Recent projects</h2>
              <Link href="/site/work" className="ff-link-small" data-cursor="link">
                View all work →
              </Link>
            </div>
          </div>
          <div className="ff-grid-work ff-home-work-grid">
            {featuredWork.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  title: project.title,
                  brand: project.brand,
                  year: project.year,
                  agency: project.agency,
                  thumbnailUrl: project.thumbnailUrl,
                  muxPlaybackId: project.muxPlaybackId,
                  sourceVideoUrl: project.sourceVideoUrl,
                  director: project.director,
                }}
                indexLabel={String(index + 1).padStart(2, "0")}
                indexMeta={project.brand}
                imagePriority={index < 2}
              />
            ))}
          </div>
        </section>
      )}

      {featuredDirectors.length > 0 && (
        <section className="ff-shell ff-home-section ff-section-border">
          <div className="ff-home-section-heading">
            <p className="ff-kicker-muted">Talent</p>
            <div className="ff-home-section-heading-row">
              <h2 className="ff-display-section">Directors</h2>
              <Link
                href="/site/directors"
                className="ff-link-small"
                data-cursor="link"
              >
                View all talent →
              </Link>
            </div>
          </div>
          <div className="ff-grid-directors ff-home-talent-grid">
            {featuredDirectors.map(({ director, stillUrl, muxPlaybackId, sourceVideoUrl, playProjectId }, index) => (
              <DirectorCard
                key={director.id}
                slug={director.slug}
                name={director.name}
                positioning={null}
                stillUrl={stillUrl}
                muxPlaybackId={muxPlaybackId}
                sourceVideoUrl={sourceVideoUrl}
                playProjectId={playProjectId}
                indexLabel={String(index + 1).padStart(2, "0")}
                indexMeta="Director"
              />
            ))}
          </div>
        </section>
      )}

      <section className="ff-shell ff-home-contact-strip ff-section-border">
        <p className="ff-home-contact-line">
          Bring us an idea, a board, or a problem worth filming.
        </p>
        <Link href="/site/contact" className="ff-home-contact-link" data-cursor="link">
          Contact
          <span aria-hidden="true"> →</span>
        </Link>
      </section>
    </div>
  );
}
