import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TreatmentPdfViewer } from "@/components/treatments/pdf-viewer";
import { TreatmentTracker } from "@/components/treatments/treatment-tracker";
import { ArrowUpRight } from "lucide-react";

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
      director: { select: { name: true, slug: true, websiteUrl: true } },
    },
  });

  if (!treatment) notFound();

  const hasPdf = !!treatment.pdfR2Key;
  // Director reel link target: prefer their own website, fall back to marketing site
  const reelLinkHref =
    treatment.director.websiteUrl ||
    `https://www.friendsandfamily.tv/directors/${treatment.director.slug}`;

  return (
    <TreatmentTracker treatmentId={treatment.id}>
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
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mt-0.5 flex items-center gap-2">
              <span>{treatment.director.name} · Treatment</span>
              <a
                href={reelLinkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-white/40 hover:text-white/90 transition-colors"
                title={`View ${treatment.director.name}'s reel`}
              >
                <span>View Reel</span>
                <ArrowUpRight size={10} />
              </a>
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
        // Legacy InDesign/URL fallback. The iframe fills the full area; an
        // overlay masks everything except a centered 1900:1000 (1.9:1)
        // content window — the exact aspect ratio of InDesign pages. This
        // eliminates Adobe's grey chrome + letterbox completely while
        // keeping clicks pass-through (pointer-events: none) so Adobe's
        // side nav still works.
        <div className="flex-1 bg-black relative overflow-hidden">
          <iframe
            src={treatment.previewUrl ?? undefined}
            title={treatment.title}
            allow="fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full border-0 block"
            style={{ backgroundColor: "#000" }}
          />
          {/* Mask: centered 1.9:1 hole, black everywhere else (box-shadow).
              2px top/bottom borders cover the thin white seam at the window
              edges. No horizontal padding so the deck isn't clipped. */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              style={{
                aspectRatio: "1900 / 1000",
                width: "100%",
                maxHeight: "100%",
                maxWidth: "100%",
                boxShadow: "0 0 0 100vmax #000",
                borderTop: "2px solid #000",
                borderBottom: "2px solid #000",
              }}
            />
          </div>

          {/* Download PDF button — floats bottom-center */}
          <a
            href={
              treatment.pdfR2Key
                ? `/api/treatments/${treatment.id}/pdf?download=1`
                : treatment.previewUrl ?? "#"
            }
            target={treatment.pdfR2Key ? undefined : "_blank"}
            rel="noopener noreferrer"
            download={treatment.pdfR2Key ? `${treatment.title}.pdf` : undefined}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-[10px] uppercase tracking-[0.18em] font-medium transition-all backdrop-blur-sm"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </a>
        </div>
      )}
    </div>
    </TreatmentTracker>
  );
}
