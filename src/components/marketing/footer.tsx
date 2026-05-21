import Link from "next/link";

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
    <footer className="border-t ff-rule mt-32">
      <div className="ff-shell py-16">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12">
          <div>
            <p className="ff-footer-brand">
              Friends &amp; Family
            </p>
            <p className="ff-meta mt-2 max-w-xs">
              A creative network. Los Angeles, New York, São Paulo, Curitiba.
            </p>
          </div>

          <div>
            <p className="ff-kicker">
              Contact
            </p>
            <ul className="ff-footer-copy mt-3 space-y-1.5">
              {CONTACTS.map((c) => (
                <li key={c.email}>
                  <a
                    href={`mailto:${c.email}`}
                    className="transition-colors hover:text-ff-muted"
                  >
                    {c.name} &middot; {c.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t ff-rule flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ul className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ff-meta transition-colors hover:text-ff-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6">
            <Link
              href="/site/contact"
              className="ff-meta transition-colors hover:text-ff-ink"
            >
              Get in touch
            </Link>
            <p className="ff-meta text-ff-faint">
              &copy; {new Date().getFullYear()} Friends &amp; Family
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
