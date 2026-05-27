import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Cursor } from "@/components/marketing/cursor";
import { LenisProvider } from "@/components/marketing/lenis-provider";

export const metadata: Metadata = {
  title: {
    default: "Friends & Family",
    template: "%s — Friends & Family",
  },
  description:
    "Friends & Family is a creative studio for directors, production, post, animation, and VFX across Los Angeles, New York, São Paulo, and Curitiba.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Friends & Family",
    description:
      "A creative studio for moving-image work across Los Angeles, New York, São Paulo, and Curitiba.",
    type: "website",
    siteName: "Friends & Family",
  },
  twitter: {
    card: "summary_large_image",
    title: "Friends & Family",
    description:
      "A creative studio for moving-image work across Los Angeles, New York, São Paulo, and Curitiba.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <div className="min-h-screen flex flex-col bg-ff-paper text-ff-ink font-helveticaText">
        <Cursor />
        <MarketingNav />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </LenisProvider>
  );
}
