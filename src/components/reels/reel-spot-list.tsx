"use client";

import { useState, useCallback } from "react";
import { Film, GripVertical } from "lucide-react";
import { formatDuration } from "@/lib/utils";
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
}: {
  item: SpotItem;
  index: number;
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
      <span className="text-[11px] text-[#ccc] tabular-nums">
        {formatDuration(item.duration)}
      </span>
    </div>
  );
}

export function ReelSpotList({
  reelId,
  items,
}: {
  reelId: string;
  items: SpotItem[];
}) {
  const [spots, setSpots] = useState(items);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  return (
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
            <SortableSpot key={item.id} item={item} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
