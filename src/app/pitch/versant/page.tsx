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
import { VersantPitchChrome } from "./sections/versant-pitch-chrome";
import { PitchStyles } from "../pitch-styles";

/**
 * Branded pitch landing for Versant Media / USA Sports (Friends & Family).
 *
 * Architecture: restrained media/product interface. F&F-led intro, studio,
 * directors, sports proof, Versant context, added support, scope, and close.
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
  title: "Friends & Family for Versant Sports",
  description:
    "Friends & Family directors, production, edit, motion, and delivery for Versant USA Sports.",
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
  "--versant-bg": "#DDE0D8",
  "--pitch-accent": "#2447FF",
  "--versant-black": "#09271F",
  "--versant-ink": "#14130F",
  "--versant-paper": "#F3EEE2",
  "--versant-white": "#FFFCF4",
  "--versant-orange": "#B19343",
  "--versant-lime": "#E8DFCD",
  "--versant-blue": "#09271F",
  "--versant-mint": "#E9E0CF",
  "--versant-gray": "#766F62",
  "--versant-soft-gray": "#D8CEBB",
  "--versant-surface": "#FBF7ED",
  "--versant-surface-soft": "#EEE6D7",
  "--versant-muted": "rgba(20, 19, 15, 0.58)",
  "--versant-rule": "rgba(20, 19, 15, 0.13)",
  "--versant-rule-strong": "rgba(20, 19, 15, 0.28)",
  "--versant-light-rule": "rgba(255, 252, 244, 0.16)",
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
      className="versant-pitch min-h-screen bg-[var(--versant-bg)] font-sans text-[var(--versant-ink)] antialiased selection:bg-[var(--versant-orange)]/30"
      style={VERSANT_THEME}
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-[#101010]/20"
      />
      <div aria-hidden="true" className="versant-grain" />
      <VersantMotion />
      <VersantPitchChrome />
      <PitchStyles />

      <WelcomeSplash
        recipientFirstName={recipientFirstName}
        directors={orderedDirectors}
      />
      <TerryIntro videoPlaybackId={TERRY_INTRO_PLAYBACK_ID} />
      <RosterModes directors={orderedDirectors} />
      <VersantReferenceStrip directors={orderedDirectors} />
      <UsaSportsPortfolio />
      <PartnerBench />
      <VersantFit />
      <ContactCta
        recipientFirstName={recipientFirstName}
      />
    </main>
  );
}
