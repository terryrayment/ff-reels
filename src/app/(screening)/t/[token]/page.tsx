import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TreatmentPdfViewer } from "@/components/treatments/pdf-viewer";

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

  const hasPdf = !!treatment.pdfR2Key;

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

      {hasPdf ? (
        // PDF flow — custom viewer, pure black, fully branded
        <TreatmentPdfViewer
          treatmentId={treatment.id}
          title={treatment.title}
        />
      ) : (
        // Legacy InDesign/URL fallback — plain iframe, no cropping tricks.
        // (Grey chrome is inevitable for cross-origin iframes. Re-upload as PDF
        // for the fully-branded experience.)
        <div className="flex-1 bg-black">
          <iframe
            src={treatment.previewUrl ?? undefined}
            title={treatment.title}
            allow="fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0 block"
            style={{ backgroundColor: "#000" }}
          />
        </div>
      )}
    </div>
  );
}
