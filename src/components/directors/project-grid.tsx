"use client";

import { Film, Clock, AlertCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface Project {
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
}

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {projects.map((project) => (
        <div key={project.id} className="group cursor-pointer">
          {/* Thumbnail — dominant visual */}
          <div className="relative aspect-video bg-white/[0.03] rounded-lg overflow-hidden">
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
                <Film size={24} className="text-white/10" />
              </div>
            )}

            {/* Status indicator */}
            {project.muxStatus === "preparing" && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-amber-400">
                <Clock size={10} />
                Processing
              </div>
            )}
            {project.muxStatus === "errored" && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-red-400">
                <AlertCircle size={10} />
                Error
              </div>
            )}
            {project.muxStatus === "ready" && !project.isPublished && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white/50">
                Draft
              </div>
            )}

            {/* Duration badge */}
            {project.duration && (
              <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white/80">
                {formatDuration(project.duration)}
              </span>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Info — minimal, below the media */}
          <div className="mt-2 px-0.5">
            <p className="text-sm font-medium text-white/80 group-hover:text-white truncate transition-colors">
              {project.title}
            </p>
            <p className="text-xs text-white/30 truncate mt-0.5">
              {[project.brand, project.agency, project.year]
                .filter(Boolean)
                .join(" · ") || "No details"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
