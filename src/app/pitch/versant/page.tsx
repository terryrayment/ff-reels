import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { WelcomeSplash } from "./sections/welcome-splash";
import { TerryIntro } from "./sections/terry-intro";
import { FrontNine } from "./sections/front-nine";
import { OurWork } from "./sections/our-work";
import { CaddieCards } from "./sections/caddie-cards";
import { BusinessIntel } from "./sections/business-intel";
import { ContactCta } from "./sections/contact-cta";

/**
 * Branded pitch landing — Friends & Family for Versant Media.
 *
 * Architecture: tournament program. Golf-first hero, founder's note,
 * front nine (production briefs), the reel (the turn), caddie cards
 * (directors as scouting cards), the read (homework shrunk to a
 * single page), the call sheet (contact close).
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
    "A production case for Friends & Family — for Golf Channel, then everything else inside USA Sports.",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  searchParams: { t?: string };
}

const REEL_SCREENING_TOKEN_FALLBACK = process.env.VERSANT_DEMO_REEL_TOKEN ?? null;
const TERRY_INTRO_PLAYBACK_ID = process.env.VERSANT_TERRY_INTRO_MUX_ID ?? null;

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
    <main className="min-h-screen bg-[#0e0e0e] font-sans text-white antialiased selection:bg-[#c9a961]/30">
      {/* hairline scroll progress (decorative) */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-gradient-to-r from-transparent via-[#c9a961]/60 to-transparent"
      />

      <WelcomeSplash recipientFirstName={recipientFirstName} />
      <TerryIntro videoPlaybackId={TERRY_INTRO_PLAYBACK_ID} />
      <FrontNine />
      <OurWork reelScreeningToken={reelScreeningToken} />
      <CaddieCards />
      <BusinessIntel />
      <ContactCta
        ctaUrl={link?.ctaUrl}
        ctaLabel={link?.ctaLabel}
        recipientFirstName={recipientFirstName}
      />
    </main>
  );
}
