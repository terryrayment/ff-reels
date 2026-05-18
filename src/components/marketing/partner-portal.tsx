"use client";

import { cn } from "@/lib/utils";

export const MARKETING_PARTNERS = {
  colossal: {
    label: "COLOSSAL",
    location: "Curitiba",
    href: "https://colossal.film/",
    kicker: "CURITIBA / POST / ANIMATION / VFX",
    headline: "Finish with force.",
    body:
      "COLOSSAL connects the network to post, animation, VFX, compositing, motion design, and finishing from Curitiba.",
    index: ["POST", "ANIMATION", "VFX", "FINISHING"],
    ticker: ["COMPOSITING", "MOTION", "CG", "DESIGN", "COLOR", "FINISH"],
    modules: [
      { label: "01", title: "Post", text: "Offline, online, finishing." },
      { label: "02", title: "Animation", text: "Motion systems and character work." },
      { label: "03", title: "VFX", text: "Compositing, cleanup, buildouts." },
      { label: "04", title: "Design", text: "Frames, graphics, and visual language." },
    ],
  },
  youth: {
    label: "THE YOUTH",
    location: "São Paulo",
    href: "https://theyouth.com.br/",
    kicker: "SÃO PAULO / DIRECTORS / CULTURE / PRODUCTION",
    headline: "Culture first. Production close.",
    body:
      "THE YOUTH connects São Paulo directors, casting, production, and culture work into the Friends & Family network across the Americas.",
    index: ["DIRECTORS", "CULTURE", "CASTING", "PRODUCTION"],
    ticker: ["SÃO PAULO", "DIRECTORS", "CASTING", "CULTURE", "PRODUCTION", "BRAZIL"],
    modules: [
      { label: "SP", title: "Directors", text: "Local perspective, global work." },
      { label: "01", title: "Culture", text: "People, music, fashion, movement." },
      { label: "02", title: "Casting", text: "Faces and communities with gravity." },
      { label: "03", title: "Production", text: "Crews, locations, and execution." },
    ],
  },
} as const;

export type PartnerId = keyof typeof MARKETING_PARTNERS;

interface PartnerPortalProps {
  partnerId: PartnerId;
  onClose: () => void;
}

export function PartnerPortal({ partnerId, onClose }: PartnerPortalProps) {
  const partner = MARKETING_PARTNERS[partnerId];
  const titleId = `partner-portal-${partnerId}`;
  const isColossal = partnerId === "colossal";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] overflow-y-auto bg-[#050505] text-[#F4F2EC] animate-[partnerPortalIn_520ms_cubic-bezier(0.76,0,0.24,1)_both]",
        isColossal ? "partner-portal--colossal" : "partner-portal--youth",
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[18vh] h-px bg-white/20 animate-[partnerScan_4.8s_linear_infinite]" />
        <div className="absolute inset-y-0 left-[33vw] w-px bg-white/[0.08]" />
        <div className="absolute inset-y-0 right-[22vw] w-px bg-white/[0.08]" />
        <div
          className={cn(
            "absolute -left-[10vw] top-[58vh] h-[30vh] w-[120vw] origin-left bg-white/[0.035]",
            isColossal ? "-rotate-6" : "rotate-3",
          )}
        />
      </div>

      <header className="sticky top-0 z-20 flex h-ff-nav items-center justify-between border-b border-white/15 bg-[#050505]/82 px-ff-x backdrop-blur-md">
        <p className="font-helveticaText text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
          Network / {partner.label}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="font-helveticaText text-[10px] font-medium uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
        >
          Close
        </button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-var(--ff-nav-height))] max-w-[1600px] grid-cols-1 gap-10 px-ff-x py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="mb-5 font-helveticaText text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                {partner.kicker}
              </p>
              <h2
                id={titleId}
                className="max-w-[10ch] font-helveticaDisplay text-[clamp(64px,13vw,190px)] font-normal leading-[0.82] text-white"
              >
                {partner.label}
              </h2>
              <p className="mt-8 max-w-2xl font-helveticaText text-[22px] leading-[1.05] text-white/82 md:text-[32px]">
                {partner.headline}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
              <p className="font-helveticaText text-[15px] leading-relaxed text-white/64 lg:col-span-7">
                {partner.body}
              </p>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-self-start border-b border-white/45 pb-1 font-helveticaText text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white/80 hover:text-white/70 lg:col-span-4 lg:col-start-9"
              >
                Visit {partner.label} →
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            {isColossal ? (
              <ColossalSignal partner={partner} />
            ) : (
              <YouthSignal partner={partner} />
            )}
          </div>
        </section>

        <section className="border-y border-white/15 py-3">
          <div className="flex w-max animate-[partnerTicker_24s_linear_infinite] gap-8 whitespace-nowrap pr-8">
            {[...partner.ticker, ...partner.ticker, ...partner.ticker].map(
              (item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="font-helveticaText text-[10px] font-medium uppercase tracking-[0.24em] text-white/58"
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
            transform: translate3d(0, -2.5rem, 0);
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
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .partner-portal--colossal *,
          .partner-portal--youth * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

type PartnerConfig = (typeof MARKETING_PARTNERS)[PartnerId];

function ColossalSignal({ partner }: { partner: PartnerConfig }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden border border-white/18 bg-black">
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 opacity-30">
        {Array.from({ length: 24 }).map((_, index) => (
          <div key={index} className="border-r border-t border-white/10" />
        ))}
      </div>
      <div className="relative grid min-h-[520px] grid-cols-2 gap-px bg-white/12 p-px">
        {partner.modules.map((module, index) => (
          <div
            key={module.title}
            className="flex min-h-[230px] flex-col justify-between bg-[#050505] p-5 opacity-0 animate-[partnerTileIn_520ms_ease-out_forwards]"
            style={{ animationDelay: `${140 + index * 95}ms` }}
          >
            <span className="font-helveticaText text-[10px] uppercase tracking-[0.22em] text-white/36">
              {module.label}
            </span>
            <div>
              <p className="font-helveticaDisplay text-[28px] font-normal leading-none text-white">
                {module.title}
              </p>
              <p className="mt-3 max-w-[15rem] text-[12px] leading-snug text-white/46">
                {module.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="absolute bottom-5 right-5 font-helveticaDisplay text-[78px] font-normal leading-none text-white/10">
        CWB
      </p>
    </div>
  );
}

function YouthSignal({ partner }: { partner: PartnerConfig }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden border-y border-white/18 py-5">
      <div className="absolute inset-x-0 top-0 h-px bg-white/45" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/45" />
      <p className="absolute right-0 top-3 origin-top-right -rotate-90 font-helveticaText text-[10px] uppercase tracking-[0.24em] text-white/42">
        São Paulo
      </p>
      <div className="space-y-0">
        {partner.modules.map((module, index) => (
          <div
            key={module.title}
            className="grid grid-cols-[4rem_1fr] border-b border-white/14 py-6 opacity-0 animate-[partnerTileIn_520ms_ease-out_forwards]"
            style={{ animationDelay: `${120 + index * 110}ms` }}
          >
            <p className="font-helveticaText text-[10px] uppercase tracking-[0.2em] text-white/38">
              {module.label}
            </p>
            <div>
              <p className="font-helveticaDisplay text-[38px] font-normal leading-[0.92] text-white md:text-[54px]">
                {module.title}
              </p>
              <p className="mt-3 max-w-[24rem] text-[13px] leading-snug text-white/50">
                {module.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {partner.index.map((item) => (
          <span
            key={item}
            className="border border-white/20 px-3 py-2 font-helveticaText text-[10px] uppercase tracking-[0.18em] text-white/58"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
