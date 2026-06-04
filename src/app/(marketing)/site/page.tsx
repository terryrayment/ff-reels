import type { Metadata } from "next";
import Link from "next/link";
import { HomeSpotCarousel } from "@/components/marketing/home-spot-carousel";
import { getCanonicalWork } from "@/lib/marketing/canonical-source";
import { buildHomeSpotCarouselSlides } from "@/lib/marketing/home-spot-carousel";

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

/** Homepage carousel only — does not change global Work archive order. */
const CAROUSEL_WORK_IDS = [
  "source-work-003-bueno-citi-can-i-click-it",
  "source-work-001-caleb-slain-ford-lobo",
  "source-work-002-matt-dilmore-little-caesars-pizza-bot",
  "source-work-055-terry-rayment-cadillac-tree-hunting",
  "source-work-020-james-frost-nike-human-printing-press",
] as const;

function getCarouselWork() {
  const byId = new Map(getCanonicalWork().map((project) => [project.id, project]));
  return CAROUSEL_WORK_IDS.map((id) => byId.get(id)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project),
  );
}

export default function MarketingHomePage() {
  const carouselWork = getCarouselWork();
  const spotCarouselSlides = buildHomeSpotCarouselSlides(carouselWork);

  return (
    <div className="ff-home">
      <h1 className="sr-only">Friends &amp; Family</h1>
      {spotCarouselSlides.length > 0 && (
        <HomeSpotCarousel slides={spotCarouselSlides} />
      )}

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
    </div>
  );
}
