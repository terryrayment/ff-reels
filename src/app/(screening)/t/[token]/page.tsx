import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const treatment = await prisma.treatmentSample.findUnique({
    where: { token: params.token },
    select: {
      title: true,
      brand: true,
      director: { select: { name: true } },
    },
  });

  const title = treatment
    ? treatment.brand
      ? `${treatment.brand} — ${treatment.title}`
      : treatment.title
    : "Treatment — Friends & Family";

  const description = treatment
    ? `A treatment by ${treatment.director.name} via Friends & Family`
    : "Friends & Family";

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: { title, description, type: "website" },
  };
}

export default async function TreatmentPage({
  params,
}: {
  params: { token: string };
}) {
  const treatment = await prisma.treatmentSample.findUnique({
    where: { token: params.token },
    include: {
      director: { select: { name: true, slug: true } },
    },
  });

  if (!treatment) notFound();

  // Detect Adobe InDesign publish URLs — they have a known grey chrome
  // (header + footer strips) that we need to crop with overflow:hidden.
  const isInDesign = /^https:\/\/indd\.adobe\.com\//i.test(treatment.previewUrl);

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-3 bg-black border-b border-white/[0.06]">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="/logo.svg"
            alt="Friends & Family"
            className="w-6 h-6 object-contain invert opacity-40 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white/90 truncate">
              {treatment.brand && (
                <span className="text-white/50 font-normal">
                  {treatment.brand} —{" "}
                </span>
              )}
              {treatment.title}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mt-0.5">
              {treatment.director.name} · Treatment
            </p>
          </div>
        </div>
        <a
          href="https://www.friendsandfamily.tv"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/25 hover:text-white/50 transition-colors flex-shrink-0 ml-4"
        >
          Friends &amp; Family
        </a>
      </header>

      {/* Iframe — for InDesign, wrap in a 16:9 box centered in the viewport
          with 50px horizontal margins. Transform-scale pushes Adobe's grey
          chrome + letterbox off the edges; overflow:hidden crops them. Thick
          black safety bars on top/bottom hide any remaining grey leakage. */}
      <div
        className="flex-1 bg-black flex items-center justify-center"
        style={{ padding: "0 50px" }}
      >
        {isInDesign ? (
          <div
            className="relative bg-black overflow-hidden"
            style={{
              width: "min(100%, calc((100vh - 16px) * 16 / 9))",
              aspectRatio: "16 / 9",
            }}
          >
            <iframe
              src={treatment.previewUrl}
              title={treatment.title}
              allow="fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full border-0 block"
              style={{
                backgroundColor: "#000",
                transform: "scale(1.14)",
                transformOrigin: "center center",
              }}
            />
            {/* Safety-net black bars — hide any remaining grey chrome/letterbox */}
            <div className="absolute top-0 left-0 right-0 bg-black pointer-events-none" style={{ height: "7%" }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black pointer-events-none" style={{ height: "7%" }} />
          </div>
        ) : (
          <iframe
            src={treatment.previewUrl}
            title={treatment.title}
            allow="fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0 block"
            style={{ backgroundColor: "#000" }}
          />
        )}
      </div>
    </div>
  );
}
