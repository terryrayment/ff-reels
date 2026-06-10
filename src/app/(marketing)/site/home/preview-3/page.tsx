import type { Metadata } from "next";
import { HomeSplitHero } from "@/components/marketing/home-split-hero";
import { getCanonicalDirectors } from "@/lib/marketing/canonical-source";

export const metadata: Metadata = {
  title: "Home · Split hero preview",
  description:
    "Preview of homepage mockup #3: brand copy left, rotating director reels right.",
  robots: { index: false, follow: false },
};

export default function HomeSplitHeroPreviewPage() {
  const slides = getCanonicalDirectors()
    .slice(0, 6)
    .map((director) => {
      const heroProject = director.portfolio[0] ?? null;
      return {
        slug: director.slug,
        name: director.name,
        stillUrl: heroProject?.thumbnailUrl ?? director.imageUrl ?? null,
        muxPlaybackId: heroProject?.muxPlaybackId ?? null,
        sourceVideoUrl: heroProject?.sourceVideoUrl ?? null,
      };
    })
    .filter((slide) => slide.stillUrl || slide.muxPlaybackId || slide.sourceVideoUrl);

  return (
    <>
      <p className="sr-only">
        Preview mockup #3: Friends &amp; Family copy on the left, rotating
        director hero reels on the right.
      </p>
      <HomeSplitHero slides={slides} />
    </>
  );
}
