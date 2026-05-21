"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MARKETING_PARTNERS,
  PartnerPortal,
  type PartnerId,
} from "@/components/marketing/partner-portal";
import { Magnetic } from "@/components/marketing/magnetic";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/site/directors", label: "Directors" },
  { href: "/site/work", label: "Work" },
  { href: "/site/about", label: "About" },
  { href: "/site/contact", label: "Contact" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<PartnerId | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!activePartner) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePartner(null);
    };
    document.documentElement.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePartner]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-[rgb(var(--ff-rgb-paper)_/_0.85)] backdrop-blur-md border-b border-[rgb(var(--ff-rgb-ink)_/_0.06)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <nav className="mx-auto max-w-ff px-ff-x h-ff-nav flex items-center justify-between">
        <div className="relative flex min-w-0 items-center">
          <Magnetic className="block shrink-0">
            <Link
              href="/site"
              aria-label="Friends & Family"
              className="block opacity-100 transition-opacity duration-150 ease-out hover:opacity-75 focus-visible:opacity-75"
              data-cursor="link"
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
          </Magnetic>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-5 pr-1">
            {(Object.keys(MARKETING_PARTNERS) as PartnerId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivePartner(id)}
                className="ff-nav-label text-ff-muted transition-colors duration-150 ease-out hover:text-ff-ink focus-visible:text-ff-ink"
              >
                {MARKETING_PARTNERS[id].label}
              </button>
            ))}
          </div>

          <ul className="flex items-center gap-7">
            {LINKS.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "ff-nav-label transition-colors",
                      active
                        ? "text-ff-ink"
                        : "text-ff-muted hover:text-ff-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="font-helveticaText text-ff-micro font-medium uppercase tracking-ff-micro text-ff-ink md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-ff-line-soft bg-ff-paper">
          <div className="px-6 py-5">
            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3 border-b border-ff-line-soft pb-5">
              {(Object.keys(MARKETING_PARTNERS) as PartnerId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setActivePartner(id);
                  }}
                  className="ff-nav-label text-ff-muted"
                >
                  {MARKETING_PARTNERS[id].label}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="ff-font-display block text-ff-nav-drawer font-medium text-ff-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activePartner && (
        <PartnerPortal
          partnerId={activePartner}
          onClose={() => setActivePartner(null)}
        />
      )}
    </header>
  );
}
