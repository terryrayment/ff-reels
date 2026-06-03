"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/friendsandfamily.tv" },
];

export function MarketingFooter() {
  const pathname = usePathname();

  if (
    pathname === "/site/about" ||
    pathname?.startsWith("/site/youth") ||
    pathname?.startsWith("/site/colossal")
  ) {
    return null;
  }

  return (
    <footer className="border-t ff-rule mt-32">
      <div className="ff-shell py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
