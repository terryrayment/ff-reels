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
    role: "local production reach",
    copy:
      "Brazil-based support for casting, locations, crew, and audience fluency when a sports idea needs to move beyond a U.S. read.",
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
      "A finish lane for animation, design, mixed media, compositing, cleanup, versioning, and the last five percent that decides whether the work feels premium.",
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
      className="relative aspect-video overflow-hidden rounded-[14px] bg-black/70"
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
      <div className="absolute bottom-4 left-4 rounded-[7px] bg-black/48 px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-white/72">
        {visual.label}
      </div>
    </div>
  );
}

export function PartnerBench() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-[18px] bg-[var(--versant-black)] p-6 text-[var(--versant-white)] shadow-[0_22px_70px_rgba(17,17,14,0.12)] sm:p-8 lg:rounded-[22px] lg:p-10">
          <div className="mb-8 grid gap-6 border-b border-white/12 pb-8 lg:grid-cols-12 lg:items-end">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/46 lg:col-span-3">
              PRODUCTION BENCH
            </p>
            <h2 className="versant-display max-w-4xl text-[clamp(38px,5.8vw,82px)] font-medium tracking-[-0.045em] lg:col-span-8">
              Specialists when the job needs reach or finish.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {PARTNERS.map((partner) => (
              <article
                key={partner.name}
                className="group relative grid min-w-0 gap-5 rounded-[15px] bg-white/[0.055] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.075] sm:p-5"
              >
                <PartnerVideo visual={partner.visual} />
                <div className="grid gap-5 border-t border-white/16 pt-5 md:grid-cols-[0.75fr_1fr]">
                  <div>
                    <p className="text-[clamp(32px,4vw,56px)] font-medium leading-[0.98] tracking-[-0.04em]">
                      {partner.name}
                    </p>
                    <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.12em] text-white/46">
                      {partner.role}
                    </p>
                  </div>
                  <p className="max-w-[42rem] text-[clamp(17px,1.7vw,23px)] leading-[1.24] tracking-[-0.02em] text-white/68">
                    {partner.copy}
                  </p>
                </div>
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${partner.name}`}
                  className="absolute inset-0 z-10 rounded-[17px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
                />
              </article>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
