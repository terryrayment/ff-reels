import type { Metadata } from "next";
import { HomeSplash } from "@/components/marketing/home-splash";

export const metadata: Metadata = {
  title: {
    absolute:
      "Friends & Family | Commercial Production Company in Los Angeles",
  },
  description:
    "Friends & Family is a commercial production company in Los Angeles and New York.",
  alternates: { canonical: "/site" },
};

export default function MarketingHomePage() {
  return (
    <>
      <h1 className="sr-only">Friends &amp; Family</h1>
      <HomeSplash />
    </>
  );
}
