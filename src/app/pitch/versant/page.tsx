import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { WelcomeSplash } from "./sections/welcome-splash";
import { TerryIntro } from "./sections/terry-intro";
import { GolfTab } from "./sections/golf-tab";
import { BriefAnswer } from "./sections/brief-answer";
import { BusinessIntel } from "./sections/business-intel";
import { FFCompanyCard } from "./sections/ff-company-card";
import { ContactCta } from "./sections/contact-cta";

/**
 * Branded pitch landing — Versant Media / NASCAR "Professor Chase".
 *
 * Served from:
 *   - https://versant.reels.friendsandfamily.tv/ (via middleware rewrite to /pitch/versant)
 *   - https://reels.friendsandfamily.tv/pitch/versant (direct, for preview)
 *
 * Personalization: a screening-link token can be passed as ?t=<token>. The
 * page reads the token's recipientName, customWelcomeMessage, ctaUrl, and
 * ctaLabel to personalize the greeting and CTA. Without a token, the page
 * renders a "for Versant Media" default.
 *
 * Routes used by section components:
 *   - /s/<screening token>  → the curated reel carousel (existing screening page)
 *   - /t/<treatment token>  → the Professor Chase PDF treatment
 */

export const metadata: Metadata = {
  title: "Friends & Family for Versant Media",
  description:
    "A pitch to Versant Media: Professor Chase as the entry, Golf Channel as the home.",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  searchParams: { t?: string };
}

// Hardcoded for this specific pitch. Set when the reel is built and the treatment uploaded.
const REEL_SCREENING_TOKEN_FALLBACK = process.env.VERSANT_DEMO_REEL_TOKEN ?? null;
const TREATMENT_TOKEN_FALLBACK = process.env.VERSANT_DEMO_TREATMENT_TOKEN ?? null;
const TERRY_INTRO_PLAYBACK_ID = process.env.VERSANT_TERRY_INTRO_MUX_ID ?? null;

function firstNameOf(full: string | null | undefined): string | null {
  if (!full) return null;
  const [first] = full.trim().split(/\s+/);
  return first || null;
}

export default async function VersantPitchPage({ searchParams }: PageProps) {
  const token = typeof searchParams?.t === "string" ? searchParams.t : null;

  // Look up personalization data, if a token is present.
  const link = token
    ? await prisma.screeningLink.findUnique({
        where: { token },
        select: {
          token: true,
          isActive: true,
          recipientName: true,
          customWelcomeMessage: true,
          ctaUrl: true,
          ctaLabel: true,
        },
      })
    : null;

  const recipientFirstName = link?.isActive
    ? firstNameOf(link.recipientName)
    : null;

  // If the token belongs to the Versant reel, use it as the deep-link to the reel.
  // Otherwise, fall back to the env-configured demo token (so the page is usable
  // without personalization while we finish wiring real screening links).
  const reelScreeningToken = link?.isActive
    ? link.token
    : REEL_SCREENING_TOKEN_FALLBACK;

  return (
    <main className="min-h-screen bg-[#0e0e0e] font-sans text-white antialiased selection:bg-white/15">
      {/* Top brand strip — mirrors the screening viewer's chrome */}
      <div className="border-b border-white/[0.06] bg-[#080808] px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span>Friends &amp; Family</span>
          <span>For Versant Media</span>
        </div>
      </div>

      <WelcomeSplash recipientFirstName={recipientFirstName} />

      <TerryIntro videoPlaybackId={TERRY_INTRO_PLAYBACK_ID} />

      <GolfTab />

      <BriefAnswer
        reelScreeningToken={reelScreeningToken}
        treatmentToken={TREATMENT_TOKEN_FALLBACK}
      />

      <BusinessIntel />

      <FFCompanyCard />

      <ContactCta
        ctaUrl={link?.ctaUrl}
        ctaLabel={link?.ctaLabel}
        recipientFirstName={recipientFirstName}
      />
    </main>
  );
}
