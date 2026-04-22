"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, Thumbnail, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, LayoutGrid, Download, X } from "lucide-react";
import { useTreatmentTracker } from "./treatment-tracker";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use the worker copy we placed in /public at build time
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
  treatmentId: string;
  title: string;
}

export function TreatmentPdfViewer({ treatmentId, title }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracker = useTreatmentTracker();

  // Report the current page to the tracker whenever it changes
  useEffect(() => {
    tracker.notePage(pageNumber);
  }, [pageNumber, tracker]);

  // Track viewport
  useEffect(() => {
    function onResize() {
      if (containerRef.current) {
        setViewportW(containerRef.current.offsetWidth);
        setViewportH(containerRef.current.offsetHeight);
      }
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sidebarOpen]);

  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
  }, [numPages]);

  // Keyboard navigation
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

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
    }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev]);

  // Compute rendered page size to fit the viewport while preserving aspect ratio
  function renderSize() {
    if (!pageWidth || !pageHeight || !viewportW || !viewportH) {
      return { width: undefined, height: undefined };
    }
    const MARGIN_X = 100; // 50px each side
    const MARGIN_Y = 48; // 24px each side
    const availW = Math.max(320, viewportW - MARGIN_X);
    const availH = Math.max(240, viewportH - MARGIN_Y);
    const aspect = pageWidth / pageHeight;
    // Fit inside both dimensions
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
  const fileUrl = `/api/treatments/${treatmentId}/pdf`;

  return (
    <div className="flex-1 flex min-h-0 bg-black">
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
            <div className="text-white/50 text-[13px]">Unable to load PDF.</div>
          </div>
        }
        className="flex flex-1 min-h-0"
      >
        {/* Sidebar: page thumbnails */}
        {sidebarOpen && numPages !== null && (
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
              {/* Per-page PNG export — hover-only */}
              <button
                onClick={downloadCurrentPage}
                title={`Save page ${pageNumber} as PNG`}
                className="absolute top-2 right-2 opacity-0 group-hover/viewer:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white/80 hover:text-white text-[10px] uppercase tracking-[0.12em]"
              >
                <Download size={11} />
                Save
              </button>
            </div>
          )}

          {/* Sidebar toggle — top-left of the viewer area */}
          {numPages !== null && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              title={sidebarOpen ? "Close pages" : "Show pages"}
              aria-label={sidebarOpen ? "Close page list" : "Show page list"}
              className="absolute top-3 left-3 w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center transition-all"
            >
              {sidebarOpen ? <X size={14} /> : <LayoutGrid size={13} />}
            </button>
          )}

          {/* Prev arrow */}
          {numPages !== null && pageNumber > 1 && (
            <button
              onClick={goPrev}
              aria-label="Previous page"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next arrow */}
          {numPages !== null && pageNumber < numPages && (
            <button
              onClick={goNext}
              aria-label="Next page"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Page counter */}
          {numPages !== null && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/35 tabular-nums tracking-[0.18em] uppercase">
              {pageNumber} / {numPages}
              {title ? " · " : ""}
              <span className="text-white/20">{title}</span>
            </div>
          )}
        </div>
      </Document>
    </div>
  );
}
