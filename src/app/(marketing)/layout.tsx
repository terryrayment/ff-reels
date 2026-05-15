import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: {
    default: "Friends & Family",
    template: "%s — Friends & Family",
  },
  description:
    "Friends & Family is a creative network across Los Angeles, New York, São Paulo, and Curitiba. Director-led, independently run.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Friends & Family",
    description:
      "A creative network. Los Angeles, New York, São Paulo, Curitiba.",
    type: "website",
    siteName: "Friends & Family",
  },
  twitter: {
    card: "summary_large_image",
    title: "Friends & Family",
    description:
      "A creative network. Los Angeles, New York, São Paulo, Curitiba.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F0] text-[#1A1A1A] font-helveticaText">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
