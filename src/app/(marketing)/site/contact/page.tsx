import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { RevealText } from "@/components/marketing/reveal-text";

export const metadata: Metadata = { title: "Contact" };

const CONTACTS = [
  { name: "Scott", role: "EP / Partner", email: "scott@friendsandfamily.tv" },
  { name: "Jed", role: "EP / Partner", email: "jed@friendsandfamily.tv" },
  { name: "Alana", role: "Head of Production", email: "alana@friendsandfamily.tv" },
];

export default function ContactPage() {
  return (
    <div className="ff-shell ff-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page max-w-5xl">
          <RevealText text="Let’s talk about your next project." />
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-12">
          <div>
            <p className="ff-kicker mb-4">
              Direct
            </p>
            <ul className="space-y-3">
              {CONTACTS.map((c) => (
                <li key={c.email}>
                  <p className="ff-footer-brand">
                    {c.name}
                  </p>
                  <p className="ff-kicker-muted mt-0.5">
                    {c.role}
                  </p>
                  <a
                    href={`mailto:${c.email}`}
                    className="ff-footer-copy mt-1 block transition-colors hover:text-ff-muted"
                  >
                    {c.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </aside>

        <section className="lg:col-span-8">
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
