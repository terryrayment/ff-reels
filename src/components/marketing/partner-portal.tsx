"use client";

import Link from "next/link";
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
  onPartnerChange: (partnerId: PartnerId) => void;
}

export function PartnerPortal({
  partnerId,
  onClose,
  onPartnerChange,
}: PartnerPortalProps) {
  const partner = MARKETING_PARTNERS[partnerId];
  const titleId = `partner-portal-${partnerId}`;

  return (
    <PartnerSitePortal
      key={partnerId}
      partnerId={partnerId}
      partner={partner}
      titleId={titleId}
      onClose={onClose}
      onPartnerChange={onPartnerChange}
    />
  );
}

interface PartnerSitePortalProps {
  partnerId: PartnerId;
  partner: PartnerConfig;
  titleId: string;
  mode?: "modal" | "page";
  onClose?: () => void;
  onPartnerChange?: (partnerId: PartnerId) => void;
}

export function PartnerPage({ partnerId }: { partnerId: PartnerId }) {
  const partner = MARKETING_PARTNERS[partnerId];
  return (
    <PartnerSitePortal
      partnerId={partnerId}
      partner={partner}
      titleId={`partner-page-${partnerId}`}
      mode="page"
    />
  );
}

function PartnerSitePortal({
  partnerId,
  partner,
  titleId,
  mode = "modal",
  onClose,
  onPartnerChange,
}: PartnerSitePortalProps) {
  const isColossal = partner.label === "COLOSSAL";
  const host = partner.href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const isPage = mode === "page";

  return (
    <div
      className={cn(
        "partner-site-portal bg-black text-white",
        isPage
          ? "partner-site-page relative min-h-screen overflow-x-hidden pt-ff-nav"
          : "fixed inset-0 z-[70] overflow-hidden",
        isColossal ? "partner-site-portal--colossal" : "partner-site-portal--youth",
      )}
      aria-modal={isPage ? undefined : "true"}
      role={isPage ? undefined : "dialog"}
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
        <div className="hidden items-center justify-self-center gap-4 font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide md:flex">
          {(Object.keys(MARKETING_PARTNERS) as PartnerId[]).map((id) => {
            const option = MARKETING_PARTNERS[id];
            const active = id === partnerId;
            return isPage ? (
              <Link
                key={id}
                href={id === "youth" ? "/site/youth" : "/site/colossal"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition-colors",
                  active
                    ? "text-white"
                    : "text-white/42 hover:text-white focus-visible:text-white",
                )}
              >
                {option.label}
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onPartnerChange?.(id)}
                className={cn(
                  "transition-colors",
                  active
                    ? "text-white"
                    : "text-white/42 hover:text-white focus-visible:text-white",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {isPage ? (
          <Link
            href="/site"
            className="justify-self-end font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/60 transition-colors hover:text-white"
          >
            Home
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="justify-self-end font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/60 transition-colors hover:text-white"
          >
            Close
          </button>
        )}
      </header>

      <main
        className={cn(
          "partner-site-portal__main relative z-10 grid grid-cols-1 gap-4 overflow-hidden px-ff-x py-4 md:gap-6 md:py-6",
          isPage
            ? "min-h-[calc(100svh-(var(--ff-nav-height)*2))]"
            : "h-[calc(100svh-var(--ff-nav-height))]",
          isColossal
            ? "md:grid-cols-[minmax(15rem,0.18fr)_1fr]"
            : "md:grid-cols-[minmax(12rem,0.18fr)_1fr]",
        )}
      >
        <aside className="partner-site-portal__rail hidden min-w-0 overflow-hidden border-r border-white/15 pr-5 md:flex md:flex-col md:justify-between">
          <div>
            <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/42">
              {partner.location}
            </p>
            <p
              className={cn(
                "partner-site-portal__rail-title ff-font-display mt-4 max-w-full font-semibold uppercase leading-[0.86] tracking-normal",
                isColossal
                  ? "text-[clamp(2.25rem,3.25vw,3.25rem)]"
                  : "text-[clamp(2.25rem,3.5vw,3.6rem)]",
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

          <div className="partner-site-portal__preview h-[calc(100%-2.75rem)] overflow-y-auto bg-black">
            <div className="partner-site-portal__preview-hero min-h-full px-5 py-6 md:px-9 md:py-10">
              <div className="flex items-center justify-between border-b border-white/14 pb-4 font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/48">
                <span>{partner.kicker}</span>
                <span>{partner.cityCode}</span>
              </div>

              <div className="grid min-h-[calc(100svh-13rem)] content-between gap-10 py-8">
                <div>
                  <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/52">
                    {partner.location}
                  </p>
                  <h2
                    className={cn(
                      "ff-font-display mt-5 max-w-[9ch] font-semibold uppercase leading-[0.78] tracking-normal text-white",
                      isColossal
                        ? "text-[clamp(4.5rem,13vw,12rem)]"
                        : "text-[clamp(5rem,16vw,15rem)]",
                    )}
                  >
                    {partner.heroLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
                  <p className="ff-font-display text-[clamp(2.15rem,5.4vw,5.75rem)] font-semibold uppercase leading-[0.9] text-white">
                    {partner.headline}
                  </p>
                  <p className="max-w-xl font-helveticaText text-[clamp(1.1rem,1.9vw,1.65rem)] leading-[1.18] text-white/70">
                    {partner.body}
                  </p>
                </div>
              </div>

              <div className="grid border-y border-white/14 md:grid-cols-4">
                {partner.modules.map((module) => (
                  <article
                    key={`${module.label}-${module.title}`}
                    className="min-w-0 overflow-hidden border-b border-white/14 py-5 md:border-b-0 md:border-r md:px-5 md:last:border-r-0"
                  >
                    <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/42">
                      {module.label}
                    </p>
                    <h3 className="ff-font-display mt-5 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold uppercase leading-[0.9] text-white">
                      {module.title}
                    </h3>
                    <p className="mt-5 font-helveticaText text-ff-small leading-[1.35] text-white/62">
                      {module.text}
                    </p>
                    <p className="mt-4 font-helveticaText text-ff-small leading-[1.35] text-white/42">
                      {module.detail}
                    </p>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 py-6 font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/45">
                {partner.ticker.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
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

        .partner-site-portal,
        .partner-site-portal * {
          min-width: 0;
        }

        .partner-site-portal__preview,
        .partner-site-portal__preview-hero {
          overflow-x: hidden;
        }

        .partner-site-portal__rail-title,
        .partner-site-portal__rail-title span,
        .partner-site-portal__preview-hero h2,
        .partner-site-portal__preview-hero h2 span,
        .partner-site-portal__preview-hero h3,
        .partner-site-portal__preview-hero p,
        .partner-site-portal__preview-hero a {
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .partner-site-portal__rail-title {
          contain: inline-size;
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
