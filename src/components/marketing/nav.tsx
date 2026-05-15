"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/site/directors", label: "Directors" },
  { href: "/site/work", label: "Work" },
  { href: "/site/about", label: "About" },
  { href: "/site/contact", label: "Contact" },
];

function PartnerAffiliation() {
  // TODO: Replace plain-text wordmarks with /brand/the-youth.svg
  // and /brand/colossal.svg once the YOUTH SVG asset is supplied.
  // Mobile fallback can then be re-enabled.
  return (
    <div className="absolute left-0 top-full mt-[2px] flex max-w-[calc(100vw-8rem)] items-baseline gap-[0.45em] overflow-hidden whitespace-nowrap font-helveticaText text-[9px] uppercase tracking-[0.18em] text-[#999]">
      <span>AN IMPRINT OF</span>
      <a
        href="https://theyouth.com.br/"
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-70 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:opacity-100"
      >
        THE YOUTH
      </a>
      <span aria-hidden="true">·</span>
      <a
        href="https://colossal.film/"
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-70 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:opacity-100"
      >
        COLOSSAL
      </a>
    </div>
  );
}

export function MarketingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-[#F5F4F0]/85 backdrop-blur-md border-b border-[#E8E7E3]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <nav className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="relative flex min-w-0 items-center">
          <Link
            href="/site"
            aria-label="Friends & Family"
            className="block shrink-0 opacity-100 transition-opacity duration-150 ease-out hover:opacity-75 focus-visible:opacity-75"
          >
            <Image
              src="/brand/ff-logomark.png"
              alt=""
              width={778}
              height={933}
              sizes="36px"
              priority
              className="h-9 w-auto"
            />
          </Link>
          <PartnerAffiliation />
        </div>

        <ul className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-[13px] tracking-tight transition-colors",
                    active ? "text-[#1A1A1A]" : "text-[#666] hover:text-[#1A1A1A]",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[13px] text-[#1A1A1A] tracking-tight"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[#E8E7E3] bg-[#F5F4F0]">
          <ul className="px-6 py-4 space-y-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-[15px] tracking-tight-2 text-[#1A1A1A]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
