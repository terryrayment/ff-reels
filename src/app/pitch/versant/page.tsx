import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { WelcomeSplash } from "./sections/welcome-splash";
import { TerryIntro } from "./sections/terry-intro";
import { CapabilityDashboard } from "./sections/capability-dashboard";
import { OurWork } from "./sections/our-work";
import { RosterModes } from "./sections/roster-modes";
import { GolfReadStrip } from "./sections/golf-read-strip";
import { VersantFit } from "./sections/versant-fit";
import { ContactCta } from "./sections/contact-cta";
import { VersantMotion } from "./sections/versant-motion";

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

  const directors = await prisma.director.findMany({
    where: { slug: { in: [...DIRECTOR_SLUGS] } },
    select: {
      slug: true,
      name: true,
      headshotUrl: true,
      projects: {
        where: { isPublished: true, muxPlaybackId: { not: null } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          title: true,
          brand: true,
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

  const orderedDirectors = DIRECTOR_SLUGS.map((slug) =>
    directors.find((director) => director.slug === slug),
  ).filter((director): director is NonNullable<typeof director> => Boolean(director));

  return (
    <main
      className="min-h-screen bg-[var(--versant-soft-gray)] font-sans text-[var(--versant-ink)] antialiased selection:bg-[#ff4b32]/25"
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
      <OurWork
        reelScreeningToken={reelScreeningToken}
        directors={orderedDirectors}
      />
      <CapabilityDashboard directors={orderedDirectors} />
      <RosterModes directors={orderedDirectors} />
      <GolfReadStrip />
      <VersantFit />
      <ContactCta
        ctaUrl={link?.ctaUrl}
        ctaLabel={link?.ctaLabel}
        recipientFirstName={recipientFirstName}
      />
    </main>
  );
}
