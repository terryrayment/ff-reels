import {
  motionForDirector,
  muxAnimatedUrl,
  muxStillUrl,
  type VersantDirectorMedia,
} from "./media";
import { ReferenceVideoFrame } from "./reference-video-frame";

const REFERENCES = [
  {
    title: "Golf Channel",
    detail: "promo pace / live pressure",
    slug: "caleb-slain",
    media: {
      muxPlaybackId: "CrbJfBhLn4Dj1N00RP2O22hWgT7lGDmmNCpvXkRTXJoA",
      duration: 30.196844,
      start: 12,
    },
  },
  {
    title: "GolfNow",
    detail: "booking surface / local courses",
    slug: "jack-turits",
    media: {
      muxPlaybackId: "BhZH005xwxQZJTuLSYOKSqFaGCSX5SlgFIAOeSntKqs8",
      duration: 30.196844,
      start: 9,
    },
  },
  {
    title: "Big Break x Good Good",
    detail: "format energy / new audience",
    slug: "jack-turits",
    media: {
      muxPlaybackId: "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ",
      duration: 32.074667,
    },
    playVideo: true,
    videoTitle: "Callaway Forefront",
  },
  {
    title: "Rory / GolfPass",
    detail: "talent access / quiet golf",
    slug: "terry-rayment",
    media: {
      muxPlaybackId: "fLOtMlwZIGeeQM00rMBdqOoMRVdLv900Z9yyaAvZmLjbM",
      duration: 94.594511,
      start: 38,
    },
    mediaClass: "scale-[1.38]",
    hoverMediaClass: "motion-safe:group-hover:scale-[1.44]",
  },
];

export function VersantReferenceStrip({
  directors,
}: {
  directors: VersantDirectorMedia[];
}) {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-3 md:grid-cols-4">
          {REFERENCES.map((item, index) => {
            const frame = "media" in item && item.media
              ? {
                  playbackId: item.media.muxPlaybackId,
                  still: muxStillUrl(
                    item.media.muxPlaybackId,
                    640,
                    item.media.duration,
                    item.media.start,
                  ),
                  animated: muxAnimatedUrl(
                    item.media.muxPlaybackId,
                    640,
                    item.media.duration,
                    item.media.start,
                  ),
                }
              : {
                  playbackId: null,
                  ...motionForDirector(directors, item.slug, 640),
                };
            const playVideo = "playVideo" in item && item.playVideo;
            const videoTitle =
              "videoTitle" in item ? item.videoTitle ?? item.title : item.title;
            const mediaClass =
              "mediaClass" in item ? item.mediaClass : "scale-110";
            const hoverMediaClass =
              "hoverMediaClass" in item
                ? item.hoverMediaClass
                : "motion-safe:group-hover:scale-[1.16]";

            return (
              <article
                key={item.title}
                className="versant-reveal group flex min-h-[18rem] flex-col overflow-hidden rounded-[30px] bg-[var(--versant-white)] p-5 shadow-[0_18px_60px_rgba(17,17,14,0.05)] transition-transform duration-500 ease-out motion-reduce:transition-none motion-safe:hover:scale-[1.015]"
              >
                <div
                  aria-hidden="true"
                  className="relative mb-8 aspect-video overflow-hidden rounded-[22px] bg-[var(--versant-soft-gray)]"
                >
                  {playVideo && frame.playbackId && frame.still ? (
                    <ReferenceVideoFrame
                      playbackId={frame.playbackId}
                      poster={frame.still}
                      title={videoTitle}
                    />
                  ) : frame.still ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frame.still}
                      alt=""
                      className={`h-full w-full object-cover opacity-72 transition-transform duration-700 ease-out motion-reduce:transition-none ${mediaClass} ${hoverMediaClass} ${
                        frame.animated ? "motion-safe:hidden" : ""
                      }`}
                      loading="lazy"
                    />
                  ) : null}
                  {!playVideo && frame.animated && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frame.animated}
                      alt=""
                      className={`absolute inset-0 hidden h-full w-full object-cover opacity-72 transition-transform duration-700 ease-out motion-safe:block ${mediaClass} ${hoverMediaClass}`}
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,59,46,0.02),rgba(12,59,46,0.46))]" />
                </div>
              <div className="mt-auto grid min-h-[9.5rem] grid-cols-[1fr_auto] items-start gap-4 border-t border-black/10 pt-4">
                <div className="grid h-full grid-rows-[minmax(4.7rem,auto)_auto]">
                  <h3 className="text-[26px] font-medium leading-[1.02] tracking-[-0.035em]">
                    {item.title}
                  </h3>
                  <p className="self-start text-[14px] leading-[1.25] text-black/52">
                    {item.detail}
                  </p>
                </div>
                <span className="text-right text-[12px] text-black/38">
                  ref {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
