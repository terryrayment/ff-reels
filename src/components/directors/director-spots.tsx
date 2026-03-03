"use client";

import { useState, useMemo } from "react";
import { Film, Clock, AlertCircle, ArrowUpDown, Upload } from "lucide-react";
import { formatDuration } from "@/lib/utils";

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

type SortKey = "alpha" | "newest" | "rep" | "views";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "alpha", label: "A–Z" },
  { key: "newest", label: "Newest" },
  { key: "rep", label: "Most used" },
  { key: "views", label: "Most viewed" },
];

export function DirectorSpots({ projects }: { projects: ProjectWithStats[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const sorted = useMemo(() => {
    const arr = [...projects];
    switch (sortBy) {
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
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-md border border-dashed border-[#E8E8E3]">
        <Upload size={24} className="text-[#ccc] mb-3" />
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
      <div className="flex items-center gap-1 mb-4">
        <ArrowUpDown size={12} className="text-[#999] mr-1" />
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-2.5 py-1 text-[12px] rounded transition-colors ${
              sortBy === opt.key
                ? "bg-[#1A1A1A] text-white font-medium"
                : "text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Spots grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((project) => (
          <div key={project.id} className="group">
            <div className="relative aspect-video bg-[#EEEDEA] rounded-md overflow-hidden">
              {project.muxPlaybackId ? (
                <img
                  src={`https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              ) : project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={20} className="text-[#ccc]" />
                </div>
              )}

              {project.muxStatus === "preparing" && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-amber-300">
                  <Clock size={9} /> Processing
                </div>
              )}
              {project.muxStatus === "errored" && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-red-300">
                  <AlertCircle size={9} /> Error
                </div>
              )}

              {project.duration && (
                <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-white">
                  {formatDuration(project.duration)}
                </span>
              )}
            </div>

            <div className="mt-1.5">
              <p className="text-[13px] font-medium text-[#1A1A1A] truncate">
                {project.title}
              </p>
              <p className="text-[11px] text-[#999] truncate">
                {[project.brand, project.agency, project.year]
                  .filter(Boolean)
                  .join(" · ") || "\u00A0"}
              </p>
              {(project.reelUsageCount > 0 || project.viewCount > 0) && (
                <div className="flex gap-2 mt-1 text-[10px] text-[#bbb]">
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
    </div>
  );
}
