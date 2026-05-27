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
    detail: "live promo pressure",
    why:
      "A pace-and-tone reference for sponsor rules, live windows, and broadcast polish.",
    slug: "caleb-slain",
    media: {
      muxPlaybackId: "CrbJfBhLn4Dj1N00RP2O22hWgT7lGDmmNCpvXkRTXJoA",
      duration: 30.196844,
      start: 12,
    },
  },
  {
    title: "GolfNow",
    detail: "local course stories",
    why:
      "A way to find people, habits, and character inside a national product.",
    slug: "jack-turits",
    media: {
      muxPlaybackId: "BhZH005xwxQZJTuLSYOKSqFaGCSX5SlgFIAOeSntKqs8",
      duration: 30.196844,
      start: 9,
    },
  },
  {
    title: "Big Break x Good Good",
    detail: "format comedy / new audience",
    why:
      "A bridge between legacy Golf Channel energy and creator-native golf fans.",
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
    detail: "talent access / quiet intimacy",
    why:
      "Proof that access can feel observed, not overproduced.",
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
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 grid gap-5 lg:grid-cols-12 lg:items-end">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-black/44 lg:col-span-3">
            FIRST PROOF
          </p>
          <h2 className="versant-display max-w-4xl text-[clamp(38px,5.6vw,82px)] font-medium tracking-[-0.045em] lg:col-span-7">
            Golf is where the fit gets specific.
          </h2>
          <p className="max-w-[28rem] text-[16px] leading-[1.32] text-black/56 lg:col-span-2">
            Four entry points into work Versant already has to make.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                className="versant-reveal group flex min-h-[24rem] flex-col overflow-hidden rounded-[14px] border border-black/[0.08] bg-[var(--versant-white)] p-4 shadow-[0_18px_60px_rgba(17,17,14,0.045)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(17,17,14,0.07)] motion-reduce:transition-none"
              >
                <div
                  aria-hidden="true"
                  className="relative mb-6 aspect-video overflow-hidden rounded-[10px] bg-[var(--versant-soft-gray)]"
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
              <div className="mt-auto grid min-h-[13rem] gap-4 border-t border-black/10 pt-4">
                <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                  <h3 className="text-[clamp(25px,2.4vw,34px)] font-medium leading-[1.02] tracking-[-0.035em]">
                    {item.title}
                  </h3>
                  <span className="text-right text-[12px] text-black/38">
                    ref {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/42">
                  {item.detail}
                </p>
                <p className="text-[15px] leading-[1.32] text-black/58">
                  {item.why}
                </p>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
