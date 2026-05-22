import {
  muxAnimatedUrl,
  muxStillUrl,
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";
import { CallawaySpotLightbox } from "./callaway-spot-lightbox";

const BRIEFS = [
  {
    kicker: "GolfNow",
    title: "40M tee times is a map",
    copy:
      "Course stories: local rituals, club pros, strange holes, and the people who keep courses alive across 9,000 courses of material.",
    directors: "Jack Turits, Le Ged, Brother Willis",
    previewSlug: "jack-turits",
    reference: "tee sheet / course map / local habit",
    dark: false,
    spots: [
      {
        title: "Callaway · Office :30",
        muxPlaybackId: "BhZH005xwxQZJTuLSYOKSqFaGCSX5SlgFIAOeSntKqs8",
        duration: 30.196844,
      },
      {
        title: "Callaway · Kyle :30",
        muxPlaybackId: "bYcHyck9AcxSPDZSx4x4gRM2fDYN02D00Y9JLSLqpa6HU",
        duration: 30.196844,
      },
      {
        title: "Callaway · Marty :30",
        muxPlaybackId: "CrbJfBhLn4Dj1N00RP2O22hWgT7lGDmmNCpvXkRTXJoA",
        duration: 30.196844,
      },
    ],
  },
  {
    kicker: "Golf Channel",
    title: "Independent era anthem",
    copy:
      "A defining film for the independent Versant era, built from pressure, live texture, and the channel that already knows the game.",
    directors: "Caleb Slain",
    previewSlug: "caleb-slain",
    reference: "live hours / broadcast open / archive",
    dark: true,
    media: {
      muxPlaybackId: "ekGrtmsCnZ9yk1tw8Gez7jPwNUCY55KBCtCF7qThKIw",
      duration: 85.336211,
    },
  },
  {
    kicker: "Rory / GolfPass / Firethorn",
    title: "Life around the game",
    copy:
      "A short series that feels like a life around the game, not an endorsement reel.",
    directors: "Terry Rayment",
    previewSlug: "terry-rayment",
    reference: "range access / family rhythm / quiet day",
    dark: false,
    media: {
      muxPlaybackId: "fLOtMlwZIGeeQM00rMBdqOoMRVdLv900Z9yyaAvZmLjbM",
      duration: 94.594511,
      start: 38,
    },
    mediaClass: "scale-[1.58]",
  },
  {
    kicker: "Big Break x Good Good",
    title: "Old fans. New tempo.",
    copy:
      "Entertainment craft and comedy timing for old Golf Channel fans and new YouTube golf fans.",
    directors: "Matt Dilmore, Boma Iluma, Bueno",
    previewSlug: "matt-dilmore",
    reference: "format pressure / cast chemistry",
    dark: false,
    media: {
      muxPlaybackId: "IKkNBwRmEdO1tTH00GDioHB2BMRB2EQoVrCCETwf8tCU",
      duration: 587.536967,
    },
    mediaClass: "scale-[1.24]",
  },
  {
    kicker: "Ryder Cup / USGA",
    title: "Tension, silence, weather",
    copy:
      "Mini-docs built on memory and reverence without getting sleepy.",
    directors: "Kelsey Larkin, Caleb Slain",
    previewSlug: "kelsey-larkin",
    reference: "gallery ropes / weather hold / last putt",
    dark: false,
    media: {
      muxPlaybackId: "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po",
      duration: 50.550511,
    },
  },
  {
    kicker: "Sponsor-friendly editorial",
    title: "Branded golf people finish",
    copy:
      "Guardrailed pieces that still hold faces, timing, and a reason to watch past the logo.",
    directors: "Terry Rayment, Le Ged",
    previewSlug: "le-ged",
    reference: "sponsor line / versioning / clean cut",
    dark: true,
    media: {
      muxPlaybackId: "qLKRhYTxoAN7Wrri3jm1yVTbuziYByniTQz4E8TA01MY",
      duration: 45.170122,
      start: 11,
    },
    mediaClass: "scale-[1.16]",
  },
];

export function CapabilityDashboard({
  directors,
}: {
  directors: VersantDirectorMedia[];
}) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-5 text-[15px] font-medium text-black/50">
              Where we&apos;d start: golf
            </p>
            <h2 className="versant-display text-[clamp(44px,7vw,104px)] font-medium tracking-[-0.04em]">
              Where we can help first.
            </h2>
          </div>
          <p className="max-w-[44rem] text-[clamp(23px,3vw,38px)] leading-[1.08] tracking-[-0.035em] text-black/66 lg:col-span-5">
            Start with golf because the work is already moving: live pressure,
            course access, short talent windows, sponsor rules, and fans who
            know the difference.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {BRIEFS.map((brief) => (
            <BriefCard
              key={`${brief.kicker}-${brief.title}`}
              brief={brief}
              directors={directors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BriefCard({
  brief,
  directors,
}: {
  brief: {
    kicker: string;
    title: string;
    copy: string;
    directors: string;
    previewSlug: string;
    reference: string;
    dark: boolean;
    media?: {
      muxPlaybackId: string;
      duration: number;
      start?: number;
    };
    mediaClass?: string;
    spots?: {
      title: string;
      muxPlaybackId: string;
      duration: number;
    }[];
  };
  directors: VersantDirectorMedia[];
}) {
  const preview = motionForDirector(directors, brief.previewSlug, 640);
  const overrideStill = brief.media
    ? muxStillUrl(
        brief.media.muxPlaybackId,
        640,
        brief.media.duration,
        brief.media.start,
      )
    : null;
  const overrideAnimated = brief.media
    ? muxAnimatedUrl(
        brief.media.muxPlaybackId,
        640,
        brief.media.duration,
        brief.media.start,
      )
    : null;
  const still = overrideStill ?? preview.still;
  const animated = overrideAnimated ?? preview.animated;
  const cardTone = brief.dark
    ? "bg-[var(--versant-black)] text-[var(--versant-white)]"
    : "bg-[var(--versant-white)] text-black";
  const muted = brief.dark ? "text-white/62" : "text-black/58";
  const rule = brief.dark ? "border-white/14" : "border-black/12";

  return (
    <article
      className={`versant-reveal group min-h-[34rem] overflow-hidden rounded-[34px] p-5 shadow-[0_22px_70px_rgba(17,17,14,0.07)] lg:rounded-[46px] lg:p-7 ${cardTone}`}
    >
      <div className="grid h-full gap-5 lg:grid-cols-2">
        <div className={`flex min-h-[22rem] flex-col justify-between rounded-[26px] bg-[var(--versant-paper)]/80 p-5 text-black ${brief.dark ? "bg-white/[0.08] text-white" : ""}`}>
          <div>
            <h3 className="versant-display mt-4 text-[clamp(34px,5vw,68px)] font-medium tracking-[-0.04em]">
              {brief.title}
            </h3>
            <p className={`mt-5 max-w-[32rem] text-[18px] leading-[1.28] tracking-[-0.02em] ${muted}`}>
              {brief.copy}
            </p>
          </div>
          <div className={`mt-8 border-t pt-4 ${rule}`}>
            <p className={`text-[13px] leading-[1.25] ${muted}`}>
              {brief.kicker} · {brief.reference}
            </p>
          </div>
        </div>

        <div className="flex min-h-[22rem] flex-col justify-between">
          <div className="relative min-h-[18rem] flex-1 overflow-hidden rounded-[26px] bg-black">
            {brief.spots ? (
              <div className="h-full p-4">
                <CallawaySpotLightbox spots={brief.spots} />
              </div>
            ) : (
              <>
                {still && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={still}
                    alt=""
                    className={`h-full min-h-[18rem] w-full object-cover ${brief.mediaClass ?? ""}`}
                    loading="lazy"
                  />
                )}
                {animated && (
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 hidden bg-cover bg-center opacity-0 transition duration-500 group-hover:opacity-100 motion-safe:block ${brief.mediaClass ?? ""}`}
                    style={{ backgroundImage: `url(${animated})` }}
                  />
                )}
              </>
            )}
          </div>
          <div className={`mt-5 border-t pt-4 ${rule}`}>
            <p className="max-w-[28rem] text-[clamp(20px,2vw,28px)] font-medium leading-[1.08] tracking-[-0.02em]">
              {brief.directors}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
