import {
  CARD,
  CONTAINER,
  MEDIA,
  SECTION,
  SURFACE_GRAIN,
  SectionHeader,
  TagList,
  revealStagger,
} from "./system";

type PartnerVisual = {
  label: string;
  videoSrc?: string;
  vimeoId?: string;
  hash?: string;
  startAt?: string;
};

const PARTNERS = [
  {
    name: "The Youth",
    href: "https://theyouth.com.br/",
    role: "Latin America production support",
    copy:
      "Casting, locations, crew, and cultural read for work that needs more than a U.S. lens.",
    tags: ["Casting", "Locations", "Crew", "Local read"],
    visual: {
      label: "ASHE VERSUS",
      videoSrc: "/versant/pepsi-black-skate.mp4",
    },
  },
  {
    name: "Colossal",
    href: "https://colossal.film/",
    role: "Post and motion",
    copy:
      "Animation, design, mixed media, cleanup, finish, versioning, and delivery support.",
    tags: ["Post", "Motion", "Animation", "Versioning", "Delivery"],
    visual: {
      label: "View Colossal reel",
      videoSrc: "/versant/colossal-reel.mp4",
    },
  },
] as const;

function vimeoPlayerSrc(visual: PartnerVisual & { vimeoId: string }) {
  const params = new URLSearchParams({
    autoplay: "1",
    autopause: "0",
    muted: "1",
    loop: "1",
    controls: "0",
    playsinline: "1",
    byline: "0",
    portrait: "0",
    title: "0",
  });

  if (visual.hash) {
    params.set("h", visual.hash);
  }

  return `https://player.vimeo.com/video/${visual.vimeoId}?${params.toString()}${
    visual.startAt ? `#t=${visual.startAt}` : ""
  }`;
}

function PartnerVideo({ visual }: { visual: PartnerVisual }) {
  return (
    <div className={`${MEDIA} relative aspect-video bg-black/70`} aria-hidden="true">
      {visual.videoSrc ? (
        <video
          src={visual.videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="versant-card-image absolute inset-0 h-full w-full object-cover opacity-[0.9]"
        />
      ) : visual.vimeoId ? (
        <iframe
          src={vimeoPlayerSrc({ ...visual, vimeoId: visual.vimeoId })}
          title=""
          allow="autoplay; fullscreen; picture-in-picture"
          loading="eager"
          className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-[0.88]"
          tabIndex={-1}
        />
      ) : null}
      <div className="absolute inset-0 bg-[var(--versant-black)]/12 transition duration-500 group-hover:bg-[var(--versant-black)]/5" />
      <div className="absolute bottom-3 left-3 text-[12px] font-medium leading-none tracking-[-0.01em] text-white/76">
        {visual.label}
      </div>
    </div>
  );
}

export function PartnerBench() {
  return (
    <section className={`${SECTION} relative overflow-hidden bg-[#2447FF] text-[var(--versant-white)]`}>
      <div aria-hidden="true" className={SURFACE_GRAIN} />
      <div className={`${CONTAINER} relative z-10`}>
        <SectionHeader
          label="Added support"
          title="When the job needs more reach."
          intro="F&amp;F leads with directors and production. When a job needs more reach, we can add trusted support for Latin America production, post, motion, animation, finish, versioning, and delivery."
          dark
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {PARTNERS.map((partner, index) => (
            <article
              key={partner.name}
              className={`${CARD} group border-white/14 bg-white/[0.045] p-4 text-white hover:border-white/30 hover:bg-white/[0.07] sm:p-5`}
              style={revealStagger(index)}
            >
              <PartnerVideo visual={partner.visual} />
              <div className="grid gap-5 border-t border-white/14 pt-5 md:grid-cols-[0.8fr_1fr]">
                <div>
                  <p className="text-[clamp(26px,3.2vw,46px)] font-medium leading-[0.98] tracking-[-0.04em]">
                    <a
                      href={partner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white transition-colors duration-180 hover:text-[#B8C8FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
                    >
                      {partner.name}
                    </a>
                  </p>
                  <p className="versant-meta-label mt-3 text-white/45">
                    {partner.role}
                  </p>
                </div>
                <div className="space-y-5">
                  <p className="max-w-[34rem] text-[clamp(16px,1.4vw,20px)] leading-[1.26] tracking-[-0.018em] text-white/62">
                    {partner.copy}
                  </p>
                  <TagList
                    tags={partner.tags}
                    dark
                    label={`${partner.name} capabilities`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
