"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, Thumbnail, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, LayoutGrid, Download, FileDown, X } from "lucide-react";
import { PdfDownloadLink } from "./pdf-download-link";
import { useTreatmentTracker } from "./treatment-tracker";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use the worker copy we placed in /public at build time
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
  treatmentId: string;
  title: string;
  pdfVersion?: string;
}

export function TreatmentPdfViewerClient({ treatmentId, title, pdfVersion }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracker = useTreatmentTracker();

  // Report the current page to the tracker whenever it changes
  useEffect(() => {
    tracker.notePage(pageNumber);
  }, [pageNumber, tracker]);

  // Track viewport + mobile breakpoint
  useEffect(() => {
    function onResize() {
      if (containerRef.current) {
        setViewportW(containerRef.current.offsetWidth);
        setViewportH(containerRef.current.offsetHeight);
      }
      setIsMobile(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [sidebarOpen]);

  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
  }, [numPages]);

  // Keyboard navigation (desktop)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Touch swipe — only single-touch, ignore swipes that started on a button or
  // link, and require horizontal-dominant motion. This avoids conflicts with
  // pinch-zoom (multi-touch) and tap-to-press button behavior.
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let valid = false;

    function isInteractive(target: EventTarget | null) {
      if (!(target instanceof Element)) return false;
      return !!target.closest("button, a, [role='button']");
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1 || isInteractive(e.target)) {
        valid = false;
        return;
      }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      valid = true;
    }

    function onTouchEnd(e: TouchEvent) {
      if (!valid) return;
      valid = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // Horizontal-dominant swipe of at least 50px
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) goNext();
      else goPrev();
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev]);

  // Compute rendered page size to fit the viewport while preserving aspect ratio.
  // Mobile gets near-zero side margins so the deck fills the phone screen.
  function renderSize() {
    if (!pageWidth || !pageHeight || !viewportW || !viewportH) {
      return { width: undefined, height: undefined };
    }
    const MARGIN_X = isMobile ? 8 : 100; // 4px each side on mobile
    const MARGIN_Y = isMobile ? 80 : 48; // mobile leaves room for bottom toolbar
    const availW = Math.max(280, viewportW - MARGIN_X);
    const availH = Math.max(240, viewportH - MARGIN_Y);
    const aspect = pageWidth / pageHeight;
    let w = availW;
    let h = w / aspect;
    if (h > availH) {
      h = availH;
      w = h * aspect;
    }
    return { width: w, height: h };
  }

  function downloadCurrentPage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const safeTitle = title.replace(/[^a-zA-Z0-9._-]/g, "_") || "treatment";
      a.download = `${safeTitle}-page-${pageNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("[Treatment] Page export failed", err);
    }
  }

  const size = renderSize();
  const versionParam = pdfVersion ? `?v=${encodeURIComponent(pdfVersion)}` : "";
  const fileUrl = `/api/treatments/${treatmentId}/pdf${versionParam}`;
  const safeTitle = title.replace(/[^a-zA-Z0-9._-]/g, "_") || "treatment";
  const downloadUrl = `/api/treatments/${treatmentId}/pdf?download=1${pdfVersion ? `&v=${encodeURIComponent(pdfVersion)}` : ""}`;

  return (
    <div className="flex-1 flex min-h-0 bg-black relative">
      <PdfDownloadLink
        href={downloadUrl}
        download={`${safeTitle}.pdf`}
        title="Download PDF"
        ariaLabel="Download PDF"
        className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/5 hover:bg-white/15 text-white/55 hover:text-white border border-white/[0.06] hover:border-white/[0.14] transition-all text-[10px] uppercase tracking-[0.14em]"
      >
        <FileDown size={12} />
        Download PDF
      </PdfDownloadLink>
      <Document
        file={fileUrl}
        onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
        loading={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white/40 text-[12px] uppercase tracking-[0.2em]">
              Loading…
            </div>
          </div>
        }
        error={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white/50 text-[13px]">
              Unable to preview PDF.
            </div>
          </div>
        }
        className="flex flex-1 min-h-0"
      >
        {/* Desktop sidebar: fixed-width column */}
        {sidebarOpen && numPages !== null && !isMobile && (
          <aside className="flex-shrink-0 w-[140px] h-full overflow-y-auto border-r border-white/[0.06] bg-black/80 py-4 px-2 space-y-2 scrollbar-none">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPageNumber(n)}
                className={`block w-full overflow-hidden rounded-sm transition-all ${
                  n === pageNumber
                    ? "ring-2 ring-white/80"
                    : "ring-1 ring-white/[0.08] hover:ring-white/30 opacity-60 hover:opacity-100"
                }`}
                title={`Page ${n}`}
              >
                <Thumbnail pageNumber={n} width={120} />
                <span className="block text-[9px] text-white/40 tabular-nums text-center py-1">
                  {n}
                </span>
              </button>
            ))}
          </aside>
        )}

        {/* Mobile sidebar: full-screen overlay sheet */}
        {sidebarOpen && numPages !== null && isMobile && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
              <span className="text-white/60 text-[11px] uppercase tracking-[0.18em]">
                {numPages} pages
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close page list"
                className="w-10 h-10 -mr-2 rounded-md text-white/70 flex items-center justify-center active:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setPageNumber(n);
                    setSidebarOpen(false);
                  }}
                  className={`block w-full overflow-hidden rounded-sm transition-all ${
                    n === pageNumber
                      ? "ring-2 ring-white/80"
                      : "ring-1 ring-white/[0.08] opacity-70 active:opacity-100"
                  }`}
                >
                  <Thumbnail pageNumber={n} width={140} />
                  <span className="block text-[10px] text-white/50 tabular-nums text-center py-1">
                    {n}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main viewer */}
        <div
          ref={containerRef}
          className="flex-1 relative flex items-center justify-center overflow-hidden select-none group/viewer"
        >
          {numPages !== null && (
            <div className="relative">
              <Page
                pageNumber={pageNumber}
                width={size.width}
                height={size.height}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                canvasRef={canvasRef}
                onLoadSuccess={(p) => {
                  setPageWidth(p.originalWidth);
                  setPageHeight(p.originalHeight);
                }}
                loading={null}
              />
              {/* Desktop only: hover-to-reveal save-page-as-PNG button */}
              {!isMobile && (
                <button
                  onClick={downloadCurrentPage}
                  title={`Save page ${pageNumber} as PNG`}
                  className="absolute top-2 right-2 opacity-0 group-hover/viewer:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white/80 hover:text-white text-[10px] uppercase tracking-[0.12em]"
                >
                  <Download size={11} />
                  Save
                </button>
              )}
            </div>
          )}

          {/* Desktop sidebar toggle — top-left of the viewer area */}
          {numPages !== null && !isMobile && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              title={sidebarOpen ? "Close pages" : "Show pages"}
              aria-label={sidebarOpen ? "Close page list" : "Show page list"}
              className="absolute top-3 left-3 w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center transition-all"
            >
              {sidebarOpen ? <X size={14} /> : <LayoutGrid size={13} />}
            </button>
          )}

          {/* Desktop prev arrow */}
          {numPages !== null && pageNumber > 1 && !isMobile && (
            <button
              onClick={goPrev}
              aria-label="Previous page"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Desktop next arrow */}
          {numPages !== null && pageNumber < numPages && !isMobile && (
            <button
              onClick={goNext}
              aria-label="Next page"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Desktop page counter */}
          {numPages !== null && !isMobile && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/35 tabular-nums tracking-[0.18em] uppercase">
              {pageNumber} / {numPages}
              {title ? " · " : ""}
              <span className="text-white/20">{title}</span>
            </div>
          )}

          {/* Mobile bottom toolbar — pages | prev | counter | next | save/download */}
          {numPages !== null && isMobile && (
            <div
              className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-2 px-3 pt-3 bg-gradient-to-t from-black via-black/85 to-transparent"
              style={{
                paddingBottom: "max(10px, env(safe-area-inset-bottom))",
              }}
            >
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Show all pages"
                className="w-11 h-11 rounded-md bg-white/10 text-white/85 flex items-center justify-center active:bg-white/25"
              >
                <LayoutGrid size={16} />
              </button>
              <div className="flex-1 flex items-center justify-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={pageNumber <= 1}
                  aria-label="Previous page"
                  className="w-12 h-12 rounded-full bg-white/10 text-white/85 flex items-center justify-center active:bg-white/25 disabled:opacity-25"
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="text-[12px] text-white/70 tabular-nums tracking-[0.15em] min-w-[58px] text-center">
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={pageNumber >= numPages}
                  aria-label="Next page"
                  className="w-12 h-12 rounded-full bg-white/10 text-white/85 flex items-center justify-center active:bg-white/25 disabled:opacity-25"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCurrentPage}
                  aria-label="Save page as PNG"
                  className="w-11 h-11 rounded-md bg-white/10 text-white/85 flex items-center justify-center active:bg-white/25"
                >
                  <Download size={16} />
                </button>
                <a
                  href={downloadUrl}
                  download={`${safeTitle}.pdf`}
                  aria-label="Download PDF"
                  className="w-11 h-11 rounded-md bg-white/10 text-white/85 flex items-center justify-center active:bg-white/25"
                >
                  <FileDown size={16} />
                </a>
              </div>
            </div>
          )}
        </div>
      </Document>
    </div>
  );
}
