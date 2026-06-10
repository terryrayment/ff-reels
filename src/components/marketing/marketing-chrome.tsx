"use client";

import { usePathname } from "next/navigation";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

function isHomeSplash(pathname: string | null) {
  return pathname === "/site";
}

function isPreviewBrowser(pathname: string | null) {
  return pathname === "/site/preview";
}

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const splash = isHomeSplash(pathname);
  const previewBrowser = isPreviewBrowser(pathname);

  if (previewBrowser) {
    return (
      <div
        className="ff-site-theme min-h-screen bg-ff-paper text-ff-ink font-helveticaText"
        data-ff-colorway="portfolio-olive"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="ff-site-theme min-h-screen flex flex-col bg-ff-paper text-ff-ink font-helveticaText"
      data-ff-colorway="portfolio-olive"
      data-ff-home-splash={splash ? "true" : undefined}
    >
      <MarketingNav />
      <main className={splash ? "flex-1 min-h-0" : "flex-1"}>{children}</main>
      {!splash && <MarketingFooter />}
    </div>
  );
}
