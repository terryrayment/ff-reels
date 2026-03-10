"use client";

import { useState, useCallback } from "react";
import { Film, GripVertical, X, Plus } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { AddSpotsModal } from "./add-spots-modal";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SpotItem {
  id: string;
  projectId: string;
  title: string;
  brand: string | null;
  agency: string | null;
  year: number | null;
  duration: number | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
}

function SortableSpot({
  item,
  index,
  onRemove,
}: {
  item: SpotItem;
  index: number;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const thumbSrc = item.muxPlaybackId
    ? `https://image.mux.com/${item.muxPlaybackId}/thumbnail.jpg?width=192&height=112`
    : item.thumbnailUrl || null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 md:gap-5 py-3 ${
        isDragging
          ? "bg-white/90 shadow-lg rounded-lg px-2 -mx-2 opacity-95"
          : ""
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="text-[#ddd] hover:text-[#999] transition-colors cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      {/* Sequence number */}
      <span className="text-[11px] text-[#ccc] w-4 md:w-5 text-right tabular-nums flex-shrink-0">
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div className="w-16 h-10 md:w-24 md:h-14 bg-[#EEEDEA] overflow-hidden flex-shrink-0 rounded-sm">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={14} className="text-[#ccc]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#1A1A1A] truncate">{item.title}</p>
        <p className="text-[11px] text-[#999] truncate">
          {[item.brand, item.agency, item.year].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Duration */}
      <span className="text-[11px] text-[#ccc] tabular-nums flex-shrink-0">
        {formatDuration(item.duration)}
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-[#ddd] hover:text-red-400 transition-colors flex-shrink-0 p-1 -mr-1"
        title="Remove from reel"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ReelSpotList({
  reelId,
  directorId,
  items,
}: {
  reelId: string;
  directorId: string;
  items: SpotItem[];
}) {
  const [spots, setSpots] = useState(items);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleRemove = useCallback(
    (itemId: string) => {
      setSpots((prev) => {
        const updated = prev.filter((s) => s.id !== itemId);

        // Persist updated list to backend
        fetch(`/api/reels/${reelId}/items`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectIds: updated.map((s) => s.projectId),
          }),
        });

        return updated;
      });
    },
    [reelId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setSpots((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);

        // Persist new order to backend
        fetch(`/api/reels/${reelId}/items`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectIds: reordered.map((s) => s.projectId),
          }),
        });

        return reordered;
      });
    },
    [reelId]
  );

  const handleSpotsAdded = useCallback(
    (newSpots: SpotItem[]) => {
      setSpots((prev) => [...prev, ...newSpots]);
    },
    []
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={spots.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-[#E8E8E3]/60">
            {spots.map((item, index) => (
              <SortableSpot key={item.id} item={item} index={index} onRemove={handleRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Spots button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] text-[#999] hover:text-[#1A1A1A] border border-dashed border-[#E8E7E3] hover:border-[#ccc] transition-all duration-200 hover:bg-[#F7F6F3]/50"
      >
        <Plus size={14} />
        Add Spots
      </button>

      <AddSpotsModal
        reelId={reelId}
        directorId={directorId}
        existingProjectIds={spots.map((s) => s.projectId)}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSpotsAdded={handleSpotsAdded}
      />
    </>
  );
}
