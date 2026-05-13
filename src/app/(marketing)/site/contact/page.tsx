import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = { title: "Contact" };

const CONTACTS = [
  { name: "Scott", role: "EP / Partner", email: "scott@friendsandfamily.tv" },
  { name: "Jed", role: "EP / Partner", email: "jed@friendsandfamily.tv" },
  { name: "Alana", role: "Head of Production", email: "alana@friendsandfamily.tv" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-32 lg:pt-40 pb-24">
      <header className="mb-16">
        <h1 className="text-[40px] md:text-[56px] tracking-tight-3 font-light text-[#1A1A1A] max-w-3xl leading-[1.02]">
          Let&rsquo;s talk about your next project.
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-4">
              Direct
            </p>
            <ul className="space-y-3">
              {CONTACTS.map((c) => (
                <li key={c.email}>
                  <p className="text-[15px] tracking-tight-2 text-[#1A1A1A]">
                    {c.name}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#666] mt-0.5">
                    {c.role}
                  </p>
                  <a
                    href={`mailto:${c.email}`}
                    className="block mt-1 text-[13px] text-[#1A1A1A] hover:text-[#666] transition-colors"
                  >
                    {c.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-3">
              Los Angeles
            </p>
            <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
              1234 Sunset Blvd
              <br />
              Los Angeles, CA 90026
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-3">
              New York
            </p>
            <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
              456 Greene Street
              <br />
              New York, NY 10012
            </p>
          </div>
        </aside>

        <section className="lg:col-span-8">
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
