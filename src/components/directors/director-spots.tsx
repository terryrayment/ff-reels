"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Film, Clock, AlertCircle, Upload, Star } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { HoverScrubThumbnail } from "@/components/ui/hover-scrub-thumbnail";

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
  directorId: string;
  heroProjectId: string | null;
}

export function DirectorSpots({ projects, directorId, heroProjectId }: DirectorSpotsProps) {
  const [sortBy, setSortBy] = useState<SortKey>("brand");
  const [settingHero, setSettingHero] = useState<string | null>(null);
  const router = useRouter();

  const setAsHero = async (projectId: string) => {
    setSettingHero(projectId);
    await fetch(`/api/directors/${directorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroProjectId: projectId, heroThumbnailUrl: null }),
    });
    router.refresh();
    setSettingHero(null);
  };

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
      <div className="flex items-center gap-4 mb-6">
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

      {/* Spots grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sorted.map((project) => (
          <div key={project.id} className="group">
            <div className="relative aspect-video bg-[#EEEDEA] overflow-hidden rounded-[3px]">
              {project.muxPlaybackId ? (
                <HoverScrubThumbnail
                  muxPlaybackId={project.muxPlaybackId}
                  duration={project.duration}
                  alt={project.title}
                  className="w-full h-full"
                  staticClassName="opacity-95 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300 ease-out"
                />
              ) : project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300 ease-out"
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

              {project.duration && (
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 text-white/90">
                  {formatDuration(project.duration)}
                </span>
              )}

              {/* Hero badge */}
              {heroProjectId === project.id && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded-sm">
                  <Star size={9} className="text-amber-400 fill-amber-400" />
                  <span className="text-[9px] text-white/90 uppercase tracking-wider font-medium">Cover</span>
                </div>
              )}

              {/* Set as Cover overlay */}
              {heroProjectId !== project.id && project.muxStatus === "ready" && (
                <button
                  onClick={() => setAsHero(project.id)}
                  disabled={settingHero !== null}
                  className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50"
                >
                  <Star size={9} className="text-white/80" />
                  <span className="text-[9px] text-white/90 uppercase tracking-wider font-medium">
                    {settingHero === project.id ? "Setting..." : "Set Cover"}
                  </span>
                </button>
              )}
            </div>

            <div className="mt-2">
              {project.brand && (
                <p className="text-[13px] font-medium text-[#1A1A1A] truncate">
                  {project.brand}
                </p>
              )}
              <p className={`text-[12px] text-[#777] truncate ${project.brand ? "mt-0.5" : ""}`}>
                {project.title}
              </p>
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
    </div>
  );
}
