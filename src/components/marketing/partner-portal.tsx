"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const MARKETING_PARTNERS = {
  colossal: {
    label: "COLOSSAL",
    location: "Curitiba",
    href: "https://colossal.film/",
    cityCode: "CWB",
    kicker: "CURITIBA / POST / ANIMATION / VFX",
    headline: "Finish with force.",
    body:
      "COLOSSAL extends the studio system into post, animation, VFX, compositing, motion design, and finishing from Curitiba.",
    nav: ["HOME", "ABOUT", "WORK", "CONTACT"],
    heroLines: ["COLOSSAL"],
    index: ["POST", "ANIMATION", "VFX", "FINISHING"],
    ticker: ["COMPOSITING", "MOTION", "CG", "DESIGN", "COLOR", "FINISH"],
    modules: [
      {
        label: "01",
        title: "Post",
        text: "Offline, online, conform, finish.",
        detail: "Editorial control, clean finishing, and final delivery paths.",
      },
      {
        label: "02",
        title: "Animation",
        text: "Motion systems and character work.",
        detail: "Designed movement for titles, worlds, graphics, and campaigns.",
      },
      {
        label: "03",
        title: "VFX",
        text: "Compositing, cleanup, buildouts.",
        detail: "Invisible repairs and visible spectacle handled in one pipeline.",
      },
      {
        label: "04",
        title: "Design",
        text: "Frames, graphics, visual language.",
        detail: "A sharp frame language before the edit, during it, and after.",
      },
    ],
  },
  youth: {
    label: "THE YOUTH",
    location: "São Paulo",
    href: "https://theyouth.com.br/",
    cityCode: "SP",
    kicker: "SÃO PAULO / DIRECTORS / CULTURE / PRODUCTION",
    headline: "Culture first. Production close.",
    body:
      "THE YOUTH extends the studio system through São Paulo directors, casting, production, and culture work across the Americas.",
    nav: ["DIRECTORS", "ABOUT", "CULTURE", "COLOSSAL"],
    heroLines: ["THE", "YOUTH"],
    index: ["DIRECTORS", "CULTURE", "CASTING", "PRODUCTION"],
    ticker: ["SÃO PAULO", "DIRECTORS", "CASTING", "CULTURE", "PRODUCTION", "BRAZIL"],
    modules: [
      {
        label: "SP",
        title: "Directors",
        text: "Local perspective, global work.",
        detail: "A São Paulo lens connected to production across the Americas.",
      },
      {
        label: "01",
        title: "Culture",
        text: "People, music, fashion, movement.",
        detail: "Work shaped by the people and scenes moving through the city.",
      },
      {
        label: "02",
        title: "Casting",
        text: "Faces and communities with gravity.",
        detail: "Casting with presence, specificity, and lived texture.",
      },
      {
        label: "03",
        title: "Production",
        text: "Crews, locations, execution.",
        detail: "A direct line into Brazil for shoots that need to feel close.",
      },
    ],
  },
} as const;

export type PartnerId = keyof typeof MARKETING_PARTNERS;

type PartnerConfig = (typeof MARKETING_PARTNERS)[PartnerId];

interface PartnerPortalProps {
  partnerId: PartnerId;
  onClose: () => void;
}

export function PartnerPortal({ partnerId, onClose }: PartnerPortalProps) {
  const partner = MARKETING_PARTNERS[partnerId];
  const titleId = `partner-portal-${partnerId}`;

  return (
    <PartnerSitePortal
      partner={partner}
      titleId={titleId}
      onClose={onClose}
    />
  );
}

interface PartnerSitePortalProps {
  partner: PartnerConfig;
  titleId: string;
  onClose: () => void;
}

