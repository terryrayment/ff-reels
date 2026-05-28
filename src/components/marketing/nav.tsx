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

const NAV_ITEMS = [
  { type: "link", href: "/site/work", label: "Work" },
  { type: "link", href: "/site/directors", label: "Talent" },
  { type: "partner", partnerId: "youth" },
  { type: "partner", partnerId: "colossal" },
  { type: "link", href: "/site/about", label: "About" },
  { type: "link", href: "/site/contact", label: "Contact" },
] as const;

const MOBILE_MENU_ID = "marketing-mobile-menu";

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
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

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

        <div className="hidden min-[1180px]:flex items-center">
          <ul className="flex items-center gap-3 min-[1100px]:gap-5">
            {NAV_ITEMS.map((item) => {
              if (item.type === "partner") {
                const partner = MARKETING_PARTNERS[item.partnerId];
                return (
                  <li key={item.partnerId} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setActivePartner(item.partnerId)}
                      className="ff-nav-label inline-flex h-ff-nav items-center text-ff-muted transition-colors duration-150 ease-out hover:text-ff-ink focus-visible:text-ff-ink"
                    >
                      {partner.label}
                    </button>
                  </li>
                );
              }

              const active = pathname?.startsWith(item.href);
              return (
                <li key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "ff-nav-label inline-flex h-ff-nav items-center transition-colors",
                      active
                        ? "text-ff-ink"
                        : "text-ff-muted hover:text-ff-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls={MOBILE_MENU_ID}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="font-helveticaText text-ff-micro font-medium uppercase tracking-ff-micro text-ff-ink min-[1180px]:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div
        id={MOBILE_MENU_ID}
        aria-hidden={!open}
        className={cn(
          "ff-mobile-menu min-[1180px]:hidden border-t border-ff-line-soft bg-ff-paper",
          open && "is-open",
        )}
      >
          <div className="px-6 py-5">
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => {
                if (item.type === "partner") {
                  const partner = MARKETING_PARTNERS[item.partnerId];
                  return (
                    <li key={item.partnerId}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setActivePartner(item.partnerId);
                        }}
                        tabIndex={open ? 0 : -1}
                        className="ff-font-display block text-left text-ff-nav-drawer font-medium text-ff-ink"
                      >
                        {partner.label}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      tabIndex={open ? 0 : -1}
                      className="ff-font-display block text-ff-nav-drawer font-medium text-ff-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      {activePartner && (
        <PartnerPortal
          partnerId={activePartner}
          onClose={() => setActivePartner(null)}
        />
      )}
    </header>
  );
}
