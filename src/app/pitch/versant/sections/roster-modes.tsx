import {
  muxAnimatedUrl,
  muxStillUrl,
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";
import {
  CARD,
  CONTAINER,
  MEDIA,
  META_LABEL,
  META_TEXT,
  SECTION,
  SectionHeader,
  TagList,
  revealStagger,
} from "./system";

const CADDIES = [
  {
    slug: "jack-turits",
    name: "Jack Turits",
    signature: "Creator-led golf, real-player casting, comedy performance.",
    credits: "Callaway \"Forefront\"",
    match: "Creator-led golf and course portraits",
    tags: ["Comedy", "Casting", "Creator-led golf"],
    treatment: "bg-[var(--versant-black)] text-white",
    media: {
      muxPlaybackId: "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ",
      duration: 32.074667,
    },
    mediaClass: "scale-[1.34]",
  },
  {
    slug: "kelsey-larkin",
    name: "Kelsey Larkin",
    signature: "Women's sports, athlete portrait, identity films.",
    credits: "Gillette \"Look Good, Game Good\"",
    match: "USA Sports identity and athlete stories",
    tags: ["Women's sports", "Athlete portrait", "Brand film"],
    treatment: "bg-[var(--versant-black)] text-white",
    media: {
      muxPlaybackId: "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po",
      duration: 50.550511,
      start: 41,
    },
  },
  {
    slug: "matt-dilmore",
    name: "Matt Dilmore",
    signature: "Sports comedy, format, archive-driven storytelling.",
    credits: "ESPN 30 for 30 \"The Great Imposter\"",
    match: "Big Break x Good Good",
    tags: ["Comedy", "Format", "Talent"],
    treatment: "bg-[var(--versant-white)] text-black",
    media: {
      muxPlaybackId: "IKkNBwRmEdO1tTH00GDioHB2BMRB2EQoVrCCETwf8tCU",
      duration: 587.536967,
    },
    mediaClass: "scale-[1.26]",
  },
  {
    slug: "boma-iluma",
    name: "Boma Iluma",
    signature: "Youth culture and talent films",
    credits: "Oakley w/ Damian Lillard, Air Jordan Heirs, The Chi",
    match: "Good Good / next-gen golf",
    tags: ["Talent", "Culture", "Next-gen golf"],
    treatment: "bg-[var(--versant-paper)] text-black",
    video: {
      poster:
        "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fdaa931aa6c24354991e4_Oakley_Thumbnail.jpg",
      src: "https://player.vimeo.com/progressive_redirect/playback/1103240262/rendition/720p/file.mp4?loc=external&log_user=0&signature=c856df2b0c7ecab29daf0ee6d959ddc6545cc89527e2f42f19065e9ffd2b519c",
    },
    mediaClass: "scale-[1.1]",
  },
  {
    slug: "le-ged",
    name: "Le Ged",
    signature: "Motion-heavy social and camera-led spots",
    credits: "Hilton, McDonald's, YouTube",
    match: "GolfNow social motion",
    tags: ["Motion", "Camera", "Social"],
    treatment: "bg-[var(--versant-paper)] text-black",
    media: {
      muxPlaybackId: "qLKRhYTxoAN7Wrri3jm1yVTbuziYByniTQz4E8TA01MY",
      duration: 45.170122,
      start: 11,
    },
    mediaClass: "scale-[1.16]",
  },
  {
    slug: "caleb-slain",
    name: "Caleb Slain",
    signature: "Broadcast-adjacent promos and anthem films",
    credits: "SXSW/Telluride docs, Ford, Lexus, Toyota, Microsoft",
    match: "Golf Channel anthem",
    tags: ["Promo", "Anthem", "Delivery"],
    treatment: "bg-[var(--versant-white)] text-black",
    media: {
      muxPlaybackId: "ekGrtmsCnZ9yk1tw8Gez7jPwNUCY55KBCtCF7qThKIw",
      duration: 85.336211,
    },
  },
  {
    slug: "bueno",
    name: "Bueno",
    signature: "Mixed-media fan campaigns",
    credits: "Doritos, Netflix, CNN, Cannes Grand Prix",
    match: "fan campaigns / Big Break energy",
    tags: ["Mixed media", "Fans", "Social"],
    treatment: "bg-[var(--versant-white)] text-black",
    video: {
      poster:
        "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a1134f1dec2f2d46ba59_Doritos_Wasabi.jpg",
      src: "https://player.vimeo.com/progressive_redirect/playback/927476346/rendition/1080p/file.mp4?loc=external&log_user=0&signature=6bd4f8c1650b63881d158195b73232735f1e6720bdb043f7663b67d5055f772f",
    },
    mediaClass: "scale-[1.1]",
  },
  {
    slug: "brother-willis",
    name: "Brother Willis",
    signature: "Local sports stories",
    credits: "Topps Chrome Rush, Ford",
    match: "GolfNow local heroes",
    tags: ["Local stories", "Casting", "Field production"],
    treatment: "bg-[var(--versant-white)] text-black",
    media: {
      muxPlaybackId: "vqAlDQVGkErsXS00VKhafavM02viB4crudGcbSX397bfQ",
      duration: 68.359967,
      start: 20,
    },
  },
  {
    slug: "cody-cloud",
    name: "Cody Cloud",
    signature: "Athlete portrait and brand films",
    credits: "Apple, Adidas, Asics, Gatorade, Nike, Target",
    match: "talent portrait package",
    tags: ["Athlete portrait", "Brand film", "Photography"],
    treatment: "bg-[var(--versant-paper)] text-black",
    media: {
      muxPlaybackId: "feQSUP17mpG4Ay8bAHFPHuXx66CQwudaK4uKlUMj4pw",
      duration: 60.3603,
      start: 38,
    },
  },
  {
    slug: "terry-rayment",
    name: "Terry Rayment",
    signature: "Documentary access and talent films",
    credits: "Kodak \"Understanding,\" Purina, Cadillac, Jaguar",
    match: "Rory/GolfPass intimate films",
    tags: ["Documentary", "Talent", "GolfPass"],
    treatment: "bg-[var(--versant-white)] text-black",
    media: {
      muxPlaybackId: "fLOtMlwZIGeeQM00rMBdqOoMRVdLv900Z9yyaAvZmLjbM",
      duration: 94.594511,
      start: 38,
    },
    mediaClass: "scale-[1.58]",
  },
];

export function RosterModes({
  directors,
}: {
  directors: VersantDirectorMedia[];
}) {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeader
          label="Directors"
          title={
            <span className="text-[#2447FF]">
              Selected talent for the assignment.
            </span>
          }
        />

        <div className="grid gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {CADDIES.map((card, index) => (
            <CaddieCard
              key={card.slug}
              card={card}
              directors={directors}
              revealIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaddieCard({
  card,
  directors,
  revealIndex,
}: {
  card: (typeof CADDIES)[number];
  directors: VersantDirectorMedia[];
  revealIndex: number;
}) {
  const media = motionForDirector(directors, card.slug, 640);
  const directVideo = "video" in card ? card.video : null;
  const overrideStill = card.media
    ? muxStillUrl(
        card.media.muxPlaybackId,
        640,
        card.media.duration,
        "start" in card.media ? card.media.start : undefined,
      )
    : null;
  const overrideAnimated = card.media
    ? muxAnimatedUrl(
        card.media.muxPlaybackId,
        640,
        card.media.duration,
        "start" in card.media ? card.media.start : undefined,
      )
    : null;
  const headshot = media.director?.headshotUrl;
  const still = directVideo?.poster ?? overrideStill ?? media.still;
  const animated = directVideo ? null : overrideAnimated ?? media.animated;
  const mediaClass = "mediaClass" in card ? card.mediaClass : "";
  const usesFigurePlaceholder =
    !headshot && card.slug === "cody-cloud";

  return (
    <article
      className={`${CARD} group flex flex-col p-3 sm:p-4`}
      style={revealStagger(revealIndex)}
    >
      <div
        className={`${MEDIA} relative aspect-video bg-black/10 bg-cover bg-center`}
        style={still ? { backgroundImage: `url(${still})` } : undefined}
      >
        {directVideo ? (
          <>
            <video
              aria-hidden="true"
              src={directVideo.src}
              poster={directVideo.poster}
              className={`versant-card-image h-full w-full object-cover motion-reduce:hidden ${mediaClass}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={directVideo.poster}
              alt={card.name}
              className={`hidden h-full w-full object-cover motion-reduce:block ${mediaClass}`}
              loading="lazy"
            />
          </>
        ) : overrideStill ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overrideStill}
            alt={card.name}
            className={`versant-card-image h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100 ${mediaClass}`}
            loading="lazy"
          />
        ) : headshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshot}
            alt={card.name}
            className={`versant-card-image h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100 ${mediaClass}`}
            loading="lazy"
          />
        ) : usesFigurePlaceholder ? (
          <div className="grid h-full place-items-center bg-[var(--versant-soft-gray)] text-black">
            <span className="text-[clamp(54px,8vw,116px)] font-medium leading-none tracking-[-0.08em]">
              FIG
            </span>
          </div>
        ) : still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={still}
            alt={card.name}
            className={`versant-card-image h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100 ${mediaClass}`}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-black/10" />
        )}

        {animated && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={animated}
            alt=""
            className={`absolute inset-0 hidden h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100 motion-safe:block ${mediaClass}`}
            loading="lazy"
          />
        )}

      </div>

      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-[clamp(30px,3.4vw,50px)] font-medium leading-[1] tracking-[-0.045em] text-[#2447FF]">
          {card.name}
        </h3>
        <p className="mt-2 text-[clamp(17px,1.8vw,23px)] leading-[1.12] tracking-[-0.03em] text-black/62">
          {card.signature}
        </p>

        <div className="mt-5 space-y-4 border-t border-black/12 pt-4">
          <div>
            <p className={`${META_LABEL} mb-2`}>
              Credits
            </p>
            <p className={META_TEXT}>{card.credits}</p>
          </div>
          <div>
            <p className={`${META_LABEL} mb-2`}>
              Use case
            </p>
            <p className={META_TEXT}>
              {card.match}
            </p>
          </div>
          <TagList
            tags={card.tags}
            className="mt-auto"
            label={`${card.name} assignment tags`}
          />
        </div>
      </div>
    </article>
  );
}
