import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCanonicalWork } from "@/lib/marketing/canonical-source";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Commercial Production" },
  description:
    "Friends & Family is a commercial production company representing directors, creators, and culture-makers.",
  alternates: { canonical: "/site" },
};

const HOME_PATHS = [
  { index: "01", label: "Selected Work", href: "/site/work" },
  { index: "02", label: "Directors", href: "/site/directors" },
  { index: "03", label: "The Youth", href: "/site/youth" },
  { index: "04", label: "Colossal", href: "/site/colossal" },
] as const;

export default function MarketingHomePage() {
  const heroProject = getCanonicalWork()[0] ?? null;

  return (
    <section className="ff-shell ff-page">
      <div className="ff-home-statement-row">
        <div>
          <h1 className="ff-display-hero ff-home-statement">Friends &amp; Family</h1>
        </div>
        <p className="ff-body ff-home-statement-side">
          Commercial films, culture work, and director-led production.
        </p>
      </div>

      <div className="ff-home-cta-row">
        <Link href="/site/work" className="ff-button-primary" data-cursor="link">
          Watch the work
        </Link>
        <Link
          href="/site/directors"
          className="ff-button-primary"
          data-cursor="link"
        >
          Meet the talent
        </Link>
        <Link href="/site/contact" className="ff-button-primary" data-cursor="link">
          Contact us
        </Link>
      </div>

      {heroProject && (
        <div className="ff-home-hero-media ff-media-frame">
          {heroProject.sourceVideoUrl ? (
            <video
              src={heroProject.sourceVideoUrl}
              poster={heroProject.thumbnailUrl ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="ff-home-hero-media__asset"
              aria-label={`${heroProject.brand}, ${heroProject.title}`}
            />
          ) : heroProject.thumbnailUrl ? (
            <Image
              src={heroProject.thumbnailUrl}
              alt={`${heroProject.brand}, ${heroProject.title}`}
              width={1920}
              height={1080}
              sizes="(min-width: 1280px) 1200px, 100vw"
              priority
              className="ff-home-hero-media__asset"
            />
          ) : null}
          <p className="ff-home-hero-caption">
            {heroProject.brand}, {heroProject.title}
            <span aria-hidden="true"> · </span>
            Dir. {heroProject.director.name}
          </p>
        </div>
      )}

      <nav className="ff-home-path-list" aria-label="Site sections">
        <ul>
          {HOME_PATHS.map((path) => (
            <li key={path.href}>
              <Link href={path.href} className="ff-home-path-link" data-cursor="link">
                <span className="ff-home-path-link__index">{path.index}</span>
                <span className="ff-home-path-link__label">{path.label}</span>
                <span className="ff-home-path-link__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="ff-meta ff-home-about-link">
        <Link href="/site/about" className="ff-link-small" data-cursor="link">
          About Friends &amp; Family
        </Link>
      </p>
    </section>
  );
}
