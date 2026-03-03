"use client";

import Link from "next/link";
import { Film, FolderOpen } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface DirectorProject {
  id: string;
  title: string;
  brand: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  category: string | null;
}

interface DirectorWithProjects {
  id: string;
  name: string;
  slug: string;
  categories: string[];
  isActive: boolean;
  projects: DirectorProject[];
  _count: { projects: number; reels: number };
}

interface DirectorGridProps {
  directors: DirectorWithProjects[];
}

export function DirectorGrid({ directors }: DirectorGridProps) {
  return (
    <div className="space-y-10">
      {directors.map((director) => (
        <Link
          key={director.id}
          href={`/directors/${director.id}`}
          className="block group"
        >
          {/* Director name + meta */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-light text-white/90 group-hover:text-white transition-colors">
                {director.name}
              </h2>
              {!director.isActive && (
                <span className="text-xs text-white/30">Off-roster</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <FolderOpen size={12} />
                {director._count.projects} spot{director._count.projects !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Film size={12} />
                {director._count.reels} reel{director._count.reels !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Thumbnail strip — media-forward */}
          {director.projects.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {director.projects.map((project) => (
                <div
                  key={project.id}
                  className="relative aspect-video bg-white/5 rounded-lg overflow-hidden group/thumb"
                >
                  {project.muxPlaybackId ? (
                    <img
                      src={`https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={20} className="text-white/10" />
                    </div>
                  )}

                  {/* Overlay info — only on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2.5 right-2.5">
                      <p className="text-xs font-medium text-white truncate">
                        {project.title}
                      </p>
                      {project.brand && (
                        <p className="text-[10px] text-white/60 truncate">
                          {project.brand}
                        </p>
                      )}
                    </div>
                    {project.duration && (
                      <span className="absolute top-2 right-2 text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-white/80">
                        {formatDuration(project.duration)}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Fill remaining slots with empties if < 4 projects */}
              {Array.from({ length: Math.max(0, 4 - director.projects.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-video bg-white/[0.02] rounded-lg border border-dashed border-white/5"
                />
              ))}
            </div>
          ) : (
            <div className="h-32 bg-white/[0.02] rounded-lg border border-dashed border-white/5 flex items-center justify-center">
              <p className="text-xs text-white/20">No spots uploaded yet</p>
            </div>
          )}

          {/* Category tags */}
          {director.categories.length > 0 && (
            <div className="flex gap-2 mt-2.5">
              {director.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] text-white/30 uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
