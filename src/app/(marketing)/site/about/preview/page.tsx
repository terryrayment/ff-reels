import type { Metadata } from "next";
import { AboutPhotoTrail } from "@/components/marketing/about-photo-trail";
import { ABOUT_PHOTOS } from "@/lib/about/photos";

export const metadata: Metadata = {
  title: "About · Micro-moves preview",
  robots: { index: false, follow: false },
};

export default function AboutMicroMovesPreviewPage() {
  return (
    <>
      <h1 className="sr-only">About micro-moves preview</h1>
      <p className="sr-only">
        Preview of Cosmos-style micro-settle animation on the About photo trail.
        Move the cursor to spawn photos.
      </p>
      <AboutPhotoTrail photos={ABOUT_PHOTOS} microMoves="cosmos" />
    </>
  );
}
