import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { WelcomeSplash } from "./sections/welcome-splash";
import { VersantReferenceStrip } from "./sections/versant-reference-strip";
import { TerryIntro } from "./sections/terry-intro";
import { RosterModes } from "./sections/roster-modes";
import { PartnerBench } from "./sections/partner-bench";
import { VersantFit } from "./sections/versant-fit";
import { ContactCta } from "./sections/contact-cta";
import { VersantMotion } from "./sections/versant-motion";

/**
 * Branded pitch landing — Friends & Family for Versant Media.
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
    "A production partner case for Friends & Family, starting with Golf Channel and the Versant golf ecosystem.",
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
  "--versant-paper": "#F2ECDD",
  "--versant-white": "#FBF6EA",
  "--versant-orange": "#C6A24C",
  "--versant-lime": "#f7f0df",
  "--versant-blue": "#0C3B2E",
  "--versant-mint": "#ebe3cf",
  "--versant-gray": "#8f8879",
  "--versant-soft-gray": "#e6decc",
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
              animation: versant-marquee 32s linear infinite;
              padding-left: 1rem;
            }
            .versant-reveal {
              opacity: 0;
              transform: translateY(24px);
              transition: opacity 400ms ease, transform 400ms ease;
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
            }
          `,
        }}
      />

      <WelcomeSplash
        recipientFirstName={recipientFirstName}
        directors={orderedDirectors}
      />
      <TerryIntro videoPlaybackId={TERRY_INTRO_PLAYBACK_ID} />
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
