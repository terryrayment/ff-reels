import type { Metadata } from "next";

import { ContactBioAccordion } from "@/components/marketing/contact-bio-accordion";

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
    bio: "Jed has a 20-plus year history as working professional in the commercial industry. His broad experience in production has given him the advantage of a wide network of collaborators and skills.",
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
    lines: ["3023 Dolores St", "Los Angeles, CA 90065"],
  },
  {
    city: "New York",
    lines: ["77 East 12th Street #17H", "New York, NY 10003"],
  },
  {
    city: "São Paulo / Curitiba",
    lines: ["São Paulo, Brazil", "Curitiba, Brazil"],
  },
];

const REPS = [
  {
    region: "West Coast",
    company: "Uncle Lefty",
    contacts: [
      { name: "James Barry", email: "james@unclelefty.com" },
      { name: "Laurel-Ann Robinson", email: "laurel-ann@unclelefty.com" },
    ],
  },
  {
    region: "East Coast",
    company: "Talk Shop",
    contacts: [
      { name: "Katie Northy", email: "katie.northy@talk-shop.tv" },
      { name: "Kenard Jackson", email: "kenard.jackson@talk-shop.tv" },
    ],
  },
  {
    region: "Midwest",
    company: "CCCo.",
    contacts: [
      { name: "Chiara Chung", email: "chiara@chiarachung.com" },
      { name: "Gunder Kehoe", email: "gunder@chiarachung.com" },
    ],
  },
];

export default function ContactPage() {
  return (
    <div className="ff-shell ff-page ff-contact-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page">CONTACT</h1>
      </header>

      <section className="ff-section-stack">
        <ContactBioAccordion contacts={CONTACTS} />
      </section>

      <section className="ff-section-stack ff-section-border ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">Offices</p>
        </div>
        <div className="ff-wide-column grid gap-8 md:grid-cols-3">
          {OFFICES.map((office) => (
            <div key={office.city} className="min-w-0">
              <p className="ff-display-feature">{office.city}</p>
              <div className="mt-3 space-y-1.5">
                {office.lines.map((line) => (
                  <p key={line} className="ff-copy-small">
                    {line}
                  </p>
                ))}
              </div>
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
                key={rep.company}
                className="grid gap-5 border-t border-ff-line-soft first:border-t-0 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start lg:py-10"
              >
                <div>
                  <p className="ff-display-feature">{rep.company}</p>
                  <p className="ff-kicker-muted">{rep.region}</p>
                </div>
                <ul className="space-y-1 md:text-right">
                  {rep.contacts.map((contact) => (
                    <li key={contact.email}>
                      <a
                        href={`mailto:${contact.email}`}
                        className="ff-text-link"
                      >
                        {contact.name} · {contact.email}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
