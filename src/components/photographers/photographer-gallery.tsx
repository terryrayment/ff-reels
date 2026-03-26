"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  brand: string | null;
}

const BATCH_SIZE = 40;

function GalleryThumbnail({
  img,
  onClick,
  editable,
  onDelete,
}: {
  img: GalleryImage;
  onClick: () => void;
  editable?: boolean;
  onDelete?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative break-inside-avoid group/card">
      <button
        onClick={onClick}
        className="block w-full overflow-hidden rounded-xl group"
      >
        <div className="relative bg-white/[0.03]">
          <img
            src={img.url}
            alt={img.caption || ""}
            className={`w-full object-cover group-hover:scale-[1.02] transition-all duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <div className="aspect-[3/4] w-full bg-white/[0.04] animate-pulse rounded-xl" />
          )}
          {loaded && (
            <>
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
            </>
          )}
        </div>
      </button>
      {/* Delete button for admins */}
      {editable && loaded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
          title="Remove photo"
        >
          <Trash2 size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}

export function PhotographerGallery({
  images: initialImages,
  editable = false,
}: {
  images: GalleryImage[];
  editable?: boolean;
}) {
  const [images, setImages] = useState(initialImages);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  const prev = useCallback(() => {
    setLightboxIdx((cur) =>
      cur === null ? null : cur > 0 ? cur - 1 : images.length - 1
    );
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIdx((cur) =>
      cur === null ? null : cur < images.length - 1 ? cur + 1 : 0
    );
  }, [images.length]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/gallery-images/${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  const activeImage = lightboxIdx !== null ? images[lightboxIdx] : null;

  return (
    <>
      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {visibleImages.map((img, i) => (
          <GalleryThumbnail
            key={img.id}
            img={img}
            onClick={() => openLightbox(i)}
            editable={editable}
            onDelete={() => handleDelete(img.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}
            className="px-6 py-2.5 rounded-xl border border-[#E8E7E3] hover:border-[#ccc] text-[12px] text-[#999] hover:text-[#666] transition-all"
          >
            Load more ({images.length - visibleCount} remaining)
          </button>
        </div>
      )}

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
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          )}

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

            {/* Delete in lightbox for admins */}
            {editable && (
              <button
                onClick={() => {
                  handleDelete(activeImage.id);
                  closeLightbox();
                }}
                className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-[11px] text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/50 tabular-nums">
            {(lightboxIdx ?? 0) + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
