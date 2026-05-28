import {
  motionForDirector,
  muxAnimatedUrl,
  muxStillUrl,
  type VersantDirectorMedia,
} from "./media";
import { TagList } from "./system";

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
const PORTFOLIO_TICKER =
  "PGA Tour · U.S. Open · The Open Championship · U.S. Women's Open · NASCAR Cup Playoffs · Premier League · WWE SmackDown · WNBA · Pac-12 + Atlantic 10 hoops · LOVB · 10,000+ hours of live sport on USA Sports in 2026";
const HERO_MICRO_LABEL = "text-[13px] font-medium leading-none tracking-[-0.01em]";
const HERO_CAPABILITIES = [
  "Live promos",
  "Talent films",
  "Golf Channel",
  "GolfNow",
  "Social cutdowns",
  "Post",
  "Motion",
  "Versioning",
  "Delivery",
];

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
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[1600px] gap-3 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[8px] border border-white/10 bg-black p-6 text-[var(--versant-white)] sm:p-8 lg:col-span-12 lg:min-h-[calc(100svh-2rem)] lg:p-10">
          <div className={`relative z-10 flex items-center justify-between gap-4 text-white/50 ${HERO_MICRO_LABEL}`}>
            <FFLogomark />
            {recipientFirstName && <span>For {recipientFirstName}</span>}
          </div>

          <div className="relative z-10 grid gap-8 py-12 lg:grid-cols-12 lg:items-end lg:py-16">
            <div className="lg:col-span-7">
              <p className={`mb-7 text-white/62 ${HERO_MICRO_LABEL}`}>
                Overview
              </p>
              <h1 className="versant-display max-w-[13ch] text-[clamp(54px,8.4vw,128px)] font-medium tracking-[-0.045em]">
                Friends &amp; Family for Versant{" "}
                <span className="font-light">Sports</span>
              </h1>
              <p className="mt-6 max-w-[40rem] text-[clamp(19px,2vw,30px)] leading-[1.12] tracking-[-0.03em] text-white/68">
                Creative, production, edit, motion, and delivery for Versant&apos;s
                sports portfolio.
              </p>
              <TagList tags={HERO_CAPABILITIES} dark className="mt-7 max-w-2xl" />
            </div>

            {motionFrames.length > 0 && (
              <div
                aria-hidden="true"
                className="grid aspect-[4/3] grid-cols-2 gap-2 opacity-70 lg:col-span-5 lg:aspect-[5/4]"
              >
                {motionFrames.slice(0, 4).map((frame, index) => (
                  <div
                    key={frame.still ?? index}
                    className={`versant-media bg-white/5 ${
                      index === 0 ? "row-span-2" : ""
                    }`}
                  >
                    <MotionFrame
                      animated={frame.animated}
                      still={frame.still}
                      alt=""
                      className={`versant-card-image h-full w-full object-cover ${frame.className ?? ""}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`relative z-10 mt-4 overflow-hidden border-t border-white/10 pt-3 text-white/36 ${HERO_MICRO_LABEL}`}>
            <div className="versant-marquee flex w-max gap-8 motion-reduce:animate-none">
              <span>{PORTFOLIO_TICKER}</span>
              <span aria-hidden="true">{PORTFOLIO_TICKER}</span>
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
