import {
  muxAnimatedUrl,
  muxStillUrl,
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";

const CADDIES = [
  {
    slug: "terry-rayment",
    name: "Terry Rayment",
    signature: "emotional narrative",
    credits: "Kodak \"Understanding,\" Purina, Cadillac, Jaguar",
    match: "Rory/GolfPass intimate films",
    treatment: "bg-[var(--versant-white)] text-black",
    media: {
      muxPlaybackId: "z3BCWiNoyvzWXlo17EFk4z02DwV800nPqgHbZcgoODgQ00",
      duration: 165.166667,
    },
  },
  {
    slug: "jack-turits",
    name: "Jack Turits",
    signature: "documentary charm",
    credits: "Callaway \"Forefront\"",
    match: "GolfNow portraits",
    treatment: "bg-[var(--versant-black)] text-white",
    media: {
      muxPlaybackId: "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ",
      duration: 32.074667,
    },
  },
  {
    slug: "matt-dilmore",
    name: "Matt Dilmore",
    signature: "offbeat sports comedy",
    credits: "ESPN 30 for 30 \"The Great Imposter\"",
    match: "Big Break x Good Good",
    treatment: "bg-[var(--versant-orange)] text-black",
    media: {
      muxPlaybackId: "IKkNBwRmEdO1tTH00GDioHB2BMRB2EQoVrCCETwf8tCU",
      duration: 587.536967,
    },
  },
  {
    slug: "boma-iluma",
    name: "Boma Iluma",
    signature: "culture-forward",
    credits: "Oakley w/ Damian Lillard, Air Jordan Heirs, The Chi",
    match: "Good Good / next-gen golf",
    treatment: "bg-[var(--versant-mint)] text-black",
  },
  {
    slug: "kelsey-larkin",
    name: "Kelsey Larkin",
    signature: "precision + dignity",
    credits: "Gillette \"Look Good, Game Good\"",
    match: "USA Sports identity / women's sports",
    treatment: "bg-[var(--versant-blue)] text-white",
    media: {
      muxPlaybackId: "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po",
      duration: 50.550511,
    },
  },
  {
    slug: "caleb-slain",
    name: "Caleb Slain",
    signature: "anthem craft",
    credits: "SXSW/Telluride docs, Ford, Lexus, Toyota, Microsoft",
    match: "Golf Channel anthem",
    treatment: "bg-[var(--versant-white)] text-black",
  },
  {
    slug: "james-frost",
    name: "James Frost",
    signature: "systems + scale",
    credits: "Nike, IBM, AmEx, OK Go, Radiohead",
    match: "USA Sports broadcast opens",
    treatment: "bg-[var(--versant-black)] text-white",
  },
  {
    slug: "cody-cloud",
    name: "Cody Cloud",
    signature: "editorial color, portraits",
    credits: "Apple, Adidas, Asics, Gatorade, Nike, Target",
    match: "talent portrait package",
    treatment: "bg-[var(--versant-lime)] text-black",
  },
  {
    slug: "bueno",
    name: "Bueno",
    signature: "mixed-media comedy",
    credits: "Doritos, Netflix, CNN, Cannes Grand Prix",
    match: "fan campaigns / Big Break energy",
    treatment: "bg-[var(--versant-orange)] text-black",
  },
  {
    slug: "le-ged",
    name: "Le Ged",
    signature: "kinetic camera",
    credits: "Hilton, McDonald's, YouTube",
    match: "GolfNow social-first / motion",
    treatment: "bg-[var(--versant-mint)] text-black",
  },
  {
    slug: "leigh-marling",
    name: "Leigh Marling",
    signature: "design-forward brand comedy",
    credits: "Super Bowl, Snickers, T-Mobile, LEGO",
    match: "Fandango / Rotten Tomatoes",
    treatment: "bg-[var(--versant-blue)] text-white",
  },
  {
    slug: "brother-willis",
    name: "Brother Willis",
    signature: "warm Americana, sports-card texture",
    credits: "Topps Chrome Rush, Ford",
    match: "GolfNow local heroes",
    treatment: "bg-[var(--versant-white)] text-black",
  },
];

const ROSTER_LABEL =
  "text-[12px] font-semibold leading-none tracking-[-0.015em]";

export function RosterModes({
  directors,
}: {
  directors: VersantDirectorMedia[];
}) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className={`mb-4 w-fit rounded-full bg-[var(--versant-black)] px-4 py-2.5 text-white ${ROSTER_LABEL}`}>
              Caddie cards
            </p>
            <h2 className="pb-2 text-[clamp(44px,7vw,104px)] font-medium leading-[0.96] tracking-[-0.055em]">
              Directors matched to the work.
            </h2>
          </div>
          <p className="max-w-[58ch] text-[clamp(24px,3vw,40px)] leading-[1.05] tracking-[-0.045em] text-black/72 lg:col-span-4">
            The director choice comes from the assignment: the pressure, the
            tone, the access, and the delivery path.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
    ? muxStillUrl(card.media.muxPlaybackId, 640, card.media.duration)
    : null;
  const overrideAnimated = card.media
    ? muxAnimatedUrl(card.media.muxPlaybackId, 640, card.media.duration)
    : null;
  const headshot = media.director?.headshotUrl;
  const still = overrideStill ?? media.still;
  const animated = overrideAnimated ?? media.animated;
  const usesFigurePlaceholder =
    !headshot && (card.slug === "james-frost" || card.slug === "cody-cloud");
  const dark = card.treatment.includes("text-white");
  const muted = dark ? "text-white/62" : "text-black/58";
  const rule = dark ? "border-white/16" : "border-black/14";
  const pill = dark
    ? "border-white/18 bg-white/5 text-white/70"
    : "border-black/14 bg-black/[0.03] text-black/62";

  return (
    <article
      className={`versant-reveal group flex min-h-[40rem] flex-col overflow-hidden rounded-[36px] p-4 shadow-[0_22px_70px_rgba(16,16,16,0.08)] sm:p-5 lg:rounded-[48px] ${card.treatment}`}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-black/10 bg-cover bg-center"
        style={still ? { backgroundImage: `url(${still})` } : undefined}
      >
        {overrideStill ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overrideStill}
            alt={card.name}
            className="h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100"
            loading="lazy"
          />
        ) : headshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshot}
            alt={card.name}
            className="h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100"
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
            className="h-full w-full object-cover transition duration-500 group-hover:opacity-0 motion-reduce:group-hover:opacity-100"
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
            className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100 motion-safe:block"
            loading="lazy"
          />
        )}

        <div className={`absolute left-4 top-4 rounded-full bg-black px-3 py-2 text-white ${ROSTER_LABEL}`}>
          matched card
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2 pt-6">
        <h3 className="pb-2 text-[clamp(34px,4vw,60px)] font-medium leading-[0.98] tracking-[-0.055em]">
          {card.name}
        </h3>
        <p className={`mt-2 text-[clamp(20px,2.4vw,30px)] leading-[1.05] tracking-[-0.04em] ${muted}`}>
          {card.signature}
        </p>

        <div className="mt-auto space-y-4 pt-7">
          <div className={`border-t pt-4 ${rule}`}>
            <p className={`mb-2 ${muted} ${ROSTER_LABEL}`}>
              Credits
            </p>
            <p className="text-[14px] leading-[1.32]">{card.credits}</p>
          </div>
          <div className={`border-t pt-4 ${rule}`}>
            <span className={`inline-flex rounded-full border px-4 py-2 text-[13px] ${pill}`}>
              &rarr; {card.match}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
