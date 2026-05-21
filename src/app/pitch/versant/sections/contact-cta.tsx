import { ArrowUpRight } from "lucide-react";
import {
  motionForDirector,
  type VersantDirectorMedia,
} from "./media";

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

const DETAILS = [
  ["Project", "Versant x Friends & Family"],
  ["First lane", "Golf Channel"],
  ["Need", "flexible production partner"],
  ["Next move", "one assignment shape"],
];

const COLLAGE_SLUGS = [
  "jack-turits",
  "kelsey-larkin",
  "caleb-slain",
  "le-ged",
];

export function ContactCta({ ctaUrl, recipientFirstName, directors }: Props) {
  const href =
    ctaUrl ??
    `mailto:${CONTACT_EMAILS}?subject=${encodeURIComponent(
      "Versant x Friends & Family brief",
    )}`;
  const frames = COLLAGE_SLUGS.map((slug) =>
    motionForDirector(directors, slug, 640),
  ).filter((frame) => frame.still);

  return (
    <section className="px-4 pb-4 pt-12 sm:px-6 lg:px-8 lg:pb-8 lg:pt-20">
      <div className="mx-auto max-w-[1500px] rounded-[42px] bg-[var(--versant-black)] p-6 text-white shadow-[0_28px_90px_rgba(16,16,16,0.2)] sm:p-10 lg:rounded-[52px] lg:p-12">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/12 pb-5 text-[10px] uppercase tracking-[0.18em] text-white/44">
          <span>{recipientFirstName ? `${recipientFirstName} / next move` : "Ready for input"}</span>
          <span>Status · assignment shape requested</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(64px,10vw,150px)] font-medium leading-[0.86] tracking-[-0.07em]">
              Send us the shape.
            </h2>
            <p className="mt-6 max-w-[58ch] text-[clamp(18px,1.6vw,24px)] leading-[1.35] tracking-[-0.025em] text-white/66">
              A format. A deadline. The assets. The restrictions. The number
              of versions. That is enough for us to show you how we would build
              it.
            </p>
            <p className="mt-5 text-[15px] text-white/42">
              Or send the weird one first.
            </p>
          </div>

          <aside className="rounded-[34px] border border-white/12 p-5 lg:col-span-5 lg:rounded-[44px]">
            <p className="mb-5 text-[10px] uppercase tracking-[0.18em] text-white/42">
              Detail card
            </p>
            <dl className="space-y-4">
              {DETAILS.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-t border-white/12 pt-4 text-[13px] sm:grid-cols-[7rem_1fr]"
                >
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/42">
                    {label}
                  </dt>
                  <dd className="text-white/78">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-x-8 gap-y-5 border-t border-white/12 pt-6 text-[13px] text-white/72 sm:grid-cols-2 lg:grid-cols-3">
            {CONTACTS.map(([name, email]) => (
              <Contact
                key={email}
                value={name}
                sub={email}
                href={`mailto:${email}`}
              />
            ))}
          </div>

          <a
            href={href}
            className="group relative flex min-h-[16rem] overflow-hidden rounded-[30px] bg-[var(--versant-orange)] text-left text-black transition hover:translate-y-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:w-[34rem]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 grid grid-cols-2 gap-1 opacity-80"
            >
              {frames.slice(0, 4).map((frame, index) => (
                <div
                  key={frame.director?.slug ?? index}
                  className="relative overflow-hidden bg-black"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame.still ?? ""}
                    alt=""
                    className="h-full w-full object-cover motion-safe:hidden"
                    loading="lazy"
                  />
                  {frame.animated && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frame.animated}
                      alt=""
                      className="hidden h-full w-full object-cover motion-safe:block"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--versant-orange)] via-[var(--versant-orange)]/55 to-black/20 transition group-hover:from-[var(--versant-lime)] group-hover:via-[var(--versant-lime)]/50" />
            <div className="relative z-10 flex min-h-[16rem] w-full items-end justify-between gap-6 p-5">
              <span className="max-w-[11ch] text-[clamp(28px,3.5vw,54px)] font-medium leading-[0.92] tracking-[-0.055em]">
                Share the brief when ready
              </span>
              <ArrowUpRight className="h-7 w-7 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </a>
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
      {sub && <p className="mt-1 text-[13px] text-white/46">{sub}</p>}
    </>
  );

  if (!href) return <div>{inner}</div>;

  return (
    <a
      href={href}
      className="block rounded-[18px] transition hover:text-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
    >
      {inner}
    </a>
  );
}
