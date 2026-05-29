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

export function ContactCta({ recipientFirstName }: Props) {
  return (
    <section className={`${SECTION} pb-4 lg:pb-8`}>
      <div className={CONTAINER}>
        <div className={`${REVEAL} relative overflow-hidden rounded-[4px] bg-[#2447FF] p-5 text-white sm:p-7 lg:p-8`}>
          <div aria-hidden="true" className={SURFACE_GRAIN} />
          <div className="relative z-10">
          <SectionHeader
            label={recipientFirstName ? `${recipientFirstName}, contact` : "Contact"}
            title="Send the assignment."
            intro="Brief, deadline, rights, assets, blockers. We will respond with scope, team, timeline, and delivery plan."
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
      <p className="whitespace-nowrap text-[clamp(1.05rem,1.7vw,1.45rem)] leading-[1.05] tracking-[-0.035em]">
        {value}
      </p>
      {sub && (
        <p className="mt-2 min-w-0 whitespace-nowrap text-[clamp(0.82rem,1.05vw,0.98rem)] leading-[1.15] tracking-[-0.01em] text-white/52">
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
