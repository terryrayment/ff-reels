"use client";

import dynamic from "next/dynamic";

interface Props {
  treatmentId: string;
  title: string;
  pdfVersion?: string;
}

const TreatmentPdfViewerClient = dynamic(
  () =>
    import("./pdf-viewer-client").then(
      (mod) => mod.TreatmentPdfViewerClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-white/40 text-[12px] uppercase tracking-[0.2em]">
          Loading...
        </div>
      </div>
    ),
  },
);

export function TreatmentPdfViewer(props: Props) {
  return <TreatmentPdfViewerClient {...props} />;
}
