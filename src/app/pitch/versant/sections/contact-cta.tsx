import {
  muxAnimatedUrl,
  muxStillUrl,
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";
import {
  CONTAINER,
  LINK,
  MEDIA,
  SECTION,
  SectionHeader,
  TagList,
} from "./system";

interface Props {
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  recipientFirstName?: string | null;
  directors: VersantDirectorMedia[];
}

const CONTACTS = [
  ["Scott Kaplan, MD", "scott@friendsandfamily.tv"],
  ["Terry Rayment, CD", "terry@friendsandfamily.tv"],
  ["Jed Herold, EP", "jed@friendsandfamily.tv"],
];

const CONTACT_EMAILS = CONTACTS.map(([, email]) => email).join(",");
const COLLAGE_MEDIA_CLASS = "h-full w-full scale-[1.34] object-cover";

const COLLAGE_SPOTS = [
  ["Callaway office", "BhZH005xwxQZJTuLSYOKSqFaGCSX5SlgFIAOeSntKqs8", 30.196844],
  ["Callaway Kyle", "bYcHyck9AcxSPDZSx4x4gRM2fDYN02D00Y9JLSLqpa6HU", 30.196844],
  ["Callaway Marty", "CrbJfBhLn4Dj1N00RP2O22hWgT7lGDmmNCpvXkRTXJoA", 30.196844],
  ["Jack Turits", "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ", 32.074667],
  ["Kelsey Larkin", "qLBZMCS2HlYQdlPoC01901zKzeLDoIfXZsgY5i8zyx2Po", 50.550511],
  ["Caleb Slain", "ekGrtmsCnZ9yk1tw8Gez7jPwNUCY55KBCtCF7qThKIw", 85.336211],
  ["Le Ged", "qLKRhYTxoAN7Wrri3jm1yVTbuziYByniTQz4E8TA01MY", 45.170122],
  ["Brother Willis", "vqAlDQVGkErsXS00VKhafavM02viB4crudGcbSX397bfQ", 68.359967],
  ["Cody Cloud Adidas", "feQSUP17mpG4Ay8bAHFPHuXx66CQwudaK4uKlUMj4pw", 60.3603],
  ["Terry Rayment", "fLOtMlwZIGeeQM00rMBdqOoMRVdLv900Z9yyaAvZmLjbM", 94.594511],
] as const;

const COLLAGE_FALLBACK_SLUGS = [
  "jack-turits",
  "boma-iluma",
  "bueno",
  "james-frost",
  "leigh-marling",
  "terry-rayment",
  "caleb-slain",
  "kelsey-larkin",
  "brother-willis",
];

const BLOCKED_COLLAGE_PLAYBACK_IDS = new Set([
  "IKkNBwRmEdO1tTH00GDioHB2BMRB2EQoVrCCETwf8tCU",
]);

type CollageFrame = {
  key: string;
  still: string | null;
  animated: string | null;
};

function contactCollageFrames(directors: VersantDirectorMedia[]) {
  const seen = new Set<string>();
  const frames: CollageFrame[] = [];

  const addFrame = (frame: CollageFrame) => {
    if (!frame.still || seen.has(frame.key)) return;
    seen.add(frame.key);
    frames.push(frame);
  };

  COLLAGE_SPOTS.forEach(([, playbackId, duration]) => {
    addFrame({
      key: playbackId,
      still: muxStillUrl(playbackId, 640, duration),
      animated: muxAnimatedUrl(playbackId, 640, duration),
    });
  });

  COLLAGE_FALLBACK_SLUGS.forEach((slug) => {
    const frame = motionForDirector(directors, slug, 640);
    const title = frame.project?.title ?? "";
    const brand = frame.project?.brand ?? "";
    const playbackId = frame.project?.muxPlaybackId ?? frame.director?.slug ?? slug;

    if (frame.project?.muxPlaybackId && BLOCKED_COLLAGE_PLAYBACK_IDS.has(frame.project.muxPlaybackId)) return;
    if (/target|thanos/i.test(`${brand} ${title}`)) return;

    addFrame({
      key: playbackId,
      still: frame.still,
      animated: frame.animated,
    });
  });

  return frames.slice(0, 16);
}

export function ContactCta({ ctaUrl, recipientFirstName, directors }: Props) {
  const href =
    ctaUrl ??
    `mailto:${CONTACT_EMAILS}?subject=${encodeURIComponent(
      "Versant x Friends & Family brief",
    )}`;
  const frames = contactCollageFrames(directors);

  return (
    <section className={`${SECTION} pb-4 lg:pb-8`}>
      <div className={CONTAINER}>
        <div className="rounded-[8px] border border-white/10 bg-[var(--versant-black)] p-5 text-white sm:p-7 lg:p-8">
          <SectionHeader
            label={recipientFirstName ? `${recipientFirstName}, contact` : "Contact"}
            title="Send the assignment."
            intro="Brief, deadline, rights, assets, blockers. We will respond with scope, team, timeline, and delivery plan."
            dark
          />

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <a
                href={href}
                className={`${LINK} mb-8 text-white/84 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
              >
                Email the team
              </a>
              <TagList
                tags={["Scope", "Crew", "Edit", "Motion", "Versioning", "Delivery"]}
                dark
                className="mb-8"
              />
              <div className="grid gap-x-8 gap-y-5 text-[17px] leading-[1.28] text-white/76 sm:grid-cols-3 xl:gap-x-12">
                {CONTACTS.map(([name, email]) => (
                  <Contact
                    key={email}
                    value={name}
                    sub={email}
                    href={`mailto:${email}`}
                  />
                ))}
              </div>
            </div>

            <a
              href={href}
              aria-label="Email Friends and Family about the Versant brief"
              className={`${MEDIA} group relative min-h-[18rem] bg-black text-left transition hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:col-span-5`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 grid grid-cols-4 opacity-80"
              >
                {frames.map((frame) => (
                  <div
                    key={frame.key}
                    className="relative overflow-hidden bg-black"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={frame.still ?? ""}
                      alt=""
                      className={`${COLLAGE_MEDIA_CLASS} motion-safe:hidden`}
                      loading="lazy"
                    />
                    {frame.animated && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={frame.animated}
                        alt=""
                        className={`hidden ${COLLAGE_MEDIA_CLASS} motion-safe:block`}
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,59,46,0.12),rgba(12,59,46,0.84))]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({
  value,
  sub,
  href,
}: {
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p>{value}</p>
      {sub && (
        <p className="mt-1 min-w-0 break-words text-[15px] leading-[1.18] text-white/48">
          {sub}
        </p>
      )}
    </>
  );

  if (!href) return <div>{inner}</div>;

  return (
    <a
      href={href}
      className="block min-w-0 transition hover:text-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
    >
      {inner}
    </a>
  );
}
