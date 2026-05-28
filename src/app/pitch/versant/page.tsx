import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { WelcomeSplash } from "./sections/welcome-splash";
import { VersantReferenceStrip } from "./sections/versant-reference-strip";
import { TerryIntro } from "./sections/terry-intro";
import { UsaSportsPortfolio } from "./sections/usa-sports-portfolio";
import { RosterModes } from "./sections/roster-modes";
import { PartnerBench } from "./sections/partner-bench";
import { VersantFit } from "./sections/versant-fit";
import { ContactCta } from "./sections/contact-cta";
import { VersantMotion } from "./sections/versant-motion";

/**
 * Branded pitch landing for Friends & Family and Versant Media.
 *
 * Architecture: restrained media/product interface. Warm intro, Versant
 * reference read, golf-first production opportunities, roster, fit, and close.
 *
 * Served from:
 *   - https://versant.reels.friendsandfamily.tv/ (subdomain → /pitch/versant)
 *   - https://reels.friendsandfamily.tv/versant (vanity)
 *   - https://reels.friendsandfamily.tv/pitch/versant (direct)
 *
 * Personalization: pass ?t=<token> to pull recipient name + ctaUrl
 * from a ScreeningLink. Without a token, renders the default.
 */

export const metadata: Metadata = {
  title: "Friends & Family for Versant Media",
  description:
    "A creative, production, edit, motion, and delivery read for Versant Media and USA Sports.",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  searchParams: { t?: string };
}

const TERRY_INTRO_PLAYBACK_ID = process.env.VERSANT_TERRY_INTRO_MUX_ID ?? null;
const DIRECTOR_SLUGS = [
  "terry-rayment",
  "jack-turits",
  "matt-dilmore",
  "boma-iluma",
  "kelsey-larkin",
  "caleb-slain",
  "james-frost",
  "cody-cloud",
  "bueno",
  "le-ged",
  "leigh-marling",
  "brother-willis",
] as const;
const BLOCKED_MOTION_TITLES = /reel|sizzle|teaser|trailer|clip|short film|montage|^z_/i;
const CLEAN_PROJECT_TITLES: Record<(typeof DIRECTOR_SLUGS)[number], string | null> = {
  "terry-rayment": null,
  "jack-turits": "Twins",
  "matt-dilmore": "Mad Maxine",
  "boma-iluma": "Switch",
  "kelsey-larkin": "Made Precisely For You",
  "caleb-slain": "4Runner - Getaway",
  "james-frost": "Business",
  "cody-cloud": "Thanos",
  bueno: "Mejor Con Pepsi",
  "le-ged": "Les Soprano Burger",
  "leigh-marling": "Supermarket",
  "brother-willis": "Oktoberfest Part Zwei",
};

const VERSANT_THEME = {
  "--versant-black": "#0C3B2E",
  "--versant-ink": "#11110e",
  "--versant-paper": "#F6F2E8",
  "--versant-white": "#FFFDF7",
  "--versant-orange": "#B99A46",
  "--versant-lime": "#F0E8D6",
  "--versant-blue": "#0C3B2E",
  "--versant-mint": "#ECE5D4",
  "--versant-gray": "#8f8879",
  "--versant-soft-gray": "#DED6C4",
} as CSSProperties;

function firstNameOf(full: string | null | undefined): string | null {
  if (!full) return null;
  const [first] = full.trim().split(/\s+/);
  return first || null;
}

type DirectorWithProjects = {
  slug: string;
  name: string;
  headshotUrl: string | null;
  projects: {
    title: string;
    brand: string | null;
    duration: number | null;
    muxPlaybackId: string | null;
    thumbnailUrl: string | null;
    frameGrabs: { imageUrl: string }[];
  }[];
};

const CAN_RENDER_DEV_DB_FALLBACK = process.env.NODE_ENV === "development";

function handleVersantPreviewDbError(error: unknown, fallback: string) {
  if (!CAN_RENDER_DEV_DB_FALLBACK) {
    throw error;
  }

  console.warn(`[versant-preview] ${fallback}`, error);
}

function isCleanMotionProject(project: DirectorWithProjects["projects"][number]) {
  return (
    Boolean(project.brand) &&
    Boolean(project.muxPlaybackId) &&
    !BLOCKED_MOTION_TITLES.test(project.title) &&
    (project.duration ?? 999) <= 75
  );
}

