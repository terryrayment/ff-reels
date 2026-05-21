import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { WelcomeSplash } from "./sections/welcome-splash";
import { TerryIntro } from "./sections/terry-intro";
import { CapabilityDashboard } from "./sections/capability-dashboard";
import { ProductionStack } from "./sections/production-stack";
import { OurWork } from "./sections/our-work";
import { RosterModes } from "./sections/roster-modes";
import { VersantFit } from "./sections/versant-fit";
import { ContactCta } from "./sections/contact-cta";

/**
 * Branded pitch landing — Friends & Family for Versant Media.
 *
 * Architecture: media/product interface. Golf Channel lead, founder note,
 * capability dashboard, flexible production/post partners, roster modes,
 * range reel, Versant fit, and assignment-shape close.
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

const REEL_SCREENING_TOKEN_FALLBACK = process.env.VERSANT_DEMO_REEL_TOKEN ?? null;
const TERRY_INTRO_PLAYBACK_ID = process.env.VERSANT_TERRY_INTRO_MUX_ID ?? null;

const VERSANT_THEME = {
  "--versant-black": "#101010",
  "--versant-ink": "#0b0b0b",
  "--versant-paper": "#eeeeeb",
  "--versant-white": "#ffffff",
  "--versant-orange": "#ff4b32",
  "--versant-lime": "#d8f000",
  "--versant-blue": "#2637ff",
  "--versant-mint": "#dcefee",
  "--versant-gray": "#b8b8b5",
  "--versant-soft-gray": "#e2e2df",
} as CSSProperties;

function firstNameOf(full: string | null | undefined): string | null {
  if (!full) return null;
  const [first] = full.trim().split(/\s+/);
  return first || null;
}

export default async function VersantPitchPage({ searchParams }: PageProps) {
  const token = typeof searchParams?.t === "string" ? searchParams.t : null;

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

  const reelScreeningToken = link?.isActive
    ? link.token
    : REEL_SCREENING_TOKEN_FALLBACK;

  return (
    <main
      className="min-h-screen bg-[var(--versant-soft-gray)] font-sans text-[var(--versant-ink)] antialiased selection:bg-[#ff4b32]/25"
      style={VERSANT_THEME}
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-[#101010]/20"
      />

      <WelcomeSplash recipientFirstName={recipientFirstName} />
      <TerryIntro videoPlaybackId={TERRY_INTRO_PLAYBACK_ID} />
      <CapabilityDashboard />
      <ProductionStack />
      <RosterModes />
      <OurWork reelScreeningToken={reelScreeningToken} />
      <VersantFit />
      <ContactCta
        ctaUrl={link?.ctaUrl}
        ctaLabel={link?.ctaLabel}
        recipientFirstName={recipientFirstName}
      />
    </main>
  );
}
