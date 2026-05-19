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
      "COLOSSAL connects the network to post, animation, VFX, compositing, motion design, and finishing from Curitiba.",
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
      "THE YOUTH connects São Paulo directors, casting, production, and culture work into the Friends & Family network across the Americas.",
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
  const [activeIndex, setActiveIndex] = useState(0);
  const titleId = `partner-portal-${partnerId}`;
  const isColossal = partnerId === "colossal";
  const activeModule = partner.modules[activeIndex] ?? partner.modules[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [partnerId]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] overflow-y-auto bg-ff-partner-bg text-ff-partner-fg animate-[partnerPortalIn_680ms_cubic-bezier(0.76,0,0.24,1)_both]",
        isColossal ? "partner-portal--colossal" : "partner-portal--youth",
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      <div className="partner-portal__intro" aria-hidden="true">
        <span>{partner.label}</span>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="partner-portal__grain" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_calc(25%-1px),rgba(255,255,255,0.08)_25%,transparent_calc(25%+1px),transparent_calc(50%-1px),rgba(255,255,255,0.08)_50%,transparent_calc(50%+1px),transparent_calc(75%-1px),rgba(255,255,255,0.08)_75%,transparent_calc(75%+1px))]" />
        <div className="absolute inset-x-0 top-[18vh] h-px bg-white/20 animate-[partnerScan_4.8s_linear_infinite]" />
        <div
          className={cn(
            "absolute -left-[12vw] top-[58vh] h-[34vh] w-[130vw] origin-left bg-white/[0.035]",
            isColossal ? "-rotate-5" : "rotate-2",
          )}
        />
        <div className="absolute left-0 top-0 h-full w-full opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:100%_6px]" />
      </div>

      <header className="sticky top-0 z-20 grid h-ff-nav grid-cols-[1fr_auto] items-center border-b border-ff-partner-line bg-ff-partner-bg/85 px-ff-x backdrop-blur-md md:grid-cols-[1fr_auto_1fr]">
        <p className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-ff-partner-muted">
          Network / {partner.label}
        </p>
        <div className="hidden items-center gap-6 md:flex">
          {partner.nav.map((item) => (
            <span
              key={item}
              className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/36"
            >
              {item}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="justify-self-end font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/60 transition-colors hover:text-white"
        >
          Close
        </button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-var(--ff-nav-height))] max-w-[1680px] grid-cols-1 gap-10 px-ff-x py-8 md:py-10 lg:grid-cols-12 lg:gap-10 lg:py-12">
          <div className="flex min-w-0 flex-col justify-between lg:col-span-6 xl:col-span-7">
            <div className="min-w-0">
              <p className="mb-5 font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white/45">
                {partner.kicker}
              </p>
              <h2
                id={titleId}
                className={cn(
                  "partner-portal__title ff-font-display font-normal text-white",
                  isColossal
                    ? "ff-partner-title-colossal"
                    : "ff-partner-title-youth",
                )}
              >
                {partner.heroLines.map((line) => (
                  <span
                    key={line}
                    className={cn(
                      "block",
                      isColossal ? "whitespace-nowrap" : "whitespace-nowrap",
                    )}
                  >
                    {line}
                  </span>
                ))}
              </h2>
              <p className="ff-partner-lede mt-7 max-w-2xl font-helveticaText">
                {partner.headline}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-7 border-t border-ff-partner-line pt-7 md:grid-cols-12 md:items-end">
              <p className="font-helveticaText text-ff-form leading-relaxed text-white/64 md:col-span-7">
                {partner.body}
              </p>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-self-start border-b border-white/45 pb-1 font-helveticaText text-ff-label font-medium uppercase tracking-ff-wide text-white transition-colors hover:border-white/80 hover:text-white/70 md:col-span-4 md:col-start-9"
              >
                Visit {partner.label} →
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5">
            <PartnerSystem
              partner={partner}
              activeIndex={activeIndex}
              activeModule={activeModule}
              isColossal={isColossal}
              setActiveIndex={setActiveIndex}
            />
          </div>
        </section>

        <section className="overflow-hidden border-y border-ff-partner-line py-3">
          <div className="flex w-max animate-[partnerTicker_24s_linear_infinite] gap-8 whitespace-nowrap pr-8">
            {[...partner.ticker, ...partner.ticker, ...partner.ticker].map(
              (item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="font-helveticaText text-ff-label font-medium uppercase tracking-ff-nav text-ff-partner-muted"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </section>
      </main>

      <style>{`
        @keyframes partnerPortalIn {
          from {
            opacity: 0;
            clip-path: inset(0 0 100% 0);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes partnerIntro {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scaleY(1);
          }
          62% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            visibility: hidden;
            transform: translate3d(0, -1.25rem, 0) scaleY(0.92);
          }
        }

        @keyframes partnerIntroType {
          from {
            opacity: 0;
            transform: translate3d(0, 1.3rem, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes partnerScan {
          0% {
            transform: translate3d(0, -18vh, 0);
            opacity: 0;
          }
          12%,
          72% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 88vh, 0);
            opacity: 0;
          }
        }

        @keyframes partnerTicker {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-33.333%, 0, 0);
          }
        }

        @keyframes partnerTileIn {
          from {
            opacity: 0;
            transform: translate3d(0, 1rem, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes partnerMeter {
          from {
            transform: scaleX(0.08);
          }
          to {
            transform: scaleX(1);
          }
        }

        .partner-portal__intro {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ff-color-partner-bg);
          pointer-events: none;
          animation: partnerIntro 860ms cubic-bezier(0.76, 0, 0.24, 1) both;
        }

        .partner-portal__intro span {
          color: white;
          font-family: var(--ff-font-display);
          font-size: var(--ff-type-partner-intro);
          font-weight: 400;
          line-height: 0.82;
          text-transform: uppercase;
          letter-spacing: 0;
          animation: partnerIntroType 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .partner-portal__grain {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0 1px, transparent 1px);
          background-size: 17px 17px, 29px 29px;
        }

        .partner-portal__title {
          max-width: 100%;
          animation: partnerTileIn 620ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both;
        }

        .partner-portal__detail {
          animation: partnerTileIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .partner-portal--colossal *,
          .partner-portal--youth * {
            animation: none !important;
            transition: none !important;
          }

          .partner-portal__intro {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

interface PartnerSystemProps {
  partner: PartnerConfig;
  activeIndex: number;
  activeModule: PartnerConfig["modules"][number];
  isColossal: boolean;
  setActiveIndex: (index: number) => void;
}

function PartnerSystem({
  partner,
  activeIndex,
  activeModule,
  isColossal,
  setActiveIndex,
}: PartnerSystemProps) {
  return (
    <div
      className={cn(
        "relative min-h-[520px] overflow-hidden border border-ff-partner-line bg-black/72",
        isColossal ? "p-px" : "border-x-0 px-0 py-5 md:border-x md:px-5",
      )}
    >
      <div className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-6 opacity-25">
        {Array.from({ length: 24 }).map((_, index) => (
          <div key={index} className="border-r border-t border-white/10" />
        ))}
      </div>

      <div className="relative flex min-h-[520px] flex-col justify-between">
        <div className="grid grid-cols-1 gap-px bg-white/12 md:grid-cols-2">
          {partner.modules.map((module, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={module.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onPointerEnter={() => setActiveIndex(index)}
                className={cn(
                  "group flex min-h-[112px] flex-col justify-between bg-ff-partner-bg p-5 text-left opacity-0 outline-none animate-[partnerTileIn_520ms_ease-out_forwards] transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] md:min-h-[178px]",
                  active && "bg-white/[0.08]",
                )}
                style={{ animationDelay: `${180 + index * 90}ms` }}
              >
                <span className="font-helveticaText text-ff-label uppercase tracking-ff-nav text-white/36">
                  {module.label}
                </span>
                <span>
                  <span className="ff-font-display ff-partner-tile-title block font-normal">
                    {module.title}
                  </span>
                  <span className="ff-meta mt-3 block max-w-[16rem] text-white/48">
                    {module.text}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative border-t border-ff-partner-line bg-ff-partner-bg/92 p-5 md:p-6">
          <div key={activeModule.title} className="partner-portal__detail">
            <p className="font-helveticaText text-ff-label uppercase tracking-ff-nav text-white/38">
              {partner.cityCode} / {activeModule.label}
            </p>
            <p className="ff-font-display ff-partner-detail-title mt-4 font-normal">
              {activeModule.title}
            </p>
            <p className="ff-copy-small mt-4 max-w-[34rem] text-white/56">
              {activeModule.detail}
            </p>
          </div>
          <div className="mt-7 h-px origin-left bg-white/60 animate-[partnerMeter_880ms_cubic-bezier(0.76,0,0.24,1)_both]" />
        </div>

        <p
          className={cn(
            "ff-font-display ff-partner-code pointer-events-none absolute bottom-5 right-5 font-normal",
            isColossal ? "" : "right-auto left-5",
          )}
        >
          {partner.cityCode}
        </p>
      </div>
    </div>
  );
}
