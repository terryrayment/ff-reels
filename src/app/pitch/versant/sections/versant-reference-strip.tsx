import {
  motionForDirector,
  muxAnimatedUrl,
  muxStillUrl,
  type VersantDirectorMedia,
} from "./media";
import { ReferenceVideoFrame } from "./reference-video-frame";
import {
  CARD,
  CONTAINER,
  MEDIA,
  META_LABEL,
  META_TEXT,
  SECTION,
  SectionHeader,
  TagList,
} from "./system";

const REFERENCES = [
  {
    title: "Golf Channel",
    assignment: "Live promo pressure",
    description: "Broadcast polish, sponsor rules, and fast handoff.",
    tags: ["Creative", "Production", "Edit", "Motion", "Delivery"],
    slug: "caleb-slain",
    media: {
      muxPlaybackId: "CrbJfBhLn4Dj1N00RP2O22hWgT7lGDmmNCpvXkRTXJoA",
      duration: 30.196844,
      start: 12,
    },
  },
  {
    title: "GolfNow",
    assignment: "Local course stories",
    description: "Real-player casting and field production at a national scale.",
    tags: ["Casting", "Field production", "Social", "Versioning"],
    slug: "jack-turits",
    media: {
      muxPlaybackId: "BhZH005xwxQZJTuLSYOKSqFaGCSX5SlgFIAOeSntKqs8",
      duration: 30.196844,
      start: 9,
    },
  },
  {
    title: "Big Break x Good Good",
    assignment: "Format and comedy",
    description: "Legacy Golf Channel energy meets creator-led golf.",
    tags: ["Format", "Comedy", "Talent", "Social"],
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
    assignment: "Talent film",
    description: "Quiet access with a lighter production touch.",
    tags: ["Talent", "Documentary", "Edit", "Finish"],
    slug: "terry-rayment",
    media: {
      muxPlaybackId: "fLOtMlwZIGeeQM00rMBdqOoMRVdLv900Z9yyaAvZmLjbM",
      duration: 94.594511,
      start: 38,
    },
    mediaClass: "scale-[1.38]",
  },
] as const;

export function VersantReferenceStrip({
  directors,
}: {
  directors: VersantDirectorMedia[];
}) {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeader
          label="Proof"
          title="Golf references as selected work."
          intro="Four useful reads for work Versant already makes."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {REFERENCES.map((item, index) => {
            const frame = item.media
              ? {
                  playbackId: item.media.muxPlaybackId,
                  still: muxStillUrl(
                    item.media.muxPlaybackId,
                    640,
                    item.media.duration,
                    "start" in item.media ? item.media.start : undefined,
                  ),
                  animated: muxAnimatedUrl(
                    item.media.muxPlaybackId,
                    640,
                    item.media.duration,
                    "start" in item.media ? item.media.start : undefined,
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
              "mediaClass" in item ? item.mediaClass : "scale-[1.1]";

            return (
              <article key={item.title} className={`${CARD} group flex min-h-[31rem] flex-col p-3`}>
                <div className={`${MEDIA} relative mb-5 aspect-[4/3]`}>
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
                      className={`versant-card-image h-full w-full object-cover opacity-78 ${mediaClass}`}
                      loading="lazy"
                    />
                  ) : null}
                  {!playVideo && frame.animated && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frame.animated}
                      alt=""
                      className={`absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-78 motion-safe:block ${mediaClass}`}
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-[rgba(12,59,46,0.12)]" />
                </div>

                <div className="grid flex-1 gap-4 border-t border-black/10 pt-4">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                    <h3 className="text-[clamp(24px,2.4vw,34px)] font-medium leading-[1] tracking-[-0.04em]">
                      {item.title}
                    </h3>
                    <span className="text-[12px] text-black/38">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div>
                    <p className={META_LABEL}>Assignment</p>
                    <p className={`${META_TEXT} mt-2`}>{item.assignment}</p>
                  </div>

                  <p className="text-[15px] leading-[1.3] text-black/62">
                    {item.description}
                  </p>

                  <TagList tags={item.tags} className="mt-auto" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
