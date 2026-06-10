import type { Metadata } from "next";
import { AboutPhotoTrail } from "@/components/marketing/about-photo-trail";
import { ABOUT_PHOTOS } from "@/lib/about/photos";

export const metadata: Metadata = {
  title: "About",
  description:
    "A visual archive field for Friends & Family, a creative studio built around directors, production, post, animation, and VFX.",
  alternates: { canonical: "/site/about" },
};

export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">About Friends &amp; Family</h1>
      <AboutPhotoTrail photos={ABOUT_PHOTOS} microMoves="cosmos" />
    </>
  );
}
