import {
  motionForDirector,
  muxAnimatedUrl,
  muxStillUrl,
  type VersantDirectorMedia,
} from "./media";

interface Props {
  recipientFirstName?: string | null;
  directors: VersantDirectorMedia[];
}

type HeroFrameSource =
  | {
      slug: string;
      className?: string;
    }
  | {
      media: {
        muxPlaybackId: string;
        duration: number;
        start?: number;
      };
      className?: string;
    };

const HERO_FRAMES: HeroFrameSource[] = [
  {
    media: {
      muxPlaybackId: "sn3KQhbwqIZkB68027UK005KQ6G2NOmVAdUEYBPmXH00as",
      duration: 30.072667,
    },
    className: "scale-[1.16]",
  },
  {
    media: {
      muxPlaybackId: "mldgNDnlz8jpGULSbIQHAaNyHQrdk9rRXfmt4QWbjbY",
      duration: 30.780756,
    },
    className: "scale-[1.2]",
  },
  {
    media: {
      muxPlaybackId: "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po",
      duration: 50.550511,
    },
    className: "scale-[1.12]",
  },
  {
    media: {
      muxPlaybackId: "qLKRhYTxoAN7Wrri3jm1yVTbuziYByniTQz4E8TA01MY",
      duration: 45.170122,
      start: 11,
    },
    className: "scale-[1.14]",
  },
];
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
  const motionFrames = HERO_FRAMES.map((frame) => {
    if ("media" in frame && frame.media) {
      return {
        still: muxStillUrl(
          frame.media.muxPlaybackId,
          640,
          frame.media.duration,
          frame.media.start,
        ),
        animated: muxAnimatedUrl(
          frame.media.muxPlaybackId,
          640,
          frame.media.duration,
          frame.media.start,
        ),
        className: frame.className,
      };
    }

    if ("slug" in frame) {
      return {
        ...motionForDirector(directors, frame.slug, 640),
        className: frame.className,
      };
    }

    return {
      still: null,
      animated: null,
      className: frame.className,
    };
  }).filter((frame) => frame.still);

  return (
    <section className="px-4 py-4 text-[var(--versant-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[21px] bg-black p-7 text-[var(--versant-white)] sm:p-10 lg:col-span-12 lg:min-h-[calc(100svh-2rem)] lg:p-12 xl:rounded-[26px]">
          {motionFrames.length > 0 && (
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-28 grid h-[42%] grid-cols-2 gap-2 opacity-[0.5] mix-blend-screen blur-[0.2px] sm:inset-x-auto sm:right-8 sm:top-32 sm:h-[48%] sm:w-[48%]"
            >
              {motionFrames.slice(0, 4).map((frame, index) => (
                <div
                  key={frame.still ?? index}
                  className={`overflow-hidden rounded-[12px] bg-white/5 ${
                    index === 0 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <MotionFrame
                    animated={frame.animated}
                    still={frame.still}
                    alt=""
                    className={`h-full w-full object-cover ${frame.className ?? ""}`}
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
