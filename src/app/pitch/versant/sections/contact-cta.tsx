import {
  CONTAINER,
  SECTION,
  REVEAL,
  SURFACE_GRAIN,
  SectionHeader,
  TagList,
} from "./system";

interface Props {
  recipientFirstName?: string | null;
}

const CONTACTS = [
  ["Scott Kaplan, MD", "scott@friendsandfamily.tv"],
  ["Terry Rayment, CD", "terry@friendsandfamily.tv"],
  ["Jed Herold, EP", "jed@friendsandfamily.tv"],
];

const INSTAGRAM_URL = "https://instagram.com/friendsandfamily.tv";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="3.25"
        y="3.25"
        width="17.5"
        height="17.5"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="12"
        cy="12"
        r="4.1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="17.35" cy="6.65" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function ContactCta({ recipientFirstName }: Props) {
  return (
    <section className={`${SECTION} pb-4 lg:pb-8`}>
      <div className={CONTAINER}>
        <div className={`${REVEAL} relative overflow-hidden rounded-[4px] bg-[var(--pitch-accent)] p-5 text-white sm:p-7 lg:p-8`}>
          <div aria-hidden="true" className={SURFACE_GRAIN} />
          <div className="relative z-10">
          <SectionHeader
            label={recipientFirstName ? `${recipientFirstName}, contact` : "Contact"}
            title="Send the assignment."
            intro="Send the brief, deadline, rights, assets, and blockers. We will return a director recommendation, production path, crew shape, timeline, estimate, and delivery plan."
            dark
          />

          <div className="max-w-[44rem]">
            <TagList
              tags={["Scope", "Crew", "Edit", "Motion", "Versioning", "Delivery"]}
              dark
              className="mb-8"
              label="Contact scope"
            />
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-5 border-t border-white/16 pt-6 text-white/76 md:grid-cols-3 xl:gap-x-12">
            {CONTACTS.map(([name, email]) => (
              <Contact
                key={email}
                value={name}
                sub={email}
                href={`mailto:${email}`}
              />
            ))}
          </div>

          <div className="mt-5">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Friends & Family on Instagram (@friendsandfamily.tv)"
              className="inline-flex items-center gap-2 text-white/52 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
              <span className="text-[13px] font-medium tracking-[-0.01em]">
                @friendsandfamily.tv
              </span>
            </a>
          </div>
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
      <p className="whitespace-normal text-[clamp(1.05rem,1.7vw,1.45rem)] leading-[1.08] tracking-[-0.032em] sm:whitespace-nowrap">
        {value}
      </p>
      {sub && (
        <p className="mt-2 min-w-0 text-[clamp(0.82rem,1.05vw,0.98rem)] leading-[1.2] tracking-[-0.01em] text-white/52 sm:whitespace-nowrap">
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
