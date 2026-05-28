import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Scott Kaplan, Jed Herold, and Alana Hearn at Friends & Family for director work, production, post, animation, and VFX.",
  alternates: { canonical: "/site/contact" },
};

const CONTACTS = [
  {
    name: "Scott Kaplan",
    role: "Managing Director / EP",
    email: "scott@friendsandfamily.tv",
    bio: "A 25-year advertising production veteran and the creative engine behind Friends & Family. Scott has produced landmark campaigns for Tom Kuntz, Mark Romanek, Gus Van Sant, Noam Murro, and Malcolm Venville. His credits include Old Spice's The Man Your Man Could Smell Like, Apple's iPod series, and work for Nike, Google, and Coca-Cola.",
  },
  {
    name: "Jed Herold",
    role: "Executive Producer",
    email: "jed@friendsandfamily.tv",
    bio: "An integrated executive producer and project management leader with 20+ years across video, digital, social, and print production. Jed has held senior roles at BBDO, McCann, Grey, and Johannes Leonardo, bringing deep agency-side insight to every production and one of the widest collaborator networks in the business.",
  },
  {
    name: "Alana Hearn",
    role: "Executive Producer",
    email: "alana@friendsandfamily.tv",
    bio: "Alana began her production career at Lighthouse alongside legendary photographer Peter Lindbergh before rising to EP at Identity and Triptent, where she led content production for major brand campaigns. Her client roster spans Nike, Pepsi, Samsung, L'Oreal, and Maybelline, with expertise across commercial, fashion, and branded entertainment.",
  },
];

const OFFICES = [
  {
    city: "Los Angeles",
    lines: ["Production, directors, sales, and West Coast agency work."],
    href: "https://goo.gl/maps/BNAoVp5KUmcKbveMA",
  },
  {
    city: "New York",
    lines: ["Agency partnerships, editorial work, and East Coast production."],
    href: "https://goo.gl/maps/FG86ZiBWzyAwyCvb7",
  },
  {
    city: "Sao Paulo / Curitiba",
    lines: ["THE YOUTH and COLOSSAL for production, post, animation, and VFX."],
    href: null,
  },
];

const REPS = [
  { region: "West Coast", name: "Uncle Lefty", email: "james@unclelefty.com" },
  {
    region: "West Coast",
    name: "Uncle Lefty",
    email: "laurel-ann@unclelefty.com",
  },
  { region: "East Coast", name: "Talk Shop", email: "katie.northy@talk-shop.tv" },
  {
    region: "East Coast",
    name: "Talk Shop",
    email: "kenard.jackson@talk-shop.tv",
  },
];

export default function ContactPage() {
  return (
    <div className="ff-shell ff-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page max-w-5xl">
          Talk to the people making the work.
        </h1>
      </header>

      <section className="ff-section-grid border-y ff-rule py-8 md:py-10">
        <div className="ff-label-column">
          <p className="ff-kicker">Direct</p>
        </div>
        <div className="ff-copy-column">
          <p className="ff-lede max-w-3xl">
            No form. Send the brief, the unfinished thought, the director
            question, the schedule problem, or the thing that needs a producer
            before it needs a deck.
          </p>
        </div>
      </section>

      <section className="ff-section-stack">
        <ul className="ff-list-rows">
          {CONTACTS.map((person) => (
            <li
              key={person.email}
              className="grid gap-5 border-t border-ff-line-soft py-8 lg:grid-cols-12 lg:py-10"
            >
              <div className="lg:col-span-4">
                <p className="ff-display-section">{person.name}</p>
                <p className="ff-kicker-muted mt-3">{person.role}</p>
              </div>
              <div className="lg:col-span-6">
                <p className="ff-body max-w-3xl">{person.bio}</p>
              </div>
              <div className="lg:col-span-2 lg:text-right">
                <a href={`mailto:${person.email}`} className="ff-text-link">
                  {person.email}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ff-section-stack ff-section-border ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">Offices</p>
        </div>
        <div className="ff-wide-column grid gap-8 md:grid-cols-3">
          {OFFICES.map((office) => (
            <div key={office.city}>
              <p className="ff-display-feature">{office.city}</p>
              {office.lines.map((line) => (
                <p key={line} className="ff-copy-small mt-3">
                  {line}
                </p>
              ))}
              {office.href && (
                <a
                  href={office.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ff-text-link mt-4 inline-block"
                >
                  Open map
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="ff-section-stack ff-section-border ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">Sales reps</p>
        </div>
        <div className="ff-wide-column">
          <ul className="ff-list-rows">
            {REPS.map((rep) => (
              <li
                key={`${rep.name}-${rep.email}`}
                className="ff-list-row-compact"
              >
                <div>
                  <p className="ff-display-feature">{rep.name}</p>
                  <p className="ff-kicker-muted">{rep.region}</p>
                </div>
                <a href={`mailto:${rep.email}`} className="ff-text-link">
                  {rep.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ff-section-stack ff-section-border">
        <a
          href="mailto:scott@friendsandfamily.tv,jed@friendsandfamily.tv,alana@friendsandfamily.tv?subject=Friends%20%26%20Family%20brief"
          className="ff-display-section transition-colors hover:text-ff-muted"
        >
          Email the team
        </a>
      </section>
    </div>
  );
}
