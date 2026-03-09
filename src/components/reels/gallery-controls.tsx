"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Download, RefreshCw, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: string;
  projectTitle: string;
  projectBrand: string | null;
  timeOffset: number;
  aiScore: number | null;
  width: number;
  height: number;
  sortOrder: number;
  imageUrl: string;
  thumbnailUrl: string;
}

interface GalleryControlsProps {
  reelId: string;
  initialStatus: string | null;
}

export function GalleryControls({ reelId, initialStatus }: GalleryControlsProps) {
  const [status, setStatus] = useState(initialStatus || "none");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch gallery images
  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch(`/api/reels/${reelId}/gallery`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status || "none");
      setImages(data.images || []);
    } catch {
      // silently fail
    }
  }, [reelId]);

  // Initial fetch if status is ready
  useEffect(() => {
    if (initialStatus === "ready") {
      fetchGallery();
    }
  }, [initialStatus, fetchGallery]);

  // Poll while generating
  useEffect(() => {
    if (status !== "generating") return;
    const interval = setInterval(fetchGallery, 3000);
    return () => clearInterval(interval);
  }, [status, fetchGallery]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStatus("generating");

    try {
      const res = await fetch(`/api/reels/${reelId}/gallery/generate`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setStatus(data.status || "ready");
      // Fetch full gallery with URLs
      await fetchGallery();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setImages([]);
    await handleGenerate();
  };

  // Status: none or failed → Generate button
  if (status === "none" || status === "failed" || (!status && images.length === 0)) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] text-[#999] uppercase tracking-wider">
            Gallery
          </h2>
        </div>
        <div className="py-10 text-center rounded-2xl border border-dashed border-[#E8E8E3]">
          <Sparkles size={20} className="mx-auto text-[#ccc] mb-3" />
          <p className="text-[13px] text-[#999] mb-1">
            AI-powered best frames
          </p>
          <p className="text-[11px] text-[#bbb] mb-5 max-w-xs mx-auto">
            Automatically selects the most visually striking frames from each spot and upscales to 4K
          </p>
          {error && (
            <p className="text-[12px] text-red-400 mb-3">{error}</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.12em] rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-[#000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={12} />
                Generate Gallery
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Status: generating → Spinner
  if (status === "generating") {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] text-[#999] uppercase tracking-wider">
            Gallery
          </h2>
        </div>
        <div className="py-12 text-center rounded-2xl border border-[#E8E8E3]/60 bg-[#FAFAF9]">
          <Loader2 size={24} className="mx-auto text-[#999] mb-3 animate-spin" />
          <p className="text-[13px] text-[#666]">
            Generating gallery...
          </p>
          <p className="text-[11px] text-[#bbb] mt-1">
            Scoring frames with AI, upscaling to 4K
          </p>
        </div>
      </div>
    );
  }

  // Status: ready → Grid with download
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider">
          Gallery ({images.length} frames)
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#999] hover:text-[#666] transition-colors rounded-lg hover:bg-[#F5F5F0]"
            title="Regenerate gallery"
          >
            <RefreshCw size={10} />
            Regenerate
          </button>
          <a
            href={`/api/reels/${reelId}/gallery/download`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] rounded-lg bg-[#1A1A1A] text-white hover:bg-[#000] transition-colors font-medium"
          >
            <Download size={10} />
            Download All
          </a>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-video bg-[#EEEDEA] overflow-hidden rounded-lg hover:ring-2 hover:ring-[#1A1A1A]/10 transition-all"
          >
            <img
              src={img.thumbnailUrl}
              alt={`${img.projectTitle} frame`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 md:bg-black/0 md:group-hover:bg-black/30 transition-colors flex items-end justify-between p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <span className="text-[9px] text-white/80 truncate">
                {img.projectTitle}
              </span>
              <a
                href={img.imageUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded bg-white/20 hover:bg-white/40 transition-colors"
                title="Download this frame"
              >
                <Download size={10} className="text-white" />
              </a>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white/40 hover:text-white/80 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Nav: Previous */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors z-10"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Nav: Next */}
          {lightboxIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors z-10"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].imageUrl}
              alt={`${images[lightboxIndex].projectTitle} frame`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
              <div>
                <p className="text-[12px] text-white/80">
                  {images[lightboxIndex].projectTitle}
                  {images[lightboxIndex].projectBrand && (
                    <span className="text-white/40"> · {images[lightboxIndex].projectBrand}</span>
                  )}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {images[lightboxIndex].width} × {images[lightboxIndex].height}
                  {images[lightboxIndex].aiScore && ` · Score: ${images[lightboxIndex].aiScore.toFixed(1)}`}
                </p>
              </div>
              <a
                href={images[lightboxIndex].imageUrl}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[10px] text-white/60 hover:text-white/80 uppercase tracking-wider"
              >
                <Download size={10} />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
