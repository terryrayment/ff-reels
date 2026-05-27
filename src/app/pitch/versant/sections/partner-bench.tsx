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
    role: "cross-cultural production reach",
    copy:
      "Brazil-based collaborator support when the job needs local fluency, a wider footprint, or a production path that understands the room.",
    visual: {
      label: "PEPSI BLACK",
      videoSrc: "/versant/pepsi-black-skate.mp4",
    },
  },
  {
    name: "Colossal",
    href: "https://colossal.film/",
    role: "post, motion, finishing",
    copy:
      "A post-forward collaborator lane for animation, design, mixed media, compositing, cleanup, versioning, and finish-heavy work.",
    visual: {
      label: "Colossal reel",
      vimeoId: "859353559",
      hash: "c300ebf8bb",
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
    <div
      className="relative aspect-video overflow-hidden rounded-[28px] bg-black/70"
      aria-hidden="true"
    >
      {visual.videoSrc ? (
        <video
          src={visual.videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.9]"
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
      <div className="absolute inset-0 bg-[var(--versant-black)]/16 transition duration-500 group-hover:bg-[var(--versant-black)]/6" />
      <div className="absolute bottom-4 left-4 rounded-full bg-black/48 px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-white/72">
        {visual.label}
      </div>
    </div>
  );
}

export function PartnerBench() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-[38px] bg-[var(--versant-black)] p-7 text-[var(--versant-white)] shadow-[0_22px_70px_rgba(17,17,14,0.12)] sm:p-10 lg:rounded-[52px] lg:p-12">
          <div className="mb-10 grid gap-6 lg:grid-cols-12">
            <p className="text-[15px] font-medium text-white/48 lg:col-span-3">
              partner bench
            </p>
            <h2 className="versant-display max-w-5xl text-[clamp(42px,6.4vw,96px)] font-medium tracking-[-0.04em] lg:col-span-8">
              More ways to make the work travel.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {PARTNERS.map((partner) => (
              <article
                key={partner.name}
                className="group relative grid min-w-0 gap-6 rounded-[34px] bg-white/[0.055] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.075] sm:p-6"
              >
                <PartnerVideo visual={partner.visual} />
                <div className="grid gap-5 border-t border-white/16 pt-5 md:grid-cols-[0.75fr_1fr]">
                  <div>
                    <p className="text-[clamp(34px,4.6vw,64px)] font-medium leading-[0.98] tracking-[-0.04em]">
                      {partner.name}
                    </p>
                    <p className="mt-3 text-[15px] text-white/52">
                      {partner.role}
                    </p>
                  </div>
                  <p className="max-w-[42rem] text-[clamp(19px,2vw,28px)] leading-[1.16] tracking-[-0.025em] text-white/70">
                    {partner.copy}
                  </p>
                </div>
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${partner.name}`}
                  className="absolute inset-0 z-10 rounded-[34px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
                />
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-5xl border-t border-white/16 pt-6 text-[clamp(20px,2.6vw,36px)] leading-[1.08] tracking-[-0.035em] text-white/78">
            Local production when the world shifts. Post, motion, animation,
            and mixed media when the finish has to carry the idea.
          </p>
        </div>
      </div>
    </section>
  );
}
