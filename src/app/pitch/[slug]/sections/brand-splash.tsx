import {
  muxAnimatedUrl,
  muxStillUrl,
  type VersantDirectorMedia,
} from "../../versant/sections/media";
import { SURFACE_GRAIN, TagList } from "../../versant/sections/system";

interface Props {
  company: string;
  heroFor: string;
  heroWhy: string;
  ticker: string;
  recipientFirstName?: string | null;
  directors: VersantDirectorMedia[];
}

const HERO_MEDIA: { muxPlaybackId: string; duration: number; start?: number; className?: string }[] = [
  {
    muxPlaybackId: "sn3KQhbwqIZkB68027UK005KQ6G2NOmVAdUEYBPmXH00as",
    duration: 30.072667,
    className: "scale-[1.16]",
  },
  {
    muxPlaybackId: "mldgNDnlz8jpGULSbIQHAaNyHQrdk9rRXfmt4QWbjbY",
    duration: 30.780756,
    className: "scale-[1.2]",
  },
  {
    muxPlaybackId: "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po",
    duration: 50.550511,
    className: "scale-[1.12]",
  },
  {
    muxPlaybackId: "qLKRhYTxoAN7Wrri3jm1yVTbuziYByniTQz4E8TA01MY",
    duration: 45.170122,
    start: 11,
    className: "scale-[1.14]",
  },
];

const HERO_MICRO_LABEL = "text-[13px] font-medium leading-none tracking-[-0.01em]";
const HERO_CAPABILITIES = [
  "Directors",
  "Spots",
  "Talent films",
  "Social cutdowns",
  "Edit",
  "Motion",
  "Versioning",
  "Delivery",
];

const FF_HOME_URL = "https://www.friendsandfamily.tv";

function FFLogomark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/ff-logomark.png"
      alt=""
      className="h-9 w-9 object-contain brightness-0 invert opacity-70"
    />
  );
}

export function BrandSplash({
  company,
  heroFor,
  heroWhy,
  ticker,
  recipientFirstName,
}: Props) {
  const motionFrames = HERO_MEDIA.map((media) => ({
    still: muxStillUrl(media.muxPlaybackId, 640, media.duration, media.start),
    animated: muxAnimatedUrl(
      media.muxPlaybackId,
      640,
      media.duration,
      media.start,
    ),
    className: media.className,
  }));

  return (
    <section className="overflow-x-clip px-6 pt-6 pb-0.5 text-[var(--versant-white)] sm:px-10 sm:pt-10 lg:px-14 lg:pt-14">
      <div className="mx-auto grid max-w-[1600px] gap-3 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col overflow-hidden rounded-[4px] bg-[#2447FF] p-6 text-[var(--versant-white)] sm:p-8 lg:col-span-12 lg:min-h-[min(43rem,calc(100svh-2rem))] lg:p-9">
          <div aria-hidden="true" className={SURFACE_GRAIN} />
          <div
            className={`relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-white/50 ${HERO_MICRO_LABEL}`}
          >
            <a
              href={FF_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Friends & Family"
              className="flex min-w-0 items-center gap-3 text-white transition-opacity duration-180 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
            >
              <FFLogomark />
              <span className="text-[15px] font-medium tracking-[-0.02em]">
                Friends &amp; Family
              </span>
            </a>
            <p className="max-w-[20rem] text-right text-white/62 sm:max-w-none">
              A Friends &amp; Family pitch for {company}
              {recipientFirstName ? ` · For ${recipientFirstName}` : ""}
            </p>
          </div>

          <div className="relative z-10 mt-[clamp(2rem,5.5vh,4rem)] grid gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(22rem,0.42fr)] lg:items-center">
            <div>
              <p className={`mb-5 text-white/62 ${HERO_MICRO_LABEL}`}>
                Overview
              </p>
              <h1 className="versant-display max-w-none text-[clamp(2rem,8.5vw,6rem)] font-medium leading-[0.98] tracking-[-0.044em] text-white sm:max-w-[18ch] lg:max-w-[14ch]">
                Friends &amp; Family{" "}
                <span className="font-light tracking-[-0.018em] text-white/72">
                  for {heroFor}
                </span>
              </h1>
              <p className="mt-5 max-w-[38rem] text-[clamp(18px,1.75vw,26px)] leading-[1.22] tracking-[-0.024em] text-white/68">
                At Friends &amp; Family we first and foremost produce spots. We
                can scale up and we can be nimble when we need to. We&apos;re
                also creative partners who will collaborate to realize your
                vision.
              </p>
              <p className="mt-4 max-w-[38rem] text-[clamp(18px,1.75vw,26px)] leading-[1.22] tracking-[-0.024em] text-white/68">
                {heroWhy}
              </p>
              <TagList
                tags={HERO_CAPABILITIES}
                dark
                className="mt-6 max-w-2xl"
                label="Hero capabilities"
              />
            </div>

            {motionFrames.length > 0 && (
              <div
                aria-hidden="true"
                className="grid gap-1.5 opacity-72 lg:self-center"
              >
                {motionFrames[0] && (
                  <div className="versant-media aspect-video bg-white/5">
                    <MotionFrame
                      animated={motionFrames[0].animated}
                      still={motionFrames[0].still}
                      alt=""
                      className={`versant-card-image h-full w-full object-cover ${motionFrames[0].className ?? ""}`}
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1.5">
                  {motionFrames.slice(1, 4).map((frame, index) => (
                    <div
                      key={frame.still ?? index}
                      className="versant-media aspect-video bg-white/5"
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
              </div>
            )}
          </div>

          <div
            className={`relative z-10 mt-8 overflow-hidden border-t border-white/[0.14] pt-3 text-white/36 lg:mt-10 ${HERO_MICRO_LABEL}`}
          >
            <div className="versant-marquee flex w-max gap-8 motion-reduce:animate-none">
              <span>{ticker}</span>
              <span aria-hidden="true">{ticker}</span>
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
