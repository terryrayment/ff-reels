"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Film, Search, Plus, X, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import MuxPlayer from "@mux/mux-player-react";

interface Project {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  year: number | null;
  category: string | null;
  duration: number | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
}

interface AddSpotsModalProps {
  reelId: string;
  directorId: string;
  existingProjectIds: string[];
  open: boolean;
  onClose: () => void;
  onSpotsAdded: (newProjects: {
    id: string;
    projectId: string;
    title: string;
    brand: string | null;
    agency: string | null;
    year: number | null;
    duration: number | null;
    muxPlaybackId: string | null;
    thumbnailUrl: string | null;
  }[]) => void;
}

export function AddSpotsModal({
  reelId,
  directorId,
  existingProjectIds,
  open,
  onClose,
  onSpotsAdded,
}: AddSpotsModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch director's projects when modal opens
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIds([]);
      setPreviewProject(null);
      return;
    }

    setLoading(true);
    fetch(`/api/directors/${directorId}/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => {
        setLoading(false);
      });

    // Focus search after a brief delay
    setTimeout(() => searchRef.current?.focus(), 100);
  }, [open, directorId]);

  // Available projects = published ones not already in the reel
  const availableProjects = useMemo(() => {
    return projects.filter(
      (p) => p.isPublished && !existingProjectIds.includes(p.id)
    );
  }, [projects, existingProjectIds]);

  // Filter by search query
  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return availableProjects;
    return availableProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.agency && p.agency.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [availableProjects, search]);

  const toggleProject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePreview = useCallback((e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setPreviewProject(project);
  }, []);

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);

    // Build the full list: existing + newly selected (in order)
    const allProjectIds = [...existingProjectIds, ...selectedIds];

    try {
      const res = await fetch(`/api/reels/${reelId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: allProjectIds }),
      });

      if (res.ok) {
        const reel = await res.json();
        // Map the new items (the ones we just added)
        const newItems = reel.items
          .filter((item: { projectId: string }) =>
            selectedIds.includes(item.projectId)
          )
          .map((item: {
            id: string;
            projectId: string;
            project: {
              title: string;
              brand: string | null;
              agency: string | null;
              year: number | null;
              duration: number | null;
              muxPlaybackId: string | null;
              thumbnailUrl: string | null;
            };
          }) => ({
            id: item.id,
            projectId: item.projectId,
            title: item.project.title,
            brand: item.project.brand,
            agency: item.project.agency,
            year: item.project.year,
            duration: item.project.duration,
            muxPlaybackId: item.project.muxPlaybackId,
            thumbnailUrl: item.project.thumbnailUrl,
          }));

        onSpotsAdded(newItems);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape (close preview first if open)
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewProject) {
          setPreviewProject(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, previewProject]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={previewProject ? () => setPreviewProject(null) : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Video Preview Panel — slides down from top when a spot is being previewed */}
        {previewProject && previewProject.muxPlaybackId && (
          <div className="border-b border-[#E8E7E3]/60 bg-black rounded-t-xl overflow-hidden">
            <div className="relative">
              <MuxPlayer
                playbackId={previewProject.muxPlaybackId}
                streamType="on-demand"
                autoPlay
                metadata={{
                  video_title: previewProject.title,
                }}
                primaryColor="#ffffff"
                secondaryColor="#000000"
                accentColor="#666666"
                style={{ width: "100%", aspectRatio: "16/9" }}
              />
              <button
                type="button"
                onClick={() => setPreviewProject(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10"
                title="Close preview"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#111]">
              <div className="min-w-0">
                <p className="text-[13px] text-white font-medium truncate">
                  {previewProject.title}
                </p>
                <p className="text-[11px] text-white/50 truncate">
                  {[previewProject.brand, previewProject.agency, previewProject.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleProject(previewProject.id);
                  setPreviewProject(null);
                }}
                className={`flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  selectedIds.includes(previewProject.id)
                    ? "bg-white/20 text-white"
                    : "bg-white text-[#1A1A1A] hover:bg-white/90"
                }`}
              >
                {selectedIds.includes(previewProject.id) ? (
                  <span className="flex items-center gap-1.5">
                    <Check size={12} /> Selected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Plus size={12} /> Add to Reel
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E7E3]/60">
          <div>
            <h2 className="text-[15px] font-medium text-[#1A1A1A]">
              Add Spots
            </h2>
            <p className="text-[11px] text-[#999] mt-0.5">
              {availableProjects.length} available spot
              {availableProjects.length !== 1 ? "s" : ""}
              {selectedIds.length > 0 && (
                <span className="text-[#1A1A1A] font-medium">
                  {" "}· {selectedIds.length} selected
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#ccc] hover:text-[#999] transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-[#E8E7E3]/40">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]"
            />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, brand, agency…"
              className="w-full pl-9 pr-4 py-2 bg-[#F7F6F3]/80 rounded-lg border border-[#E8E7E3]/50 text-[13px] text-[#1A1A1A] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
            />
          </div>
        </div>

        {/* Project grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-5 w-5 border-2 border-[#ccc] border-t-[#1A1A1A] rounded-full mx-auto" />
              <p className="text-[12px] text-[#999] mt-3">Loading spots…</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <Film size={20} className="text-[#ddd] mx-auto mb-2" />
              <p className="text-[13px] text-[#999]">
                {search
                  ? `No spots matching "${search}"`
                  : "All spots are already in this reel"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProjects.map((project) => {
                const isSelected = selectedIds.includes(project.id);
                const thumbSrc = project.muxPlaybackId
                  ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
                  : project.thumbnailUrl || null;

                return (
                  <div
                    key={project.id}
                    className={`text-left overflow-hidden rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-[#1A1A1A] shadow-sm"
                        : "border border-[#E8E7E3]/60 hover:border-[#ccc] hover:shadow-sm"
                    }`}
                  >
                    <div className="aspect-video bg-[#EEEDEA] relative overflow-hidden group">
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={16} className="text-[#ccc]" />
                        </div>
                      )}

                      {/* Hover overlay with preview + select buttons */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {project.muxPlaybackId && (
                          <button
                            type="button"
                            onClick={(e) => handlePreview(e, project)}
                            className="bg-white/90 hover:bg-white text-[#1A1A1A] rounded-full p-2 transition-colors shadow-lg"
                            title="Preview spot"
                          >
                            <Play size={14} className="ml-0.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleProject(project.id)}
                          className={`rounded-full p-2 transition-colors shadow-lg ${
                            isSelected
                              ? "bg-[#1A1A1A] text-white"
                              : "bg-white/90 hover:bg-white text-[#1A1A1A]"
                          }`}
                          title={isSelected ? "Remove from selection" : "Add to selection"}
                        >
                          {isSelected ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                      </div>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-sm bg-[#1A1A1A] flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      {project.duration && (
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 px-1 py-0.5 rounded-sm text-white/90 group-hover:opacity-0 transition-opacity">
                          {formatDuration(project.duration)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProject(project.id)}
                      className="w-full p-2.5 bg-white text-left"
                    >
                      <p className="text-[12px] font-medium text-[#1A1A1A] truncate">
                        {project.title}
                      </p>
                      <p className="text-[10px] text-[#999] truncate mt-0.5">
                        {[project.brand, project.agency, project.year]
                          .filter(Boolean)
                          .join(" · ") || "\u2014"}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E7E3]/60 bg-[#FAFAF8] rounded-b-xl">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={selectedIds.length === 0}
            loading={saving}
          >
            <Plus size={14} />
            Add {selectedIds.length > 0 ? selectedIds.length : ""} Spot
            {selectedIds.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
