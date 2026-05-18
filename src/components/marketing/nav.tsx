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

const PARTNERS = {
  colossal: {
    label: "COLOSSAL",
    location: "Curitiba",
    discipline: "Post / animation / VFX",
    href: "https://colossal.film/",
    body:
      "Post, animation, VFX, compositing, motion, and design-led finishing connected to the Friends & Family network from Curitiba.",
    details: ["Curitiba", "Post", "Animation", "VFX"],
  },
  youth: {
    label: "THE YOUTH",
    location: "São Paulo",
    discipline: "Production / creative practice",
    href: "https://theyouth.com.br/",
    body:
      "Production, casting, creative development, and culture work connected to the Friends & Family network from São Paulo.",
    details: ["São Paulo", "Production", "Casting", "Culture"],
  },
} as const;

type PartnerId = keyof typeof PARTNERS;

export function MarketingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<PartnerId | null>(null);
  const partner = activePartner ? PARTNERS[activePartner] : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-5 pr-1">
            {(Object.keys(PARTNERS) as PartnerId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivePartner(id)}
                className="font-helveticaText text-[10px] font-medium uppercase tracking-[0.16em] text-[#777] transition-colors duration-150 ease-out hover:text-[#1A1A1A] focus-visible:text-[#1A1A1A]"
              >
                {PARTNERS[id].label}
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
                      "font-helveticaText text-[10px] font-medium uppercase tracking-[0.16em] transition-colors",
                      active
                        ? "text-[#1A1A1A]"
                        : "text-[#666] hover:text-[#1A1A1A]",
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
          className="md:hidden font-helveticaText text-[11px] font-medium uppercase tracking-[0.14em] text-[#1A1A1A]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[#E8E7E3] bg-[#F5F4F0]">
          <div className="px-6 py-5">
            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3 border-b border-[#E8E7E3] pb-5">
              {(Object.keys(PARTNERS) as PartnerId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setActivePartner(id);
                  }}
                  className="font-helveticaText text-[10px] font-medium uppercase tracking-[0.16em] text-[#666]"
                >
                  {PARTNERS[id].label}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block font-helveticaDisplay text-[30px] font-medium leading-none text-[#1A1A1A]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {partner && (
        <div
          className="fixed inset-0 z-[60] bg-[#1A1A1A]/18 backdrop-blur-[2px] animate-[fadeIn_180ms_ease-out_forwards]"
          aria-modal="true"
          role="dialog"
          aria-labelledby="partner-panel-title"
        >
          <button
            type="button"
            aria-label="Close partner panel"
            className="absolute inset-0 cursor-default"
            onClick={() => setActivePartner(null)}
          />
          <aside className="absolute right-0 top-0 flex h-screen w-full max-w-[680px] flex-col bg-[#F5F4F0] shadow-[-30px_0_90px_rgba(0,0,0,0.18)] animate-[partnerPanelIn_620ms_cubic-bezier(0.65,0,0.35,1)_both]">
            <div className="flex h-16 items-center justify-between border-b border-[#E1E0DA] px-6 lg:px-10">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#777]">
                Under the hood
              </p>
              <button
                type="button"
                onClick={() => setActivePartner(null)}
                className="font-helveticaText text-[10px] font-medium uppercase tracking-[0.16em] text-[#666] transition-colors hover:text-[#1A1A1A]"
              >
                Close
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between px-6 py-10 lg:px-10 lg:py-14">
              <div>
                <p className="mb-5 text-[11px] uppercase tracking-[0.18em] text-[#999]">
                  {partner.location} / {partner.discipline}
                </p>
                <h2
                  id="partner-panel-title"
                  className="font-helveticaDisplay text-[58px] font-semibold leading-[0.92] text-[#1A1A1A] md:text-[92px]"
                >
                  {partner.label}
                </h2>
                <p className="mt-8 max-w-xl text-[20px] leading-snug text-[#1A1A1A] md:text-[26px]">
                  {partner.body}
                </p>
              </div>

              <div className="mt-14">
                <div className="grid grid-cols-2 border-y border-[#E1E0DA] md:grid-cols-4">
                  {partner.details.map((detail) => (
                    <p
                      key={detail}
                      className="border-b border-[#E1E0DA] py-4 text-[10px] uppercase tracking-[0.16em] text-[#666] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
                    >
                      {detail}
                    </p>
                  ))}
                </div>
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex font-helveticaText text-[11px] font-medium uppercase tracking-[0.16em] text-[#1A1A1A] transition-colors hover:text-[#666]"
                >
                  Visit {partner.label} →
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
      <style>{`
        @keyframes partnerPanelIn {
          from {
            transform: translate3d(100%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>

    </header>
  );
}
