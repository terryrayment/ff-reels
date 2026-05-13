import type { Metadata } from "next";
import { absoluteAppUrl, absoluteMarketingUrl } from "@/lib/seo/site";

const PAGE_PATH = "/commercial-production-company-los-angeles";
const PAGE_TITLE =
  "High-End Commercial Production Company in Los Angeles | Friends & Family";
const PAGE_DESCRIPTION =
  "Friends & Family is a Los Angeles commercial production company creating premium, director-led brand films, broadcast spots, and campaign work.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "high-end commercial production company Los Angeles",
    "commercial production company Los Angeles",
    "LA production company",
    "director-led commercials",
    "premium brand film production",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: PAGE_PATH,
    siteName: "Friends & Family",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${absoluteMarketingUrl()}/#organization`,
  name: "Friends & Family",
  url: absoluteMarketingUrl(),
  logo: absoluteAppUrl("/logo.svg"),
  sameAs: [absoluteMarketingUrl()],
  areaServed: [
    {
      "@type": "City",
      name: "Los Angeles",
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Commercial Video Production",
  provider: {
    "@id": `${absoluteMarketingUrl()}/#organization`,
  },
  areaServed: {
    "@type": "City",
    name: "Los Angeles",
  },
  url: absoluteAppUrl(PAGE_PATH),
  description:
    "High-end commercial production services for agencies and brands, including director treatment development, production, and post.",
};

export default function CommercialProductionLosAngelesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, serviceSchema]),
        }}
      />

      <h1 className="text-4xl font-semibold tracking-tight text-[#1A1A1A] sm:text-5xl">
        High-End Commercial Production Company in Los Angeles
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[#3C3C3C]">
        Friends & Family develops and produces director-led commercial work for
        brands and agencies. Our focus is cinematic storytelling, precise
        execution, and campaign-level craft across broadcast, digital, and
        social cuts.
      </p>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6">
          <h2 className="text-xl font-semibold">What We Produce</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B4B4B]">
            National and regional commercials, campaign films, product spots,
            branded content, and social-first edits built from one production
            system.
          </p>
        </div>
        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6">
          <h2 className="text-xl font-semibold">How We Work</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B4B4B]">
            Director discovery, treatment development, budgeting, production,
            and post are aligned around creative intent and clear client
            communication.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#DDD9CF] bg-white p-6">
        <h2 className="text-2xl font-semibold">Los Angeles Production Partner</h2>
        <p className="mt-3 leading-relaxed text-[#4B4B4B]">
          We support agency and brand teams that need a trusted Los Angeles
          partner for high-stakes commercial production. For current roster,
          work, and inquiries, visit the primary site.
        </p>
        <a
          href={absoluteMarketingUrl()}
          className="mt-5 inline-flex rounded-full bg-[#1A1A1A] px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          Visit friendsandfamily.tv
        </a>
      </section>
    </main>
  );
}
