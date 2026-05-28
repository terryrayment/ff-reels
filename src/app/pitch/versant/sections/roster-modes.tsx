import {
  muxAnimatedUrl,
  muxStillUrl,
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";
import { RosterCreditLightbox } from "./roster-credit-lightbox";

const CADDIES = [
  {
    slug: "jack-turits",
    name: "Jack Turits",
    signature: "real people, clean comedy",
    credits: "Callaway \"Forefront\"",
    match: "GolfNow course portraits",
    treatment: "bg-[var(--versant-black)] text-white",
    media: {
      muxPlaybackId: "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ",
      duration: 32.074667,
    },
    mediaClass: "scale-[1.34]",
  },
  {
    slug: "le-ged",
    name: "Le Ged",
    signature: "motion-forward camera",
    credits: "Hilton, McDonald's, YouTube",
    match: "GolfNow social-first motion",
    treatment: "bg-[var(--versant-paper)] text-black",
    media: {
      muxPlaybackId: "qLKRhYTxoAN7Wrri3jm1yVTbuziYByniTQz4E8TA01MY",
      duration: 45.170122,
      start: 11,
    },
    mediaClass: "scale-[1.16]",
  },
  {
    slug: "matt-dilmore",
    name: "Matt Dilmore",
    signature: "sports comedy, straight face",
    credits: "ESPN 30 for 30 \"The Great Imposter\"",
    match: "Big Break x Good Good",
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
    signature: "youth culture and talent",
    credits: "Oakley w/ Damian Lillard, Air Jordan Heirs, The Chi",
    creditSpots: [
      {
        label: "Oakley w/ Damian Lillard",
        title: "Boma Iluma · Oakley w/ Damian Lillard",
        embedUrl: "https://player.vimeo.com/video/638046332?h=459abba3b3",
      },
      {
        label: "Air Jordan Heirs",
        title: "Boma Iluma · Air Jordan Heirs",
        embedUrl: "https://player.vimeo.com/video/388087934?h=e1534f4e98",
      },
      {
        label: "The Chi",
        title: "Boma Iluma · The Chi",
        embedUrl: "https://player.vimeo.com/video/1023999854",
      },
    ],
    match: "Good Good / next-gen golf",
    treatment: "bg-[var(--versant-paper)] text-black",
    mediaClass: "scale-[1.55]",
  },
  {
    slug: "kelsey-larkin",
    name: "Kelsey Larkin",
    signature: "women's sports with restraint",
    credits: "Gillette \"Look Good, Game Good\"",
    match: "USA Sports identity / women's sports",
    treatment: "bg-[var(--versant-black)] text-white",
    media: {
      muxPlaybackId: "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po",
      duration: 50.550511,
      start: 41,
    },
  },
  {
    slug: "caleb-slain",
    name: "Caleb Slain",
    signature: "anthem craft without gloss",
    credits: "SXSW/Telluride docs, Ford, Lexus, Toyota, Microsoft",
    match: "Golf Channel anthem",
    treatment: "bg-[var(--versant-white)] text-black",
    media: {
      muxPlaybackId: "ekGrtmsCnZ9yk1tw8Gez7jPwNUCY55KBCtCF7qThKIw",
      duration: 85.336211,
    },
  },
  {
    slug: "bueno",
    name: "Bueno",
    signature: "mixed-media fan energy",
    credits: "Doritos, Netflix, CNN, Cannes Grand Prix",
    match: "fan campaigns / Big Break energy",
    treatment: "bg-[var(--versant-white)] text-black",
  },
  {
    slug: "brother-willis",
    name: "Brother Willis",
    signature: "warm local stories",
    credits: "Topps Chrome Rush, Ford",
    match: "GolfNow local heroes",
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
    signature: "editorial athlete portraiture",
    credits: "Apple, Adidas, Asics, Gatorade, Nike, Target",
    match: "talent portrait package",
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
    signature: "quiet access, emotional restraint",
    credits: "Kodak \"Understanding,\" Purina, Cadillac, Jaguar",
    match: "Rory/GolfPass intimate films",
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
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.14em] text-black/44">
              CURATED TALENT
            </p>
            <h2 className="versant-display text-[clamp(42px,6.5vw,96px)] font-medium tracking-[-0.045em]">
              Directors mapped to assignments.
            </h2>
          </div>
          <p className="max-w-[46rem] text-[clamp(20px,2.4vw,32px)] leading-[1.12] tracking-[-0.035em] text-black/68 lg:col-span-4 lg:mt-[38px]">
            We pick for tone, access, schedule, usage, and the amount of post
            the idea will need. The reel is only the starting point.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CADDIES.map((card) => (
            <CaddieCard key={card.slug} card={card} directors={directors} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaddieCard({
  card,
  directors,
}: {
  card: (typeof CADDIES)[number];
  directors: VersantDirectorMedia[];
}) {
  const media = motionForDirector(directors, card.slug, 640);
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
  const still = overrideStill ?? media.still;
  const animated = overrideAnimated ?? media.animated;
  const mediaClass = "mediaClass" in card ? card.mediaClass : "";
  const usesFigurePlaceholder =
    !headshot && card.slug === "cody-cloud";
  const dark = card.treatment.includes("text-white");
  const muted = dark ? "text-white/62" : "text-black/58";
  const rule = dark ? "border-white/16" : "border-black/14";
  const creditSpots = "creditSpots" in card ? card.creditSpots : null;

  return (
    <article
      className={`versant-reveal versant-mw-card group flex min-h-[30rem] flex-col overflow-hidden rounded-[15px] border p-4 shadow-[0_18px_58px_rgba(17,17,14,0.045)] transition duration-300 sm:p-5 lg:rounded-[18px] ${dark ? "border-white/12 hover:border-white/24" : "border-black/[0.1] hover:border-black/22"} ${card.treatment}`}
    >
      <div
        className="versant-mw-media relative aspect-video overflow-hidden rounded-[10px] bg-black/10 bg-cover bg-center"
        style={still ? { backgroundImage: `url(${still})` } : undefined}
      >
        {overrideStill ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overrideStill}
            alt={card.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100 ${mediaClass}`}
            loading="lazy"
          />
        ) : headshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshot}
            alt={card.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100 ${mediaClass}`}
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
            className={`h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100 ${mediaClass}`}
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
        <h3 className="versant-display text-[clamp(32px,3.6vw,54px)] font-medium tracking-[-0.045em]">
          {card.name}
        </h3>
        <p className={`mt-2 text-[clamp(18px,2vw,25px)] leading-[1.12] tracking-[-0.03em] ${muted}`}>
          {card.signature}
        </p>

        <div className="mt-5 space-y-3 pt-3">
          <div className={`border-t pt-3 ${rule}`}>
            <p className={`mb-2 text-[11px] font-medium uppercase leading-none tracking-[0.14em] ${muted}`}>
              Credits
            </p>
            {creditSpots ? (
              <RosterCreditLightbox spots={creditSpots} dark={dark} />
            ) : (
              <p className="text-[14px] leading-[1.32]">{card.credits}</p>
            )}
          </div>
          <div className={`border-t pt-3 ${rule}`}>
            <p className={`mb-2 text-[11px] font-medium uppercase leading-none tracking-[0.14em] ${muted}`}>
              Assignment fit
            </p>
            <p className="text-[15px] leading-[1.25]">
              {card.match}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
