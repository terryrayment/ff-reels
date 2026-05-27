import { muxAnimatedUrl, muxStillUrl } from "./media";

type PartnerVisual = {
  label: string;
  muxPlaybackId: string;
  duration: number;
  sampleStart?: number;
  featured?: boolean;
};

const PARTNERS = [
  {
    name: "The Youth",
    href: "https://theyouth.com.br/",
    role: "cross-cultural production reach",
    copy:
      "Brazil-based collaborator support when the job needs local fluency, a wider footprint, or a production path that understands the room.",
    visuals: [
      {
        label: "Pepsi Black",
        muxPlaybackId: "F7568Kj8LjOQ01g015KwGkiLhjylEb2frWqrWEob73SBQ",
        duration: 102.018589,
        featured: true,
      },
      {
        label: "Pepsi Black",
        muxPlaybackId: "Pt5GxchkTMGP00VizOePfNnXwIIcT004oWCXwIH5EHWFQ",
        duration: 86.0443,
      },
      {
        label: "Pepsi Black",
        muxPlaybackId: "5KAccIKwiPmhMhWv7yP6gJVuBopxVddoYsSHuvVLj01I",
        duration: 87.128722,
      },
      {
        label: "Adidas JD",
        muxPlaybackId: "300zq41gfItMlVqCNvpUlrZcVC800xhYm9AofWIEiFtR4",
        duration: 45.817089,
      },
    ],
  },
  {
    name: "Colossal",
    href: "https://colossal.film/",
    role: "post, motion, finishing",
    copy:
      "A post-forward collaborator lane for animation, design, mixed media, compositing, cleanup, versioning, and finish-heavy work.",
    visuals: [
      {
        label: "motion",
        muxPlaybackId: "02HikMKRLYLsIJNrIAuKMA02UYs009C9NbiJA6SixKvt5o",
        duration: 15.140122,
        featured: true,
      },
      {
        label: "mixed media",
        muxPlaybackId: "feQSUP17mpG4Ay8bAHFPHuXx66CQwudaK4uKlUMj4pw",
        duration: 60.3603,
      },
      {
        label: "systems",
        muxPlaybackId: "BlkK15NT4dra33c00NIF7xC801odyDG9qD3iB1nn6iL00w",
        duration: 60.393678,
      },
      {
        label: "texture",
        muxPlaybackId: "vqAlDQVGkErsXS00VKhafavM02viB4crudGcbSX397bfQ",
        duration: 68.359967,
      },
      {
        label: "finish",
        muxPlaybackId: "Hshs6aNWVWAAnfexbFS9goPEruq7IRiMAJJewUBMYfA",
        duration: 15.057667,
      },
      {
        label: "comedy",
        muxPlaybackId: "enm5pnPkRXQZPsP600t5fMe4b5AWqTv3CErkQ5bMSySM",
        duration: 50.417089,
      },
    ],
  },
] as const;

function VisualGrid({ visuals }: { visuals: readonly PartnerVisual[] }) {
  return (
    <div
      className="grid h-[19rem] grid-cols-4 grid-rows-2 gap-px overflow-hidden rounded-[28px] bg-black/55 sm:h-[24rem]"
      aria-hidden="true"
    >
      {visuals.map((visual, index) => (
        <div
          key={`${visual.muxPlaybackId}-${index}`}
          className={[
            "relative min-w-0 overflow-hidden bg-black",
            visual.featured ? "col-span-2 row-span-2" : "col-span-2",
          ].join(" ")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={muxStillUrl(
              visual.muxPlaybackId,
              visual.featured ? 760 : 460,
              visual.duration,
              visual.sampleStart,
            )}
            alt=""
            className="h-full w-full scale-[1.04] object-cover opacity-80 motion-safe:hidden"
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={muxAnimatedUrl(
              visual.muxPlaybackId,
              visual.featured ? 760 : 460,
              visual.duration,
              visual.sampleStart,
            )}
            alt=""
            className="hidden h-full w-full scale-[1.04] object-cover opacity-[0.82] motion-safe:block"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[var(--versant-black)]/18" />
        </div>
      ))}
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
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noreferrer"
                className="group grid min-w-0 gap-6 rounded-[34px] bg-white/[0.055] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.075] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)] sm:p-6"
              >
                <VisualGrid visuals={partner.visuals} />
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
              </a>
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
