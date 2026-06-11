import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import {
  BRAND_ROSTER_FITS,
  PITCH_COMPANIES,
} from "@/lib/pitch/companies";
import { loadPitchDirectors, type PitchDirector } from "@/lib/pitch/directors";
import { BrandSplash } from "./sections/brand-splash";
import { BrandNoticed } from "./sections/brand-noticed";
import { BrandFit } from "./sections/brand-fit";
import { TerryIntro } from "../versant/sections/terry-intro";
import { RosterModes } from "../versant/sections/roster-modes";
import { PartnerBench } from "../versant/sections/partner-bench";
import { ContactCta } from "../versant/sections/contact-cta";
import { VersantMotion } from "../versant/sections/versant-motion";
import { VersantPitchChrome } from "../versant/sections/versant-pitch-chrome";
import { PitchStyles } from "../pitch-styles";
import { PitchViewBeacon } from "../pitch-view-beacon";

/**
 * Generic branded pitch landing for founder outreach targets.
 * One page per company in PITCH_COMPANIES, served at:
 *   - https://reels.friendsandfamily.tv/<slug> (vanity, via middleware)
 *   - https://reels.friendsandfamily.tv/pitch/<slug> (direct)
 *
 * Same design system as /pitch/versant; per-company copy from config.
 * Deliberately no per-person greeting: pages address the company so they
 * can be forwarded freely inside the org.
 */

interface PageProps {
  params: { slug: string };
}

// Render at request time: static prerendering 30+ pages hammers the Neon
// pooler with parallel director queries at build time and fails transiently.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  const config = PITCH_COMPANIES[params.slug];
  if (!config) return {};
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    robots: { index: false, follow: false, nocache: true },
  };
}

const TERRY_INTRO_PLAYBACK_ID = process.env.VERSANT_TERRY_INTRO_MUX_ID ?? null;

const PITCH_THEME = {
  "--versant-bg": "#DDE0D8",
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

const CAN_RENDER_DEV_DB_FALLBACK = process.env.NODE_ENV === "development";

function handlePitchDbError(error: unknown, fallback: string) {
  if (!CAN_RENDER_DEV_DB_FALLBACK) {
    throw error;
  }
  console.warn(`[pitch-page] ${fallback}`, error);
}


export default async function BrandPitchPage({ params }: PageProps) {
  const config = PITCH_COMPANIES[params.slug];
  if (!config) notFound();

  // No per-person greeting on brand pages: the page addresses the company,
  // not an individual, so it can be forwarded freely inside the org.
  let directors: PitchDirector[] = [];
  try {
    directors = await loadPitchDirectors();
  } catch (error) {
    handlePitchDbError(
      error,
      "Director lookup failed; rendering without roster media.",
    );
  }

  return (
    <main
      className="versant-pitch min-h-screen bg-[var(--versant-bg)] font-sans text-[var(--versant-ink)] antialiased selection:bg-[var(--versant-orange)]/30"
      style={{ ...PITCH_THEME, "--pitch-accent": config.accent } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-[#101010]/20"
      />
      <div aria-hidden="true" className="versant-grain" />
      <VersantMotion />
      <VersantPitchChrome />
      <PitchStyles />
      <PitchViewBeacon slug={config.slug} />

      <BrandSplash
        company={config.company}
        heroFor={config.heroFor}
        heroWhy={config.heroWhy}
        ticker={config.ticker}
        directors={directors}
      />
      <TerryIntro
        videoPlaybackId={TERRY_INTRO_PLAYBACK_ID}
        headline={config.studio.headline}
        subline={config.studio.subline}
      />
      <BrandNoticed noticed={config.noticed} />
      <RosterModes directors={directors} fits={BRAND_ROSTER_FITS} />
      <PartnerBench />
      <BrandFit fit={config.fit} />
      <ContactCta />
    </main>
  );
}
