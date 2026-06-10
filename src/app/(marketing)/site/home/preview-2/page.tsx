import type { Metadata } from "next";
import { HomeSolidHero } from "@/components/marketing/home-solid-hero";

export const metadata: Metadata = {
  title: "Home · Solid brand field preview",
  description:
    "Preview of homepage mockup #2: olive brand panel first, showreel revealed on scroll.",
  robots: { index: false, follow: false },
};

export default function HomeSolidHeroPreviewPage() {
  return (
    <>
      <p className="sr-only">
        Preview mockup #2: solid olive brand field with centered company name,
        video peek at the bottom edge, and full showreel below on scroll.
      </p>
      <HomeSolidHero />
    </>
  );
}
