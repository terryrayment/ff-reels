import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PdfDownloadLink } from "@/components/treatments/pdf-download-link";
import { TreatmentPdfViewer } from "@/components/treatments/pdf-viewer";
import { TreatmentTracker } from "@/components/treatments/treatment-tracker";
import { ArrowUpRight, Download } from "lucide-react";

export const dynamic = "force-dynamic";

// Override the root layout's `userScalable: false` — recipients open treatments
// on phones and need to pinch-zoom into deck details.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
};

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
  const hasPreviewUrl = !!treatment.previewUrl;
  const usePdfViewer = hasPdf && !hasPreviewUrl;
  const pdfUrl = hasPdf
    ? `/api/treatments/${treatment.id}/pdf?download=1&v=${encodeURIComponent(treatment.pdfR2Key!)}`
    : `/api/treatments/${treatment.id}/pdf?download=1`;
  // Director reel link target: prefer their own website, fall back to marketing site
  const reelLinkHref =
    treatment.director.websiteUrl ||
    `https://www.friendsandfamily.tv/directors/${treatment.director.slug}`;

  return (
    <TreatmentTracker treatmentId={treatment.id}>
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 pt-3 pb-2.5 bg-black border-b border-white/[0.06]">
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

      {usePdfViewer ? (
        // PDF-only flow — custom viewer, pure black, fully branded
        <TreatmentPdfViewer
          treatmentId={treatment.id}
          title={treatment.title}
          pdfVersion={treatment.pdfR2Key ?? undefined}
        />
      ) : (
        // Legacy InDesign/URL fallback. We size the iframe so that the visible
        // 1.9:1 deck area is exactly the wrapper width × wrapper width / 1.9,
        // plus a generous chrome buffer (160px = 80 top + 80 bottom). Two black
        // mask strips at top and bottom hide Adobe's chrome AND any grey letter-
        // box bars Adobe might add above/below the deck inside its content area.
        // Side grey is impossible because the iframe width = deck width exactly.
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Scale: 0.825 on desktop (~10% bigger than the prior 0.75), 1.0 on
              mobile so the deck fills the phone viewport edge-to-edge. */}
          <style>{`
            .ff-iframe-deck { --ff-deck-scale: 0.825; }
            @media (max-width: 767px) {
              .ff-iframe-deck { --ff-deck-scale: 1; }
            }
          `}</style>
          <div
            className="ff-iframe-deck relative bg-black overflow-hidden"
            style={{
              width:
                "calc(min(100vw, (100vh - 216px) * 1.9) * var(--ff-deck-scale))",
              height:
                "calc(min(100vw, (100vh - 216px) * 1.9) * var(--ff-deck-scale) / 1.9 + 160px)",
              maxWidth: "100%",
            }}
          >
            <iframe
              src={treatment.previewUrl ?? undefined}
              title={treatment.title}
              allow="fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full border-0 block"
              style={{ backgroundColor: "#000" }}
            />
            {/* Top mask: 81px black strip covers Adobe's ~50px chrome + ~28px
                potential grey letterbox bar + 3px deck crop. */}
            <div
              className="absolute top-0 left-0 right-0 bg-black pointer-events-none"
              style={{ height: "81px" }}
            />
            {/* Bottom mask: same, on the bottom. */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-black pointer-events-none"
              style={{ height: "81px" }}
            />
          </div>

          <PdfDownloadLink
            href={pdfUrl}
            rel="noopener noreferrer"
            download={`${treatment.title}.pdf`}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-[10px] uppercase tracking-[0.18em] font-medium transition-all backdrop-blur-sm"
          >
            <>
              <Download size={11} />
              Download PDF
            </>
          </PdfDownloadLink>
        </div>
      )}
    </div>
    </TreatmentTracker>
  );
}
