import {
  CARD,
  CONTAINER,
  MEDIA,
  SECTION,
  SectionHeader,
  TagList,
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
    role: "Latin America Production",
    copy:
      "Casting, locations, crew, and cultural read for work that needs more than a U.S. lens.",
    tags: ["Casting", "Locations", "Crew", "Local read"],
    visual: {
      label: "ASHE VERSUS",
      vimeoId: "909300493",
      hash: "9fec138dfe",
    },
  },
  {
    name: "Colossal",
    role: "Post and motion",
    copy:
      "Animation, design, mixed media, cleanup, finish, versioning, and delivery support.",
    tags: ["Post", "Motion", "Animation", "Versioning", "Delivery"],
    visual: {
      label: "Finish reel",
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
    <section className={`${SECTION} bg-[var(--versant-black)] text-[var(--versant-white)]`}>
      <div className={CONTAINER}>
        <SectionHeader
          label="Partners"
          title="Additional production lanes."
          intro="Multiple teams to add global reach."
          dark
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {PARTNERS.map((partner) => (
            <article
              key={partner.name}
              className={`${CARD} group border-white/14 bg-white/[0.045] p-4 text-white hover:border-white/30 hover:bg-white/[0.07] sm:p-5`}
            >
              <PartnerVideo visual={partner.visual} />
              <div className="grid gap-5 border-t border-white/14 pt-5 md:grid-cols-[0.8fr_1fr]">
                <div>
                  <p className="text-[clamp(30px,4vw,54px)] font-medium leading-[0.98] tracking-[-0.045em]">
                    {partner.name}
                  </p>
                  <p className="versant-meta-label mt-3 text-white/45">
                    {partner.role}
                  </p>
                </div>
                <div className="space-y-5">
                  <p className="max-w-[34rem] text-[clamp(17px,1.5vw,21px)] leading-[1.22] tracking-[-0.02em] text-white/66">
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
