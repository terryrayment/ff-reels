"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Trash2, GripVertical, ArrowUpDown, Check } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  brand: string | null;
}

const BATCH_SIZE = 40;

// ─── View mode thumbnail ───────────────────────────────
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
    <div className="relative group/card">
      <button
        onClick={onClick}
        className="block w-full overflow-hidden rounded-xl group aspect-square"
      >
        <div className="relative bg-white/[0.03] w-full h-full">
          <img
            src={img.url}
            alt={img.caption || ""}
            className={`w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <div className="absolute inset-0 bg-white/[0.04] animate-pulse rounded-xl" />
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
      {editable && loaded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-md z-10"
          title="Remove photo"
        >
          <Trash2 size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}

// ─── Sortable thumbnail for reorder mode ───────────────
function SortableImage({ img }: { img: GalleryImage }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden ${
        isDragging ? "opacity-80 shadow-xl ring-2 ring-[#C45A2D]" : ""
      }`}
    >
      <img
        src={img.url}
        alt={img.caption || ""}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Drag handle overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <GripVertical size={14} className="text-white" />
        </div>
      </div>
      {img.brand && (
        <div className="absolute bottom-0 inset-x-0 px-1.5 pb-1 pt-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-[8px] font-semibold text-white/80 uppercase tracking-wide truncate">
            {img.brand}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main gallery component ────────────────────────────
export function PhotographerGallery({
  images: initialImages,
  editable = false,
  directorId,
}: {
  images: GalleryImage[];
  editable?: boolean;
  directorId?: string;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [reorderMode, setReorderMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const visibleImages = reorderMode ? images : images.slice(0, visibleCount);
  const hasMore = !reorderMode && visibleCount < images.length;

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    const res = await fetch(`/api/gallery-images/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function handleSaveOrder() {
    if (!directorId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/directors/${directorId}/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: images.map((img) => img.id) }),
      });
      if (!res.ok) {
        console.error("Reorder failed:", res.status, await res.text());
        return;
      }
      setReorderMode(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const activeImage = lightboxIdx !== null ? images[lightboxIdx] : null;

  return (
    <>
      {/* Toolbar */}
      {editable && directorId && (
        <div className="flex items-center gap-2 mb-4">
          {reorderMode ? (
            <>
              <button
                onClick={handleSaveOrder}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-[12px] font-medium hover:bg-[#333] transition-colors"
              >
                {saving ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                {saving ? "Saving..." : "Done"}
              </button>
              <button
                onClick={() => {
                  setImages(initialImages);
                  setReorderMode(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#E8E7E3] text-[12px] text-[#999] hover:text-[#666] hover:border-[#ccc] transition-all"
              >
                Cancel
              </button>
              <span className="text-[11px] text-[#bbb] ml-2">
                Drag photos to reorder
              </span>
            </>
          ) : (
            <button
              onClick={() => setReorderMode(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E7E3] text-[12px] text-[#999] hover:text-[#666] hover:border-[#ccc] transition-all"
            >
              <ArrowUpDown size={13} />
              Reorder
            </button>
          )}
        </div>
      )}

      {/* Reorder mode — uniform grid with drag */}
      {reorderMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {images.map((img) => (
                <SortableImage key={img.id} img={img} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <>
          {/* View mode — masonry */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
        </>
      )}

      {/* Lightbox — only in view mode */}
      {!reorderMode && activeImage && (
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
