import type { Metadata } from "next";
import { HomeTypeHero } from "@/components/marketing/home-type-hero";

export const metadata: Metadata = {
  title: "Home · Type-over-video preview",
  description: "Preview of homepage mockup #1: company name centered over the showreel.",
  robots: { index: false, follow: false },
};

export default function HomeTypeHeroPreviewPage() {
  return (
    <>
      <p className="sr-only">
        Preview mockup #1: Friends &amp; Family centered over the looping hero
        video with office locations underneath.
      </p>
      <HomeTypeHero />
    </>
  );
}
