import Link from "next/link";

const OFFICES = [
  {
    city: "Los Angeles",
    lines: ["1234 Sunset Blvd", "Los Angeles, CA 90026"],
  },
  {
    city: "New York",
    lines: ["456 Greene Street", "New York, NY 10012"],
  },
];

const CONTACTS = [
  { name: "Scott", email: "scott@friendsandfamily.tv" },
  { name: "Jed", email: "jed@friendsandfamily.tv" },
  { name: "Alana", email: "alana@friendsandfamily.tv" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/friendsandfamily.tv" },
  { label: "Vimeo", href: "https://vimeo.com/friendsandfamily" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E8E7E3] mt-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <p className="text-[15px] tracking-tight-2 font-medium text-[#1A1A1A]">
              Friends &amp; Family
            </p>
            <p className="mt-2 text-[12px] tracking-tight text-[#666] max-w-xs leading-relaxed">
              A creative network. Los Angeles, New York, São Paulo, Curitiba.
            </p>
          </div>

          {OFFICES.map((office) => (
            <div key={office.city}>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
                {office.city}
              </p>
              <div className="mt-3 space-y-0.5 text-[13px] text-[#1A1A1A] leading-relaxed">
                {office.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
              Contact
            </p>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {CONTACTS.map((c) => (
                <li key={c.email}>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-[#1A1A1A] hover:text-[#666] transition-colors"
                  >
                    {c.name} &middot; {c.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E8E7E3] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ul className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] tracking-tight text-[#666] hover:text-[#1A1A1A] transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <Link
              href="/site/contact"
              className="text-[12px] tracking-tight text-[#666] hover:text-[#1A1A1A] transition-colors"
            >
              Get in touch
            </Link>
            <p className="text-[12px] tracking-tight text-[#999]">
              &copy; {new Date().getFullYear()} Friends &amp; Family
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
