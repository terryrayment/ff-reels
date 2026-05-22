import {
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";

interface Props {
  recipientFirstName?: string | null;
  directors: VersantDirectorMedia[];
}

const HERO_DIRECTORS = ["caleb-slain", "boma-iluma", "cody-cloud", "le-ged"];
const GOLF_TICKER =
  "2,000+ live hours · 200+ events · 35% of golf hours watched · USGA through 2032 · Ryder Cup through 2033 · GolfNow 40M tee times · Rory through 2038";
const HERO_MICRO_LABEL = "text-[13px] font-medium leading-none tracking-[-0.01em]";

function FFLogomark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Friends & Family"
      className="h-8 w-auto brightness-0 invert opacity-70"
    />
  );
}

export function WelcomeSplash({ recipientFirstName, directors }: Props) {
  const motionFrames = HERO_DIRECTORS.map((slug) =>
    motionForDirector(directors, slug, 640),
  ).filter((frame) => frame.still);

  return (
    <section className="px-4 py-4 text-[var(--versant-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[42px] bg-[var(--versant-black)] p-7 text-[var(--versant-white)] sm:p-10 lg:col-span-12 lg:min-h-[calc(100svh-2rem)] lg:p-12 xl:rounded-[52px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(198,162,76,0.18),transparent_30%),radial-gradient(circle_at_12%_84%,rgba(242,236,221,0.09),transparent_34%),linear-gradient(132deg,rgba(255,255,255,0.08),transparent_46%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(116deg,transparent_0,transparent_47%,rgba(242,236,221,0.5)_47.5%,transparent_48%),linear-gradient(0deg,rgba(242,236,221,0.18)_1px,transparent_1px)] [background-size:150px_150px,100%_74px]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-[var(--versant-orange)]/14 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 top-20 h-52 w-52 rounded-full border border-white/10 sm:h-72 sm:w-72"
          />
          {motionFrames.length > 0 && (
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-28 grid h-[42%] grid-cols-2 gap-2 opacity-[0.5] mix-blend-screen blur-[0.2px] sm:inset-x-auto sm:right-8 sm:top-32 sm:h-[48%] sm:w-[48%]"
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

          <div className={`relative z-10 flex items-center justify-between gap-4 text-white/48 ${HERO_MICRO_LABEL}`}>
            <FFLogomark />
            {recipientFirstName && <span>For {recipientFirstName}</span>}
          </div>

          <div className="relative z-10 max-w-5xl py-12 lg:py-16">
            <p className={`mb-8 text-white/62 ${HERO_MICRO_LABEL}`}>
              Friends &amp; Family for Versant
            </p>
            <h1 className="versant-display text-[clamp(58px,10vw,140px)] font-medium tracking-[-0.03em]">
              Versant, meet the makers.
            </h1>
            <p className="mt-5 max-w-[34rem] text-[clamp(22px,2.6vw,36px)] leading-[1.12] tracking-[-0.035em] text-white/68">
              A production company that happens to be quietly obsessed with
              sports.
            </p>
          </div>

          <div className={`relative z-10 grid gap-2 border-t border-white/12 pt-5 text-white/54 sm:grid-cols-3 lg:grid-cols-6 ${HERO_MICRO_LABEL}`}>
            {[
              "Production partner",
              "Directors",
              "Live action",
              "Post",
              "Motion",
              "Social delivery",
            ].map((item) => (
              <span key={item} className="text-left sm:text-right">
                {item}
              </span>
            ))}
          </div>

          <div className={`relative z-10 mt-4 overflow-hidden border-t border-white/10 pt-3 text-white/36 ${HERO_MICRO_LABEL}`}>
            <div className="versant-marquee flex w-max gap-8 motion-reduce:animate-none">
              <span>{GOLF_TICKER}</span>
              <span aria-hidden="true">{GOLF_TICKER}</span>
            </div>
          </div>
        </article>

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
