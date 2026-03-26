"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  brand: string | null;
}

export function PhotographerGallery({ images }: { images: GalleryImage[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  function openLightbox(idx: number) {
    setLightboxIdx(idx);
  }

  function closeLightbox() {
    setLightboxIdx(null);
  }

  function prev() {
    if (lightboxIdx === null) return;
    setLightboxIdx(lightboxIdx > 0 ? lightboxIdx - 1 : images.length - 1);
  }

  function next() {
    if (lightboxIdx === null) return;
    setLightboxIdx(lightboxIdx < images.length - 1 ? lightboxIdx + 1 : 0);
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  const activeImage = lightboxIdx !== null ? images[lightboxIdx] : null;

  return (
    <>
      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => openLightbox(i)}
            className="block w-full overflow-hidden rounded-xl group break-inside-avoid"
          >
            <div className="relative">
              <img
                src={img.url}
                alt={img.caption || ""}
                className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              {img.brand && (
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] font-semibold text-white/90 uppercase tracking-wide">
                    {img.brand}
                  </p>
                  {img.caption && (
                    <p className="text-[10px] text-white/60 mt-0.5 truncate">
                      {img.caption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          ref={(el) => el?.focus()}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.url}
              alt={activeImage.caption || ""}
              className="max-w-full max-h-[85vh] object-contain"
            />
            {(activeImage.brand || activeImage.caption) && (
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 bg-gradient-to-t from-black/60 to-transparent">
                {activeImage.brand && (
                  <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wide">
                    {activeImage.brand}
                  </p>
                )}
                {activeImage.caption && (
                  <p className="text-[12px] text-white/70 mt-0.5">
                    {activeImage.caption}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/50 tabular-nums">
            {(lightboxIdx ?? 0) + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
