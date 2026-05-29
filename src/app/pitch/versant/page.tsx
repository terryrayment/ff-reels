import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { VERSANT_PITCH_THEME } from "../_shared/editorial-pitch-tokens";
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

/**
 * Branded pitch landing for Versant Media / USA Sports (Friends & Family).
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
  title: "VERSANT Sports",
  description:
    "Creative, production, edit, motion, and delivery for Versant USA Sports from Friends & Family.",
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
      style={VERSANT_PITCH_THEME}
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-[#101010]/20"
      />
      <div aria-hidden="true" className="versant-grain" />
      <VersantMotion />
      <VersantPitchChrome />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .versant-grain {
              position: fixed;
              inset: 0;
              z-index: 40;
              pointer-events: none;
              opacity: 0.02;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
              background-repeat: repeat;
              background-size: 220px 220px;
            }
            .versant-surface-grain {
              position: absolute;
              inset: 0;
              z-index: 1;
              pointer-events: none;
              opacity: 0.06;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
              background-repeat: repeat;
              background-size: 220px 220px;
            }
            @keyframes versant-marquee {
              from { transform: translate3d(0, 0, 0); }
              to { transform: translate3d(-50%, 0, 0); }
            }
            .versant-marquee {
              animation: versant-marquee 48s linear infinite;
              padding-left: 0.5rem;
            }
            html.versant-pitch-page {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            html.versant-pitch-page::-webkit-scrollbar {
              display: none;
              width: 0;
              height: 0;
            }
            .versant-custom-scrollbar {
              position: fixed;
              top: 0;
              right: 0;
              z-index: 60;
              width: 15px;
              height: 100vh;
              height: 100dvh;
              pointer-events: none;
            }
            .versant-custom-scrollbar-track {
              position: absolute;
              inset: 0;
              background: var(--versant-bg);
              box-shadow: inset 1px 0 0 rgba(20, 19, 15, 0.1);
            }
            .versant-custom-scrollbar-thumb {
              position: absolute;
              top: 0;
              left: 1px;
              right: 1px;
              border-radius: 999px;
              background: #2447ff;
            }
            @keyframes versant-rise-in {
              from {
                opacity: 0;
                transform: translate3d(0, 32px, 0);
              }
              to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }
            .versant-reveal {
              opacity: 0;
              transform: translate3d(0, 32px, 0);
            }
            .versant-reveal.is-visible {
              animation: versant-rise-in 680ms cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            .versant-reduce-motion .versant-reveal,
            .versant-reduce-motion .versant-reveal.is-visible {
              opacity: 1;
              transform: none;
              animation: none;
            }
            .versant-display {
              line-height: 0.98;
              padding-bottom: 0.08em;
              text-wrap: balance;
              font-kerning: normal;
            }
            .versant-section {
              padding: 50px 2rem;
            }
            .versant-section-tight {
              padding-top: 18px;
              padding-bottom: 18px;
            }
            .versant-section.versant-section-flush {
              padding-top: 0;
              padding-bottom: 0;
            }
            .versant-section-studio {
              padding-top: 40px;
              padding-bottom: 40px;
            }
            @media (min-width: 1024px) {
              .versant-section-studio .versant-studio-grid {
                grid-template-columns: repeat(11, 1fr);
              }
            }
            .versant-container {
              width: min(100% - clamp(3rem, 10vw, 12rem), 1500px);
              margin-inline: auto;
            }
            .versant-header {
              display: grid;
              grid-template-columns: minmax(0, 0.7fr) minmax(18rem, 0.3fr);
              column-gap: clamp(2rem, 6vw, 7rem);
              row-gap: 0.75rem;
              align-items: start;
              margin-bottom: clamp(1.85rem, 4vw, 3.5rem);
            }
            .versant-kicker {
              grid-column: 1 / -1;
              font-size: 0.78rem;
              font-weight: 500;
              line-height: 1.1;
              letter-spacing: 0.01em;
            }
            .versant-meta-label {
              font-size: 0.64rem;
              font-weight: 700;
              line-height: 1;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }
            .versant-title {
              font-size: clamp(2.35rem, 4.8vw, 5.4rem);
              font-weight: 500;
              letter-spacing: -0.038em;
              line-height: 0.97;
              text-wrap: balance;
            }
            .versant-intro {
              max-width: 31rem;
              font-size: clamp(1rem, 1.35vw, 1.18rem);
              line-height: 1.3;
              letter-spacing: -0.018em;
              color: var(--versant-muted);
            }
            .versant-panel,
            .versant-card,
            .versant-media,
            .versant-mw-panel,
            .versant-mw-card,
            .versant-mw-media {
              border-radius: 4px !important;
              box-shadow: none !important;
            }
            .versant-panel {
              border: 1px solid var(--versant-rule);
              background: rgba(255, 252, 244, 0.72);
            }
            .versant-card {
              border: 0;
              border-top: 1px solid var(--versant-rule);
              background: transparent;
              transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease;
            }
            .versant-card:hover,
            .versant-mw-card:hover {
              border-color: var(--versant-rule-strong);
            }
            .versant-card:hover .versant-card-image {
              transform: scale(1.008);
            }
            .versant-media {
              overflow: hidden;
              background: var(--versant-surface-soft);
            }
            .versant-card-image {
              transition: transform 520ms ease, opacity 240ms ease;
            }
            .versant-sport-row {
              position: relative;
              overflow: hidden;
              transition: border-color 180ms ease, background-color 180ms ease;
            }
            .versant-sport-lane,
            .versant-sport-read,
            .versant-sport-row .versant-tag {
              transition:
                color 180ms ease,
                opacity 180ms ease,
                transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            @media (hover: hover) {
              .versant-sport-row:hover {
                background: rgba(255, 252, 244, 0.22);
                border-color: var(--versant-rule);
              }
              .versant-sport-row:hover .versant-sport-lane {
                color: #2447ff;
              }
              .versant-sport-row:hover .versant-sport-read {
                color: rgba(20, 19, 15, 0.68);
              }
              .versant-sport-row:hover .versant-tag {
                color: rgba(20, 19, 15, 0.66);
              }
              .versant-sport-row:hover .versant-property-chip {
                border-color: rgba(20, 19, 15, 0.14);
                color: rgba(20, 19, 15, 0.68);
              }
              .versant-property-chip:hover {
                background: rgba(255, 252, 244, 0.42);
                border-color: rgba(20, 19, 15, 0.16);
                color: rgba(20, 19, 15, 0.76);
              }
            }
            .versant-property-list {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 0.28rem 0.32rem;
              list-style: none;
              margin: 0;
              padding: 0;
            }
            .versant-property-list li {
              display: flex;
              min-width: 0;
            }
            .versant-property-chip {
              display: inline-flex;
              position: relative;
              min-height: 1.56rem;
              align-items: center;
              justify-content: center;
              gap: 0;
              border: 1px solid rgba(20, 19, 15, 0.07);
              border-radius: 2px;
              background: rgba(255, 252, 244, 0.14);
              padding: 0.22rem 0.46rem;
              color: rgba(20, 19, 15, 0.58);
              font-size: 0.69rem;
              font-weight: 500;
              line-height: 1.15;
              letter-spacing: -0.004em;
              text-decoration: none;
              white-space: nowrap;
              overflow: visible;
              transition:
                background-color 180ms ease,
                border-color 180ms ease,
                color 180ms ease,
                opacity 180ms ease;
            }
            .versant-property-chip[data-logo-state="text"] {
              padding-inline: 0.42rem;
            }
            .versant-property-chip[data-logo-state="asset"] {
              padding-inline: 0.46rem 0.56rem;
            }
            .versant-property-chip[data-logo-state="mark"] {
              gap: 0.42rem;
              padding-left: 0.42rem;
            }
            .versant-property-visual {
              display: inline-grid;
              position: relative;
              min-width: 1.18rem;
              height: 1rem;
              flex: 0 0 auto;
              place-items: center;
              padding-right: 0.42rem;
              border-right: 1px solid rgba(20, 19, 15, 0.14);
              color: rgba(20, 19, 15, 0.5);
            }
            .versant-property-default {
              display: inline-grid;
              grid-area: 1 / 1;
              place-items: center;
              transition:
                opacity 160ms ease,
                transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .versant-property-logo {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              max-height: 0.82rem;
              max-width: 4.2rem;
              opacity: 0.68;
              transition: opacity 180ms ease;
            }
            .versant-property-logo-image {
              display: block;
              width: auto;
              max-width: 4.2rem;
              height: auto;
              max-height: 0.82rem;
              object-fit: contain;
              filter: grayscale(1) contrast(1.15) brightness(0.44);
            }
            .versant-property-mark {
              display: inline-flex;
              min-width: 1.1rem;
              align-items: center;
              justify-content: center;
              color: rgba(20, 19, 15, 0.48);
              font-size: 0.55rem;
              font-weight: 800;
              line-height: 1;
              letter-spacing: 0.03em;
              text-transform: uppercase;
            }
            .versant-property-motion-icon {
              grid-area: 1 / 1;
              width: 1.28rem;
              height: 1.28rem;
              color: currentColor;
              opacity: 0;
              overflow: visible;
              stroke: currentColor;
              stroke-width: 1.75;
              stroke-linecap: round;
              stroke-linejoin: round;
              transform: translateY(2px) scale(0.96);
              transition:
                opacity 160ms ease,
                transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .versant-property-motion-icon * {
              vector-effect: non-scaling-stroke;
              transform-box: fill-box;
            }
            .versant-property-chip:hover .versant-property-logo {
              opacity: 0.86;
            }
            .versant-property-chip:hover .versant-property-visual,
            .versant-property-chip:focus-visible .versant-property-visual,
            .versant-property-chip:active .versant-property-visual {
              border-right-color: rgba(20, 19, 15, 0.2);
              color: rgba(20, 19, 15, 0.66);
            }
            .versant-property-chip:hover .versant-property-default,
            .versant-property-chip:focus-visible .versant-property-default,
            .versant-property-chip:active .versant-property-default {
              opacity: 0;
              transform: translateY(-2px) scale(0.96);
            }
            .versant-property-chip:hover .versant-property-motion-icon,
            .versant-property-chip:focus-visible .versant-property-motion-icon,
            .versant-property-chip:active .versant-property-motion-icon {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            .versant-property-chip:hover .motion-hand-minute,
            .versant-property-chip:focus-visible .motion-hand-minute,
            .versant-property-chip:active .motion-hand-minute,
            .versant-property-chip:hover .motion-hand-hour,
            .versant-property-chip:focus-visible .motion-hand-hour,
            .versant-property-chip:active .motion-hand-hour {
              animation: versant-clock-snap 950ms ease both;
              transform-origin: 0 100%;
            }
            .versant-property-chip:hover .motion-flag,
            .versant-property-chip:focus-visible .motion-flag,
            .versant-property-chip:active .motion-flag,
            .versant-property-chip:hover .motion-pennant,
            .versant-property-chip:focus-visible .motion-pennant,
            .versant-property-chip:active .motion-pennant {
              animation: versant-flag-flick 920ms ease both;
              transform-origin: 0 50%;
            }
            .versant-property-chip:hover .motion-glint,
            .versant-property-chip:focus-visible .motion-glint,
            .versant-property-chip:active .motion-glint {
              animation: versant-glint 1150ms ease both;
            }
            .versant-property-chip:hover .motion-tire,
            .versant-property-chip:focus-visible .motion-tire,
            .versant-property-chip:active .motion-tire,
            .versant-property-chip:hover .motion-spokes,
            .versant-property-chip:focus-visible .motion-spokes,
            .versant-property-chip:active .motion-spokes {
              animation: versant-tire-spin 1050ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
              transform-origin: center;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="golf-putt"] .motion-ball,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="golf-putt"] .motion-ball,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="golf-putt"] .motion-ball {
              animation: versant-ball-roll 1050ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="soccer-pass"] .motion-ball,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="soccer-pass"] .motion-ball,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="soccer-pass"] .motion-ball {
              animation: versant-soccer-pass 1100ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="wrestling-ropes"] .motion-rope-mid,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="wrestling-ropes"] .motion-rope-mid,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="wrestling-ropes"] .motion-rope-mid {
              animation: versant-rope-bounce 900ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="golf-target-break"] .motion-target-ring,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="golf-target-break"] .motion-target-ring,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="golf-target-break"] .motion-target-ring {
              animation: versant-target-pulse 1000ms ease both;
              transform-origin: center;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="golf-target-break"] .motion-break-line,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="golf-target-break"] .motion-break-line,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="golf-target-break"] .motion-break-line {
              animation: versant-line-strike 900ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="trick-shot"] .motion-ball,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="trick-shot"] .motion-ball,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="trick-shot"] .motion-ball {
              animation: versant-trick-shot 1150ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="vertical-crop"] .motion-crop-top,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="vertical-crop"] .motion-crop-top,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="vertical-crop"] .motion-crop-top {
              animation: versant-crop-top 900ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="vertical-crop"] .motion-crop-bottom,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="vertical-crop"] .motion-crop-bottom,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="vertical-crop"] .motion-crop-bottom {
              animation: versant-crop-bottom 900ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="basketball-bounce"] .motion-ball,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="basketball-bounce"] .motion-ball,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="basketball-bounce"] .motion-ball {
              animation: versant-basketball-bounce 1050ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="volleyball-set"] .motion-ball,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="volleyball-set"] .motion-ball,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="volleyball-set"] .motion-ball {
              animation: versant-volleyball-set 1050ms ease both;
            }
            .versant-property-chip:hover .versant-property-motion-icon[data-motion-type="scoreboard-flip"] .motion-flip,
            .versant-property-chip:focus-visible .versant-property-motion-icon[data-motion-type="scoreboard-flip"] .motion-flip,
            .versant-property-chip:active .versant-property-motion-icon[data-motion-type="scoreboard-flip"] .motion-flip {
              animation: versant-score-flip 1000ms ease both;
              transform-origin: center;
            }
            .versant-property-chip:focus-visible {
              outline: 2px solid var(--versant-orange);
              outline-offset: 3px;
            }
            @keyframes versant-clock-snap {
              0% { transform: rotate(-32deg); }
              58% { transform: rotate(18deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes versant-flag-flick {
              0% { transform: skewX(0deg) translateX(0); }
              36% { transform: skewX(-10deg) translateX(0.8px); }
              72% { transform: skewX(6deg) translateX(-0.4px); }
              100% { transform: skewX(0deg) translateX(0); }
            }
            @keyframes versant-glint {
              0%, 100% { opacity: 0.2; transform: translateX(-1px); }
              45% { opacity: 1; transform: translateX(1.5px); }
            }
            @keyframes versant-tire-spin {
              0% { transform: rotate(-24deg); }
              100% { transform: rotate(336deg); }
            }
            @keyframes versant-ball-roll {
              0% { transform: translateX(-4px) rotate(0deg); }
              100% { transform: translateX(7px) rotate(180deg); }
            }
            @keyframes versant-soccer-pass {
              0% { transform: translate(0, 0); opacity: 0.55; }
              100% { transform: translate(10px, -5px); opacity: 1; }
            }
            @keyframes versant-rope-bounce {
              0%, 100% { transform: translateX(0); }
              38% { transform: translateX(2px); }
              70% { transform: translateX(-1px); }
            }
            @keyframes versant-target-pulse {
              0% { transform: scale(0.92); opacity: 0.45; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes versant-line-strike {
              0% { stroke-dasharray: 0 22; }
              100% { stroke-dasharray: 22 22; }
            }
            @keyframes versant-trick-shot {
              0% { transform: translate(0, 0); }
              55% { transform: translate(6px, -8px); }
              100% { transform: translate(12px, 0); }
            }
            @keyframes versant-crop-top {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(1.8px); }
            }
            @keyframes versant-crop-bottom {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-1.8px); }
            }
            @keyframes versant-basketball-bounce {
              0%, 100% { transform: translateY(0); }
              42% { transform: translateY(5px); }
              72% { transform: translateY(-2px); }
            }
            @keyframes versant-volleyball-set {
              0% { transform: translateY(5px); }
              62% { transform: translateY(-3px); }
              100% { transform: translateY(0); }
            }
            @keyframes versant-score-flip {
              0% { transform: scaleY(1); }
              48% { transform: scaleY(0.16); }
              100% { transform: scaleY(1); }
            }
            .versant-tag-list {
              display: flex;
              flex-wrap: wrap;
              align-items: baseline;
              column-gap: 0;
              row-gap: 0.35rem;
            }
            .versant-tag {
              display: inline-flex;
              align-items: center;
              min-height: 0;
              border: 0;
              border-radius: 0;
              background: transparent;
              padding: 0;
              font-size: 0.74rem;
              font-weight: 500;
              line-height: 1.3;
              color: var(--versant-muted);
              letter-spacing: -0.008em;
            }
            .versant-tag-list .versant-tag:not(:last-child)::after {
              content: "/";
              margin-inline: 0.42rem;
              color: rgba(20, 19, 15, 0.28);
            }
            .versant-tag-dark {
              color: rgba(255, 252, 244, 0.62);
            }
            .versant-tag-list .versant-tag-dark:not(:last-child)::after {
              color: rgba(255, 252, 244, 0.32);
            }
            .versant-meta-label {
              color: rgba(20, 19, 15, 0.42);
            }
            .versant-meta-text {
              font-size: 0.88rem;
              line-height: 1.38;
              color: rgba(20, 19, 15, 0.58);
              letter-spacing: -0.008em;
            }
            [class*="text-white"] .versant-meta-label,
            [class*="text-[var(--versant-white)]"] .versant-meta-label {
              color: rgba(255, 252, 244, 0.46);
            }
            [class*="text-white"] .versant-meta-text,
            [class*="text-[var(--versant-white)]"] .versant-meta-text {
              color: rgba(255, 252, 244, 0.62);
            }
            .versant-link {
              display: inline-flex;
              align-items: center;
              min-height: 2.75rem;
              border-bottom: 1px solid currentColor;
              font-size: 0.9rem;
              font-weight: 500;
              line-height: 1;
              letter-spacing: -0.01em;
              transition: opacity 160ms ease, border-color 160ms ease;
            }
            .versant-link:hover {
              opacity: 0.68;
            }
            [data-versant-credit] {
              min-height: 2.75rem !important;
              border: 0 !important;
              border-bottom: 1px solid currentColor !important;
              border-radius: 0 !important;
              background: transparent !important;
              padding: 0.42rem 0 !important;
            }
            .versant-card:focus-within,
            .versant-link:focus-visible {
              outline: 2px solid var(--versant-orange);
              outline-offset: 4px;
            }
            @media (max-width: 900px) {
              .versant-section {
                padding: 50px 2rem;
              }
              .versant-section.versant-section-flush {
                padding-top: 0;
                padding-bottom: 0;
              }
              .versant-section-studio {
                padding-top: 40px;
                padding-bottom: 40px;
              }
              .versant-container {
                width: min(100% - 2.5rem, 1500px);
              }
              .versant-header {
                grid-template-columns: 1fr;
                gap: 0.8rem;
                align-items: start;
              }
              .versant-property-list {
                gap: 0.32rem;
              }
              .versant-property-chip {
                min-height: 1.48rem;
                padding-inline: 0.4rem;
                font-size: 0.67rem;
              }
              .versant-property-chip[data-logo-state="mark"] {
                padding-left: 0.4rem;
              }
              .versant-property-visual {
                min-width: 1.08rem;
                padding-right: 0.34rem;
              }
              .versant-property-mark {
                min-width: 1rem;
                font-size: 0.52rem;
              }
              .versant-property-motion-icon {
                width: 1.18rem;
                height: 1.18rem;
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .versant-marquee {
                animation: none;
                transform: none;
              }
              .versant-reveal,
              .versant-reveal.is-visible {
                opacity: 1;
                transform: none;
                animation: none;
              }
              .versant-card,
              .versant-card-image,
              .versant-sport-row,
              .versant-sport-lane,
              .versant-sport-read,
              .versant-sport-tags,
              .versant-sport-row .versant-tag,
              .versant-property-chip,
              .versant-property-logo,
              .versant-property-logo-image,
              .versant-property-visual,
              .versant-property-default,
              .versant-property-motion-icon,
              .versant-property-motion-icon *,
              .versant-property-mark {
                animation: none !important;
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
        recipientFirstName={recipientFirstName}
      />
    </main>
  );
}
