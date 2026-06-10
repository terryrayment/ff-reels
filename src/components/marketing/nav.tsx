"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MARKETING_PARTNERS } from "@/components/marketing/partner-portal";
import { ImprintNavHoverStrip } from "@/components/marketing/imprint-nav-hover-strip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { type: "link", href: "/site/directors", label: "Directors" },
  { type: "link", href: "/site/work", label: "Work" },
  { type: "partner", href: "/site/youth", partnerId: "youth" },
  { type: "partner", href: "/site/colossal", partnerId: "colossal" },
  { type: "link", href: "/site/about", label: "About" },
  { type: "link", href: "/site/contact", label: "Contact" },
] as const;

const MOBILE_MENU_ID = "marketing-mobile-menu";

function PartnerNavLink({
  href,
  label,
  partnerId,
  active,
  partnerRoute,
  tabIndex,
  onNavigate,
}: {
  href: string;
  label: string;
  partnerId: keyof typeof MARKETING_PARTNERS;
  active: boolean;
  partnerRoute: boolean;
  tabIndex?: number;
  onNavigate?: () => void;
}) {
  const [hoverOpen, setHoverOpen] = useState(false);

  const linkClass = cn(
    "ff-nav-label inline-flex h-ff-nav items-center transition-colors duration-150 ease-out",
    partnerRoute
      ? active
        ? "text-white"
        : "text-white/55 hover:text-white focus-visible:text-white"
      : active
        ? "text-ff-ink"
        : "text-ff-muted hover:text-ff-ink focus-visible:text-ff-ink",
  );

  return (
    <div
      className={cn(
        "ff-imprint-nav-item group/imprint relative flex items-center",
        hoverOpen && "is-imprint-hover-open",
      )}
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      onFocus={() => setHoverOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHoverOpen(false);
        }
      }}
    >
      <Link
        href={href}
        prefetch={false}
        tabIndex={tabIndex}
        onClick={onNavigate}
        className={linkClass}
        aria-describedby={`imprint-nav-tip-${partnerId}`}
      >
        {label}
      </Link>
      <ImprintNavHoverStrip
        id={`imprint-nav-tip-${partnerId}`}
        partnerId={partnerId}
        onNavigate={onNavigate}
      />
    </div>
  );
}

export function MarketingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const partnerRoute =
    pathname?.startsWith("/site/youth") || pathname?.startsWith("/site/colossal");

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        partnerRoute
          ? "bg-black border-b border-white/15"
          : open
            ? "bg-[var(--ff-site-accent)] border-b border-[rgb(var(--ff-rgb-ink)_/_0.08)]"
            : scrolled
              ? "bg-[rgb(var(--ff-rgb-paper)_/_0.85)] backdrop-blur-md border-b border-[rgb(var(--ff-rgb-ink)_/_0.06)]"
              : "bg-transparent border-b border-transparent",
      )}
    >
      <nav className="mx-auto max-w-ff px-ff-x h-ff-nav flex items-center justify-between">
        <div className="relative flex min-w-0 items-center">
          <Link
            href="/site"
            prefetch={false}
            aria-label="Friends & Family"
            className="block shrink-0 opacity-100 transition-opacity duration-150 ease-out hover:opacity-75 focus-visible:opacity-75"
            data-cursor="link"
          >
            <Image
              src="/brand/ff-logomark.png"
              alt=""
              width={778}
              height={933}
              sizes="36px"
              priority
              className={cn(
                "ff-site-logomark h-9 w-auto",
                partnerRoute && "invert",
              )}
            />
          </Link>
        </div>

        <div className="hidden min-[1180px]:flex items-center">
          <ul className="flex items-center gap-3 min-[1100px]:gap-5">
            {NAV_ITEMS.map((item) => {
              if (item.type === "partner") {
                const partner = MARKETING_PARTNERS[item.partnerId];
                const active = pathname?.startsWith(item.href);
                return (
                  <li key={item.partnerId} className="flex items-center">
                    <PartnerNavLink
                      href={item.href}
                      label={partner.label}
                      partnerId={item.partnerId}
                      active={!!active}
                      partnerRoute={partnerRoute}
                    />
                  </li>
                );
              }

              const active = pathname?.startsWith(item.href);
              return (
                <li key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "ff-nav-label inline-flex h-ff-nav items-center transition-colors",
                      partnerRoute
                        ? active
                          ? "text-white"
                          : "text-white/55 hover:text-white"
                        : active
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
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center font-helveticaText text-ff-micro font-medium uppercase tracking-ff-micro min-[1180px]:hidden",
            partnerRoute
              ? "text-white"
              : open
                ? "text-[var(--ff-site-accent-ink)]"
                : "text-ff-ink",
          )}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[-1] min-[1180px]:hidden"
        />
      )}

      <div
        id={MOBILE_MENU_ID}
        aria-hidden={!open}
        className={cn(
          "ff-mobile-menu min-[1180px]:hidden",
          open && "is-open",
          partnerRoute && "ff-mobile-menu--partner-route",
        )}
      >
        <div className="ff-mobile-menu__inner">
          <ul className="ff-mobile-menu__list">
            {NAV_ITEMS.map((item) => {
              if (item.type === "partner") {
                const partner = MARKETING_PARTNERS[item.partnerId];
                return (
                  <li key={item.partnerId} className="ff-mobile-menu__item">
                    <Link
                      href={item.href}
                      prefetch={false}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      className="ff-mobile-menu__link ff-focusable"
                    >
                      {partner.label}
                    </Link>
                    <ImprintNavHoverStrip
                      partnerId={item.partnerId}
                      variant="drawer"
                      onNavigate={() => setOpen(false)}
                    />
                  </li>
                );
              }

              return (
                <li key={item.href} className="ff-mobile-menu__item">
                  <Link
                    href={item.href}
                    prefetch={false}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="ff-mobile-menu__link ff-focusable"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}
