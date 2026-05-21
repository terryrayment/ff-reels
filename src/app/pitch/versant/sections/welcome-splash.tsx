import {
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";

interface Props {
  recipientFirstName?: string | null;
  directors: VersantDirectorMedia[];
}

const FORMAT_ROWS = [
  ["Format", "film / promo / open / portrait / cutdown"],
  ["Inputs", "script / boards / footage / talent window"],
  ["Output", "finished, versioned, delivered"],
];

const HERO_DIRECTORS = ["caleb-slain", "boma-iluma", "cody-cloud", "le-ged"];
const GOLF_TICKER =
  "2,000+ live hours · 200+ events · 35% of golf hours watched · USGA through 2032 · Ryder Cup through 2033 · GolfNow 40M tee times · Rory through 2038";

export function WelcomeSplash({ recipientFirstName, directors }: Props) {
  const motionFrames = HERO_DIRECTORS.map((slug) =>
    motionForDirector(directors, slug, 640),
  ).filter((frame) => frame.still);

  return (
    <section className="px-4 py-4 text-[var(--versant-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[42px] bg-[var(--versant-black)] p-7 text-[var(--versant-white)] sm:p-10 lg:col-span-7 lg:min-h-[calc(100svh-2rem)] lg:p-12 xl:rounded-[52px]">
          <div
            aria-hidden="true"
            className="absolute -right-16 top-20 h-52 w-52 rounded-full border border-white/12 sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-12 right-12 hidden h-2 w-2 rounded-full bg-[var(--versant-orange)] lg:block"
          />
          {motionFrames.length > 0 && (
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-28 grid h-[42%] grid-cols-2 gap-2 opacity-[0.42] mix-blend-screen blur-[0.2px] sm:inset-x-auto sm:right-8 sm:top-32 sm:h-[48%] sm:w-[48%]"
            >
              {motionFrames.slice(0, 4).map((frame, index) => (
                <div
                  key={frame.director?.slug ?? index}
                  className={`overflow-hidden rounded-[24px] bg-white/5 ${
                    index === 0 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <MotionFrame
                    animated={frame.animated}
                    still={frame.still}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-white/55">
            <span>Friends &amp; Family for Versant</span>
            <span>
              {recipientFirstName
                ? `For ${recipientFirstName}`
                : "Friends & Family · for Versant"}
            </span>
          </div>

          <div className="relative z-10 max-w-5xl py-12 lg:py-16">
            <p className="mb-6 inline-flex items-baseline gap-2 rounded-full border border-white/18 px-4 py-2 text-white/78">
              <span className="font-serif text-[15px] italic normal-case leading-none tracking-[-0.03em]">
                Friends &amp; Family
              </span>
              <span className="text-[9px] font-medium uppercase leading-none tracking-[0.08em] text-white/46">
                for
              </span>
              <span className="font-serif text-[15px] italic normal-case leading-none tracking-[-0.03em]">
                Versant
              </span>
            </p>
            <h1 className="pb-3 text-[clamp(58px,10vw,140px)] font-medium leading-[0.94] tracking-[-0.07em]">
              Hi Versant.
              <br />
              We make the stuff worth caring about.
            </h1>
            <p className="mt-5 max-w-[38rem] text-[clamp(22px,2.6vw,38px)] leading-[1.06] tracking-[-0.045em] text-white/72">
              A director-led production company — and a not-so-secret golf
              obsession we&apos;ll get to in a minute.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2 border-t border-white/14 pt-5 text-[10px] uppercase tracking-[0.18em] text-white/62">
            {[
              "Production partner",
              "Directors",
              "Live action",
              "Post",
              "Motion",
              "Social delivery",
            ].map((item) => (
              <span key={item} className="rounded-full border border-white/14 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>

          <div className="relative z-10 mt-4 overflow-hidden rounded-full border border-white/12 bg-white/[0.03] py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">
            <div className="versant-marquee flex w-max gap-8 motion-reduce:animate-none">
              <span>{GOLF_TICKER}</span>
              <span aria-hidden="true">{GOLF_TICKER}</span>
            </div>
          </div>
        </article>

        <div className="grid gap-4 lg:col-span-5 lg:grid-rows-[1.2fr_1fr]">
          <article className="rounded-[36px] bg-[var(--versant-orange)] p-6 text-[var(--versant-ink)] sm:p-8 lg:rounded-[44px]">
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="rounded-full bg-[var(--versant-ink)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white">
                Start here
              </p>
              <span className="text-[12px] uppercase tracking-[0.16em] text-black/55">
                live input
              </span>
            </div>
            <h2 className="mb-8 max-w-md text-[clamp(42px,6vw,88px)] font-medium leading-[0.88] tracking-[-0.06em]">
              Bring us the shape.
            </h2>
            <div className="space-y-3">
              {FORMAT_ROWS.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-t border-black/18 pt-3 text-[13px] sm:grid-cols-[5rem_1fr]"
                >
                  <span className="text-[10px] uppercase tracking-[0.18em] text-black/50">
                    {label}
                  </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[34px] bg-[var(--versant-white)] p-6 sm:p-8 lg:rounded-[44px]">
            <p className="mb-8 rounded-full bg-[var(--versant-soft-gray)] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.08em] text-black/62">
              What we are
            </p>
            <p className="max-w-lg text-[clamp(28px,4vw,54px)] font-medium leading-[0.95] tracking-[-0.055em]">
              A director-led production company that can flex around the
              assignment.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MotionFrame({
  animated,
  still,
  alt,
  className,
}: {
  animated: string | null;
  still: string | null;
  alt: string;
  className?: string;
}) {
  if (!still) return null;

  return (
    <>
      {animated && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={animated}
          alt={alt}
          className={`${className ?? ""} hidden motion-safe:block`}
          loading="eager"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={still}
        alt={alt}
        className={`${className ?? ""} ${animated ? "motion-safe:hidden" : ""}`}
        loading="eager"
      />
    </>
  );
}
