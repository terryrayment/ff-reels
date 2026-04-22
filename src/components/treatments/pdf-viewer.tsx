"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, []);

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

  const size = renderSize();

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-black flex items-center justify-center relative overflow-hidden select-none"
    >
      <Document
        file={`/api/treatments/${treatmentId}/pdf`}
        onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
        loading={
          <div className="text-white/40 text-[12px] uppercase tracking-[0.2em]">
            Loading…
          </div>
        }
        error={
          <div className="text-white/50 text-[13px]">Unable to load PDF.</div>
        }
      >
        {numPages !== null && (
          <Page
            pageNumber={pageNumber}
            width={size.width}
            height={size.height}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onLoadSuccess={(p) => {
              setPageWidth(p.originalWidth);
              setPageHeight(p.originalHeight);
            }}
            loading={null}
          />
        )}
      </Document>

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
          {pageNumber} / {numPages}{title ? " · " : ""}
          <span className="text-white/20">{title}</span>
        </div>
      )}
    </div>
  );
}
