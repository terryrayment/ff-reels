import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getAppUrl } from "@/lib/seo/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A1A1A",
};

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Friends & Family Reels",
    template: "%s | Friends & Family Reels",
  },
  description:
    "Internal reel management, screening links, and analytics platform for Friends & Family.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Friends & Family",
    "commercial production company",
    "Los Angeles production company",
    "director reels",
    "screening links",
    "video portfolio",
  ],
  openGraph: {
    title: "Friends & Family Reels",
    description:
      "Internal reel management and screening platform for the Friends & Family team.",
    type: "website",
    url: "/",
    siteName: "Friends & Family Reels",
  },
  twitter: {
    card: "summary",
    title: "Friends & Family Reels",
    description:
      "Internal reel management and screening platform for the Friends & Family team.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FF Reels",
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#F7F6F3] text-[#1A1A1A]`}>
        {children}
      </body>
    </html>
  );
}
