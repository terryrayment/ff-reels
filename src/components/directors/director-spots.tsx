"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Film, Clock, AlertCircle, Upload, Image as ImageIcon, Pencil, Camera, Check, CheckSquare, Eye, EyeOff, X } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { HoverScrubThumbnail } from "@/components/ui/hover-scrub-thumbnail";
import { ThumbnailPickerModal } from "@/components/spots/thumbnail-picker-modal";

interface ProjectWithStats {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  category: string | null;
  year: number | null;
  muxPlaybackId: string | null;
  muxStatus: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  aspectRatio: string | null;
  isPublished: boolean;
  reelUsageCount: number;
  viewCount: number;
  createdAt: string;
}

type SortKey = "brand" | "alpha" | "newest" | "rep" | "views";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "alpha", label: "A\u2013Z" },
  { key: "newest", label: "Newest" },
  { key: "rep", label: "Most Used" },
  { key: "views", label: "Most Viewed" },
];

interface DirectorSpotsProps {
  projects: ProjectWithStats[];
  directorId?: string;
  heroProjectId?: string | null;
  readOnly?: boolean;
  canEditNames?: boolean;
}

export function DirectorSpots({ projects, directorId, heroProjectId, readOnly, canEditNames }: DirectorSpotsProps) {
  const [sortBy, setSortBy] = useState<SortKey>("brand");
  const [settingHero, setSettingHero] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ projectId: string; x: number; y: number } | null>(null);
  const [thumbnailPickerProject, setThumbnailPickerProject] = useState<ProjectWithStats | null>(null);
  const [savingThumbnail, setSavingThumbnail] = useState(false);
  const [localThumbnailUrls, setLocalThumbnailUrls] = useState<Record<string, string | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  // Bulk selection
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkBrand, setBulkBrand] = useState("");
  const [bulkAgency, setBulkAgency] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkYear, setBulkYear] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus the input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (projectId: string, currentTitle: string) => {
    setEditingId(projectId);
    setEditValue(currentTitle);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveTitle = async (projectId: string) => {
    const trimmed = editValue.trim();
    const original = projects.find((p) => p.id === projectId)?.title;
    if (!trimmed || trimmed === original) {
      cancelEditing();
      return;
    }
    setSavingId(projectId);
    setEditingId(null);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      router.refresh();
    } finally {
      setSavingId(null);
    }
  };

  const setAsHero = async (projectId: string) => {
    setContextMenu(null);
    setSettingHero(projectId);
    await fetch(`/api/directors/${directorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroProjectId: projectId, heroThumbnailUrl: null }),
    });
    router.refresh();
    setSettingHero(null);
  };

  const saveThumbnail = async (projectId: string, thumbnailUrl: string | null) => {
    setSavingThumbnail(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnailUrl }),
      });
      // Optimistically update local state so the grid reflects the new thumbnail immediately
      setLocalThumbnailUrls((prev) => ({ ...prev, [projectId]: thumbnailUrl }));
      setThumbnailPickerProject(null);
      router.refresh();
    } finally {
      setSavingThumbnail(false);
    }
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    setContextMenu({ projectId, x: e.clientX, y: e.clientY });
  }, []);

  // ── Bulk selection ──────────────────────────────────────

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setBulkEditOpen(false);
  };

  const toggleSelected = (projectId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const bulkUpdate = async (data: Record<string, unknown>) => {
    setBulkSaving(true);
    try {
      const res = await fetch("/api/projects/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: Array.from(selectedIds), data }),
      });
      if (res.ok) {
        router.refresh();
        exitSelectMode();
      }
    } finally {
      setBulkSaving(false);
    }
  };

  const handleBulkEditSave = () => {
    const data: Record<string, unknown> = {};
    if (bulkBrand.trim()) data.brand = bulkBrand.trim();
    if (bulkAgency.trim()) data.agency = bulkAgency.trim();
    if (bulkCategory.trim()) data.category = bulkCategory.trim();
    if (bulkYear.trim()) data.year = parseInt(bulkYear);
    if (Object.keys(data).length === 0) {
      setBulkEditOpen(false);
      return;
    }
    bulkUpdate(data);
  };

  // Close context menu on click-away or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  const sorted = useMemo(() => {
    const arr = [...projects];
    switch (sortBy) {
      case "brand":
        return arr.sort((a, b) => (a.brand || "zzz").localeCompare(b.brand || "zzz"));
      case "alpha":
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "newest":
        return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "rep":
        return arr.sort((a, b) => b.reelUsageCount - a.reelUsageCount);
      case "views":
        return arr.sort((a, b) => b.viewCount - a.viewCount);
      default:
        return arr;
    }
  }, [projects, sortBy]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Upload size={20} className="text-[#ccc] mb-4" />
        <p className="text-[13px] text-[#666]">No spots uploaded yet</p>
        <p className="text-[12px] text-[#999] mt-1">
          Upload video files to start building this director&apos;s library.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {sortOptions.map((opt, i) => (
            <span key={opt.key} className="flex items-center gap-4">
              <button
                onClick={() => setSortBy(opt.key)}
                className={`text-[12px] transition-colors ${
                  sortBy === opt.key
                    ? "text-[#1A1A1A] font-medium"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                {opt.label}
              </button>
              {i < sortOptions.length - 1 && (
                <span className="text-[#E0E0E0] text-[11px] select-none">|</span>
              )}
            </span>
          ))}
        </div>

        {/* Bulk select toggle */}
        {!readOnly && (
          <button
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className={`flex items-center gap-1.5 text-[12px] transition-colors ${
              selectMode
                ? "text-[#1A1A1A] font-medium"
                : "text-[#999] hover:text-[#666]"
            }`}
          >
            <CheckSquare size={13} />
            {selectMode ? "Done" : "Select"}
          </button>
        )}
      </div>

      {/* Spots grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sorted.map((project) => (
          <div key={project.id} className="group">
            <div
              className={`relative aspect-video bg-[#EEEDEA] overflow-hidden rounded-[3px] ${
                selectMode ? "cursor-pointer" : ""
              } ${
                selectMode && selectedIds.has(project.id)
                  ? "ring-2 ring-[#1A1A1A] ring-offset-2"
                  : ""
              }`}
              {...(selectMode
                ? { onClick: () => toggleSelected(project.id) }
                : !readOnly && directorId
                  ? { onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, project.id) }
                  : {})}
            >
              {/* Selection checkbox */}
              {selectMode && (
                <div
                  className={`absolute top-2 right-2 z-10 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    selectedIds.has(project.id)
                      ? "bg-[#1A1A1A] border-[#1A1A1A]"
                      : "bg-white/90 border-[#ccc]"
                  }`}
                >
                  {selectedIds.has(project.id) && (
                    <Check size={13} className="text-white" strokeWidth={3} />
                  )}
                </div>
              )}
              {project.muxPlaybackId ? (
                <HoverScrubThumbnail
                  muxPlaybackId={project.muxPlaybackId}
                  duration={project.duration}
                  alt={project.title}
                  className="w-full h-full"
                  staticClassName="opacity-95 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                  staticUrlOverride={
                    project.id in localThumbnailUrls
                      ? localThumbnailUrls[project.id]
                      : project.thumbnailUrl
                  }
                />
              ) : project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={20} className="text-[#ccc]" />
                </div>
              )}

              {project.muxStatus === "preparing" && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 text-[10px] text-amber-300">
                  <Clock size={9} /> Processing
                </div>
              )}
              {project.muxStatus === "errored" && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 text-[10px] text-red-300">
                  <AlertCircle size={9} /> Error
                </div>
              )}
              {!readOnly && !project.isPublished && project.muxStatus === "ready" && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-amber-500/90 px-1.5 py-0.5 rounded text-[10px] text-white">
                  <EyeOff size={9} /> Hidden
                </div>
              )}

              {project.duration && (
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 text-white/90">
                  {formatDuration(project.duration)}
                </span>
              )}

              {settingHero === project.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[11px] text-white/90">Setting cover...</span>
                </div>
              )}

              {/* Thumbnail picker button — shown on hover when editable */}
              {!readOnly && !selectMode && directorId && project.muxPlaybackId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailPickerProject(project);
                  }}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 hover:bg-black/80 px-2 py-1 rounded text-white text-[10px] backdrop-blur-sm"
                  title="Set thumbnail"
                >
                  <Camera size={10} />
                  Thumbnail
                </button>
              )}
            </div>

            <div className="mt-2">
              {project.brand && (
                <p className="text-[13px] font-medium text-[#1A1A1A] truncate">
                  {project.brand}
                </p>
              )}

              {/* Inline title editing for directors */}
              {editingId === project.id ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle(project.id);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    onBlur={() => saveTitle(project.id)}
                    className="flex-1 min-w-0 text-[12px] text-[#333] bg-white border border-[#ccc] rounded px-1.5 py-0.5 outline-none focus:border-[#999] transition-colors"
                  />
                </div>
              ) : (
                <div className={`flex items-center gap-1.5 group/title ${project.brand ? "mt-0.5" : ""}`}>
                  <p className={`text-[12px] truncate ${savingId === project.id ? "text-[#aaa]" : "text-[#777]"}`}>
                    {savingId === project.id ? "Saving..." : project.title}
                  </p>
                  {canEditNames && savingId !== project.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(project.id, project.title);
                      }}
                      className="opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0 p-0.5 hover:bg-[#F0EFE9] rounded"
                      title="Rename spot"
                    >
                      <Pencil size={10} className="text-[#999]" />
                    </button>
                  )}
                </div>
              )}

              {(project.agency || project.year) && (
                <p className="text-[11px] text-[#aaa] truncate mt-0.5">
                  {[project.agency, project.year]
                    .filter(Boolean)
                    .join(" \u00b7 ")}
                </p>
              )}
              {(project.reelUsageCount > 0 || project.viewCount > 0) && (
                <div className="flex gap-3 mt-1 text-[10px] text-[#bbb]">
                  {project.reelUsageCount > 0 && (
                    <span>{project.reelUsageCount} reel use{project.reelUsageCount !== 1 ? "s" : ""}</span>
                  )}
                  {project.viewCount > 0 && (
                    <span>{project.viewCount} view{project.viewCount !== 1 ? "s" : ""}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bulk actions bar — sticky at bottom in select mode */}
      {selectMode && (
        <div className="fixed bottom-4 left-4 right-4 md:left-[calc(220px+2rem)] md:right-8 z-40">
          <div className="mx-auto max-w-3xl flex flex-wrap items-center gap-2 md:gap-3 rounded-xl bg-[#1A1A1A] px-4 py-3 shadow-2xl">
            <span className="text-[12px] text-white/90 font-medium tabular-nums">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() =>
                setSelectedIds(
                  selectedIds.size === sorted.length
                    ? new Set()
                    : new Set(sorted.map((p) => p.id))
                )
              }
              className="text-[11px] text-white/50 hover:text-white/90 transition-colors"
            >
              {selectedIds.size === sorted.length ? "Clear" : "Select all"}
            </button>

            <div className="flex-1" />

            <button
              onClick={() => bulkUpdate({ isPublished: true })}
              disabled={bulkSaving || selectedIds.size === 0}
              className="flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] text-white transition-colors disabled:opacity-40"
            >
              <Eye size={11} /> Publish
            </button>
            <button
              onClick={() => bulkUpdate({ isPublished: false })}
              disabled={bulkSaving || selectedIds.size === 0}
              className="flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] text-white transition-colors disabled:opacity-40"
            >
              <EyeOff size={11} /> Hide
            </button>
            <button
              onClick={() => {
                setBulkBrand("");
                setBulkAgency("");
                setBulkCategory("");
                setBulkYear("");
                setBulkEditOpen(true);
              }}
              disabled={bulkSaving || selectedIds.size === 0}
              className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[11px] font-medium text-[#1A1A1A] hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              <Pencil size={11} /> Edit details
            </button>
            <button
              onClick={exitSelectMode}
              disabled={bulkSaving}
              className="p-1.5 text-white/50 hover:text-white transition-colors"
              aria-label="Exit select mode"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk edit modal */}
      {bulkEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !bulkSaving) setBulkEditOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="text-[14px] font-semibold text-[#111]">
              Edit {selectedIds.size} spot{selectedIds.size !== 1 ? "s" : ""}
            </h3>
            <p className="mt-1 text-[11px] text-[#999]">
              Filled fields apply to every selected spot. Blank fields are left unchanged.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={bulkBrand}
                onChange={(e) => setBulkBrand(e.target.value)}
                placeholder="Brand (e.g. Nike)"
                className="w-full rounded-md border border-[#D9D8D2] px-3 py-2 text-[13px] text-[#111] placeholder:text-[#AAA9A2] outline-none focus:border-[#111] transition-colors"
              />
              <input
                type="text"
                value={bulkAgency}
                onChange={(e) => setBulkAgency(e.target.value)}
                placeholder="Agency"
                className="w-full rounded-md border border-[#D9D8D2] px-3 py-2 text-[13px] text-[#111] placeholder:text-[#AAA9A2] outline-none focus:border-[#111] transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full rounded-md border border-[#D9D8D2] px-3 py-2 text-[13px] text-[#111] placeholder:text-[#AAA9A2] outline-none focus:border-[#111] transition-colors"
                />
                <input
                  type="number"
                  value={bulkYear}
                  onChange={(e) => setBulkYear(e.target.value)}
                  placeholder="Year"
                  className="w-full rounded-md border border-[#D9D8D2] px-3 py-2 text-[13px] text-[#111] placeholder:text-[#AAA9A2] outline-none focus:border-[#111] transition-colors"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setBulkEditOpen(false)}
                disabled={bulkSaving}
                className="px-3 py-2 text-[12px] text-[#999] hover:text-[#111] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEditSave}
                disabled={bulkSaving}
                className="flex items-center gap-1.5 rounded-md bg-[#111] px-4 py-2 text-[12px] font-medium text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                {bulkSaving && (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Apply to {selectedIds.size}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail picker modal */}
      {thumbnailPickerProject && (
        <ThumbnailPickerModal
          project={thumbnailPickerProject}
          onClose={() => setThumbnailPickerProject(null)}
          onSave={saveThumbnail}
          saving={savingThumbnail}
        />
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-md shadow-lg border border-[#E8E8E3] py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setAsHero(contextMenu.projectId)}
            disabled={settingHero !== null || contextMenu.projectId === heroProjectId}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] text-[#333] hover:bg-[#F5F4F0] transition-colors disabled:opacity-40 disabled:cursor-default"
          >
            <ImageIcon size={13} className="text-[#999]" />
            {contextMenu.projectId === heroProjectId ? "Already cover" : "Set as cover"}
          </button>
          {sorted.find((p) => p.id === contextMenu.projectId)?.muxPlaybackId && (
            <button
              onClick={() => {
                const p = sorted.find((proj) => proj.id === contextMenu.projectId);
                if (p) setThumbnailPickerProject(p);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] text-[#333] hover:bg-[#F5F4F0] transition-colors"
            >
              <Camera size={13} className="text-[#999]" />
              Set thumbnail
            </button>
          )}
        </div>
      )}
    </div>
  );
}