function PartnerSitePortal({
  partner,
  titleId,
  onClose,
}: PartnerSitePortalProps) {
  const [loaded, setLoaded] = useState(false);
  const isColossal = partner.label === "COLOSSAL";
  const host = partner.href.replace(/^https?:\/\//, "").replace(/\/$/, "");

  useEffect(() => {
    setLoaded(false);
    const loadFallback = window.setTimeout(() => setLoaded(true), 2200);
    return () => window.clearTimeout(loadFallback);
  }, [partner.href]);

  return (
    <div
      className={cn(
        "partner-site-portal fixed inset-0 z-[70] overflow-hidden bg-black text-white",
        isColossal ? "partner-site-portal--colossal" : "partner-site-portal--youth",
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      <span id={titleId} className="sr-only">
        {partner.label}
      </span>
      <div className="partner-site-portal__curtain" aria-hidden="true">
        <span>{partner.label}</span>
      </div>

      <header className="relative z-20 grid h-ff-nav grid-cols-[1fr_auto] items-center border-b border-white/15 bg-black px-ff-x md:grid-cols-[1fr_auto_1fr]">
        <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/48">
          Studio / Live
        </p>
        <p className="hidden font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white md:block">
          {partner.label}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="justify-self-end font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/60 transition-colors hover:text-white"
        >
          Close
        </button>
      </header>

      <main
        className={cn(
          "partner-site-portal__main relative z-10 grid h-[calc(100svh-var(--ff-nav-height))] grid-cols-1 gap-4 px-ff-x py-4 md:gap-6 md:py-6",
          isColossal
            ? "md:grid-cols-[minmax(15rem,0.18fr)_1fr]"
            : "md:grid-cols-[minmax(7rem,0.14fr)_1fr]",
        )}
      >
        <aside className="partner-site-portal__rail hidden border-r border-white/15 pr-5 md:flex md:flex-col md:justify-between">
          <div>
            <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/42">
              {partner.location}
            </p>
            <p
              className={cn(
                "ff-font-display mt-4 font-semibold uppercase leading-[0.86] tracking-normal",
                isColossal
                  ? "text-[clamp(2.25rem,3.25vw,3.25rem)]"
                  : "text-[clamp(2.75rem,6vw,5.5rem)]",
              )}
            >
              {partner.heroLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px border border-white/12 bg-white/12">
              {partner.index.map((item) => (
                <span
                  key={item}
                  className="bg-black px-3 py-3 font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/56"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <a
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/70 transition-colors hover:text-white"
          >
            Open full site →
          </a>
        </aside>

        <section className="partner-site-portal__browser min-h-0 overflow-hidden border border-white/18 bg-[#050505]">
          <div className="flex h-11 items-center justify-between border-b border-white/14 bg-black px-3 md:px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/80" />
              <span className="h-2 w-2 rounded-full bg-white/42" />
              <span className="h-2 w-2 rounded-full bg-white/22" />
            </div>
            <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/52">
              {host}
            </p>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/62 transition-colors hover:text-white"
            >
              Open →
            </a>
          </div>

          <div className="relative h-[calc(100%-2.75rem)] bg-black">
            {!loaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/50">
                  Loading {partner.label}
                </p>
              </div>
            )}
            <iframe
              key={partner.href}
              title={`${partner.label} live site`}
              src={partner.href}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
              onLoad={() => setLoaded(true)}
              className="h-full w-full border-0 bg-black"
            />
          </div>
        </section>
      </main>

      <style>{`
        @keyframes partnerSiteCurtain {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          64% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            visibility: hidden;
            transform: translate3d(-100%, 0, 0);
          }
        }

        @keyframes partnerSiteCurtainType {
          from {
            opacity: 0;
            transform: translate3d(2rem, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes partnerSiteBrowserIn {
          from {
            opacity: 0;
            transform: translate3d(5vw, 0, 0) scaleX(0.96);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scaleX(1);
          }
        }

        .partner-site-portal__curtain {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          pointer-events: none;
          animation: partnerSiteCurtain 980ms cubic-bezier(0.76, 0, 0.24, 1) both;
        }

        .partner-site-portal__curtain span {
          font-family: var(--ff-font-display);
          font-size: clamp(4rem, 15vw, 16rem);
          font-weight: 650;
          font-stretch: 92%;
          font-variation-settings: "wdth" 92, "wght" 650;
          line-height: 0.8;
          letter-spacing: 0;
          text-transform: uppercase;
          animation: partnerSiteCurtainType 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .partner-site-portal__main {
          background: #000;
        }

        .partner-site-portal__rail,
        .partner-site-portal__browser {
          opacity: 0;
          animation: partnerSiteBrowserIn 720ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both;
        }

        .partner-site-portal__browser {
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
        }

        @media (max-width: 767px) {
          .partner-site-portal__main {
            padding-inline: 0;
            padding-bottom: 0;
          }

          .partner-site-portal__browser {
            border-inline: 0;
            border-bottom: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .partner-site-portal *,
          .partner-site-portal__curtain {
            animation: none !important;
            transition: none !important;
          }

          .partner-site-portal__curtain {
            display: none;
          }

          .partner-site-portal__rail,
          .partner-site-portal__browser {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
