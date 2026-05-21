import {
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
    directors: "Jack Turits / Le Ged / Brother Willis",
    previewSlug: "jack-turits",
    treatment: "md:col-span-1 bg-[var(--versant-white)] text-black",
    number: "01",
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
      "A defining film for the independent Versant era, built from the pressure and texture of the channel that already knows the game.",
    directors: "Caleb Slain",
    previewSlug: "caleb-slain",
    treatment: "md:col-span-1 bg-[var(--versant-lime)] text-black",
    number: "02",
  },
  {
    kicker: "Rory / GolfPass / Firethorn",
    title: "Life around the game",
    copy:
      "A short series that feels like a life around the game, not an endorsement reel.",
    directors: "Terry Rayment",
    previewSlug: "terry-rayment",
    treatment: "md:col-span-1 bg-[var(--versant-black)] text-white",
    number: "03",
  },
  {
    kicker: "Big Break x Good Good",
    title: "Old fans. New tempo.",
    copy:
      "Entertainment craft and comedy timing that respects old Golf Channel fans and new YouTube golf fans.",
    directors: "Matt Dilmore / Boma Iluma / Bueno",
    previewSlug: "matt-dilmore",
    treatment: "md:col-span-1 bg-[var(--versant-orange)] text-black",
    number: "04",
  },
  {
    kicker: "USA Sports",
    title: "Give the game a house sound",
    copy:
      "A visual identity that can carry opens, promos, social, motion language, and the pressure of live sports.",
    directors: "Kelsey Larkin",
    previewSlug: "kelsey-larkin",
    treatment: "md:col-span-1 bg-[var(--versant-blue)] text-white",
    number: "05",
  },
  {
    kicker: "Ryder Cup / USGA",
    title: "Tension, silence, weather",
    copy:
      "Mini-docs built on memory and reverence without getting sleepy.",
    directors: "Kelsey Larkin / Caleb Slain",
    previewSlug: "kelsey-larkin",
    treatment: "md:col-span-1 bg-[var(--versant-mint)] text-black",
    number: "06",
  },
  {
    kicker: "Sponsor-friendly editorial",
    title: "Branded golf people finish",
    copy:
      "Guardrailed pieces that still hold faces, timing, and a reason to watch past the logo.",
    directors: "Terry Rayment / Le Ged",
    previewSlug: "le-ged",
    treatment: "md:col-span-1 bg-[var(--versant-black)] text-white",
    number: "07",
  },
  {
    kicker: "Secondary call",
    title: "Talent + explainer craft",
    copy:
      "CNBC and MS NOW need voices, structure, and clean film language when the subject gets dense.",
    directors: "Caleb Slain",
    previewSlug: "caleb-slain",
    treatment: "md:col-span-1 bg-[var(--versant-orange)] text-black",
    number: "S1",
    secondary: true,
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
        <div className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mb-4 w-fit rounded-full bg-[var(--versant-black)] px-4 py-2.5 text-[12px] font-semibold leading-none tracking-[-0.015em] text-white">
              Where we&apos;d start: golf
            </p>
            <h2 className="pb-2 text-[clamp(44px,7vw,104px)] font-medium leading-[0.96] tracking-[-0.055em]">
              Where we can help first.
            </h2>
          </div>
          <p className="max-w-[58ch] text-[clamp(24px,3vw,40px)] leading-[1.05] tracking-[-0.045em] text-black/72 lg:col-span-4">
            Golf first. Every card is a reason to call Friends &amp; Family to
            make something, not another services matrix.
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
    treatment: string;
    number: string;
    secondary?: boolean;
    spots?: {
      title: string;
      muxPlaybackId: string;
      duration: number;
    }[];
  };
  directors: VersantDirectorMedia[];
}) {
  const dark = brief.treatment.includes("text-white");
  const muted = dark ? "text-white/62" : "text-black/56";
  const rule = dark ? "border-white/16" : "border-black/14";
  const pill = dark
    ? "border-white/18 bg-white/5 text-white/70"
    : "border-black/14 bg-black/[0.03] text-black/62";
  const preview = motionForDirector(directors, brief.previewSlug, 420);

  return (
    <article
      className={`versant-reveal group relative min-h-[23rem] overflow-hidden rounded-[36px] p-6 shadow-[0_22px_70px_rgba(16,16,16,0.08)] sm:p-7 lg:rounded-[48px] ${brief.treatment} ${
        brief.secondary ? "min-h-[19rem]" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-6 right-7 z-0 text-[clamp(88px,12vw,190px)] font-medium leading-none tracking-[-0.09em] ${
          dark ? "text-white/[0.05]" : "text-black/[0.045]"
        }`}
      >
        {brief.number}
      </span>

      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-4 py-2 text-[12px] font-medium uppercase tracking-[0.08em] ${pill}`}>
              {brief.kicker}
            </span>
            {brief.secondary && (
              <span className={`rounded-full border px-4 py-2 text-[12px] font-medium uppercase tracking-[0.08em] ${pill}`}>
                secondary
              </span>
            )}
          </div>
          <h3 className="max-w-3xl pb-3 text-[clamp(34px,5vw,76px)] font-medium leading-[1.02] tracking-[-0.055em]">
            {brief.title}
          </h3>
          <p className={`mt-3 max-w-[48ch] text-[17px] leading-[1.28] tracking-[-0.02em] ${muted}`}>
            {brief.copy}
          </p>
          {brief.spots && <CallawaySpotLightbox spots={brief.spots} />}
        </div>

        <div className={`grid gap-4 border-t pt-4 ${rule} sm:grid-cols-[1fr_auto] sm:items-start`}>
          <div className="min-w-0">
            <p className={`mb-3 font-sans text-[13px] font-semibold leading-none tracking-[-0.015em] ${muted}`}>
              Suggested creative / director
            </p>
            <p className="text-[clamp(20px,2.5vw,34px)] font-medium leading-[1.05] tracking-[-0.04em]">
              {brief.directors}
            </p>
          </div>

          {preview.still && (
            <div className="relative h-24 w-full overflow-hidden rounded-[22px] border border-current/20 bg-black shadow-[0_16px_44px_rgba(0,0,0,0.18)] sm:w-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.still}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {preview.animated && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.animated}
                  alt=""
                  className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100 motion-safe:block"
                  loading="lazy"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