function cleanProjectForDirector(
  director: DirectorWithProjects,
): DirectorWithProjects["projects"][number] | null {
  const titleMatch = CLEAN_PROJECT_TITLES[director.slug as (typeof DIRECTOR_SLUGS)[number]];
  const cleanProjects = director.projects.filter(isCleanMotionProject);

  if (titleMatch) {
    const explicit = cleanProjects.find((project) =>
      project.title.toLowerCase().includes(titleMatch.toLowerCase()),
    );
    if (explicit) return explicit;
  }

  if (director.slug === "terry-rayment") {
    return (
      cleanProjects.find((project) => (project.duration ?? 999) <= 60) ??
      director.projects.find((project) =>
        project.title.toLowerCase().includes("wolverine"),
      ) ??
      cleanProjects[0] ??
      null
    );
  }

  return cleanProjects[0] ?? null;
}

export default async function VersantPitchPage({ searchParams }: PageProps) {
  const token = typeof searchParams?.t === "string" ? searchParams.t : null;

  let link: {
    token: string;
    isActive: boolean;
    recipientName: string | null;
    customWelcomeMessage: string | null;
    ctaUrl: string | null;
    ctaLabel: string | null;
  } | null = null;

  if (token) {
    try {
      link = await prisma.screeningLink.findUnique({
        where: { token },
        select: {
          token: true,
          isActive: true,
          recipientName: true,
          customWelcomeMessage: true,
          ctaUrl: true,
          ctaLabel: true,
        },
      });
    } catch (error) {
      handleVersantPreviewDbError(
        error,
        "Screening link lookup failed; rendering default local preview.",
      );
    }
  }

  const recipientFirstName = link?.isActive
    ? firstNameOf(link.recipientName)
    : null;

  let directors: DirectorWithProjects[] = [];

  try {
    directors = await prisma.director.findMany({
      where: { slug: { in: [...DIRECTOR_SLUGS] } },
      select: {
        slug: true,
        name: true,
        headshotUrl: true,
        projects: {
          where: { isPublished: true, muxPlaybackId: { not: null } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            title: true,
            brand: true,
            duration: true,
            muxPlaybackId: true,
            thumbnailUrl: true,
            frameGrabs: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { imageUrl: true },
            },
          },
        },
      },
    });
  } catch (error) {
    handleVersantPreviewDbError(
      error,
      "Director media lookup failed; rendering local preview without database media.",
    );
  }

  const orderedDirectors = DIRECTOR_SLUGS.map((slug) =>
    directors.find((director) => director.slug === slug),
  )
    .filter((director): director is NonNullable<typeof director> => Boolean(director))
    .map((director) => {
      const project = cleanProjectForDirector(director);
      return { ...director, projects: project ? [project] : [] };
    });

  return (
    <main
      className="min-h-screen bg-[var(--versant-paper)] font-sans text-[var(--versant-ink)] antialiased selection:bg-[var(--versant-orange)]/30"
      style={VERSANT_THEME}
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-[#101010]/20"
      />
      <VersantMotion />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes versant-marquee {
              from { transform: translate3d(0, 0, 0); }
              to { transform: translate3d(-50%, 0, 0); }
            }
            .versant-marquee {
              animation: versant-marquee 44s linear infinite;
              padding-left: 1rem;
            }
            .versant-reveal {
              opacity: 0;
              transform: translateY(16px);
              transition: opacity 520ms ease, transform 520ms ease;
              will-change: opacity, transform;
            }
            .versant-reveal.is-visible,
            .versant-reduce-motion .versant-reveal {
              opacity: 1;
              transform: translateY(0);
            }
            .versant-display {
              line-height: 0.98;
              padding-bottom: 0.08em;
              text-wrap: balance;
            }
            .versant-section {
              padding: clamp(3.75rem, 7vw, 7rem) 1rem;
            }
            .versant-section-tight {
              padding-top: clamp(2.5rem, 5vw, 4.5rem);
              padding-bottom: clamp(2.5rem, 5vw, 4.5rem);
            }
            .versant-container {
              width: min(100% - 2rem, 1500px);
              margin-inline: auto;
            }
            .versant-header {
              display: grid;
              grid-template-columns: minmax(0, 0.26fr) minmax(0, 0.5fr) minmax(16rem, 0.24fr);
              gap: 1rem;
              align-items: end;
              margin-bottom: clamp(1.75rem, 4vw, 3rem);
            }
            .versant-kicker,
            .versant-meta-label {
              font-size: 0.68rem;
              font-weight: 600;
              line-height: 1;
              text-transform: uppercase;
              letter-spacing: 0.11em;
            }
            .versant-title {
              font-size: clamp(2.35rem, 5vw, 5rem);
              font-weight: 500;
              letter-spacing: -0.045em;
              line-height: 0.98;
              text-wrap: balance;
            }
            .versant-intro {
              max-width: 34rem;
              font-size: clamp(1rem, 1.55vw, 1.35rem);
              line-height: 1.2;
              letter-spacing: -0.025em;
            }
            .versant-panel,
            .versant-card,
            .versant-media,
            .versant-mw-panel,
            .versant-mw-card,
            .versant-mw-media {
              border-radius: 8px !important;
              box-shadow: none !important;
            }
            .versant-panel {
              border: 1px solid rgba(17, 17, 14, 0.1);
              background: var(--versant-white);
            }
            .versant-card {
              border: 1px solid rgba(17, 17, 14, 0.12);
              background: var(--versant-white);
              transition: border-color 220ms ease, background-color 220ms ease, transform 220ms ease;
            }
            .versant-card:hover,
            .versant-mw-card:hover {
              border-color: rgba(17, 17, 14, 0.28);
              transform: translateY(-2px);
            }
            .versant-card:hover .versant-card-image {
              transform: scale(1.035);
            }
            .versant-media {
              overflow: hidden;
              background: var(--versant-soft-gray);
            }
            .versant-card-image {
              transition: transform 700ms ease, opacity 300ms ease;
            }
            .versant-tag-list {
              display: flex;
              flex-wrap: wrap;
              gap: 0.4rem;
            }
            .versant-tag {
              display: inline-flex;
              align-items: center;
              min-height: 1.75rem;
              border: 1px solid var(--versant-soft-gray);
              border-radius: 999px;
              background: var(--versant-mint);
              padding: 0.4rem 0.65rem;
              font-size: 0.75rem;
              font-weight: 500;
              line-height: 1;
              color: rgba(17, 17, 14, 0.78);
              letter-spacing: 0;
            }
            .versant-tag-dark {
              border-color: rgba(255, 255, 255, 0.18);
              background: rgba(255, 255, 255, 0.08);
              color: rgba(255, 255, 255, 0.76);
            }
            .versant-meta-label {
              color: rgba(17, 17, 14, 0.42);
            }
            .versant-meta-text {
              font-size: 0.92rem;
              line-height: 1.3;
              color: rgba(17, 17, 14, 0.64);
            }
            .versant-link {
              display: inline-flex;
              align-items: center;
              min-height: 2.5rem;
              border-bottom: 1px solid currentColor;
              font-size: 0.92rem;
              font-weight: 500;
              line-height: 1;
              transition: opacity 180ms ease;
            }
            .versant-link:hover {
              opacity: 0.62;
            }
            .versant-card:focus-within,
            .versant-link:focus-visible {
              outline: 2px solid var(--versant-orange);
              outline-offset: 4px;
            }
            @media (max-width: 900px) {
              .versant-section {
                padding: 4.5rem 1rem;
              }
              .versant-container {
                width: min(100% - 1.5rem, 1500px);
              }
              .versant-header {
                grid-template-columns: 1fr;
                gap: 0.9rem;
                align-items: start;
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .versant-marquee {
                animation: none;
                transform: none;
              }
              .versant-reveal {
                opacity: 1;
                transform: none;
                transition: none;
              }
              .versant-card,
              .versant-card-image {
                transition: none;
                transform: none !important;
              }
            }
          `,
        }}
      />

      <WelcomeSplash
        recipientFirstName={recipientFirstName}
        directors={orderedDirectors}
      />
      <TerryIntro videoPlaybackId={TERRY_INTRO_PLAYBACK_ID} />
      <UsaSportsPortfolio />
      <PartnerBench />
      <VersantReferenceStrip directors={orderedDirectors} />
      <RosterModes directors={orderedDirectors} />
      <VersantFit />
      <ContactCta
        ctaUrl={link?.ctaUrl}
        ctaLabel={link?.ctaLabel}
        recipientFirstName={recipientFirstName}
        directors={orderedDirectors}
      />
    </main>
  );
}
