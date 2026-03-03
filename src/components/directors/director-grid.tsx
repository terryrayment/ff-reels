"use client";

import Link from "next/link";
import { Film } from "lucide-react";

interface DirectorProject {
  id: string;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {directors.map((director) => {
        const hero = director.projects[0];
        const heroSrc = hero?.muxPlaybackId
          ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
          : hero?.thumbnailUrl || null;

        return (
          <Link
            key={director.id}
            href={`/directors/${director.id}`}
            className="group block bg-white border border-[#E8E8E3] overflow-hidden hover:shadow-sm hover:border-[#ddd] transition-all"
          >
            {/* Hero thumbnail */}
            <div className="aspect-[16/10] bg-[#EEEDEA] relative overflow-hidden">
              {heroSrc ? (
                <img
                  src={heroSrc}
                  alt={director.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={28} className="text-[#ddd]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#1A1A1A] uppercase tracking-wide group-hover:text-black transition-colors">
                  {director.name}
                </h2>
                {!director.isActive && (
                  <span className="text-[10px] text-[#999] bg-[#F0F0EC] px-1.5 py-0.5 rounded-sm">Off-roster</span>
                )}
              </div>
              <p className="text-[12px] text-[#999] mt-0.5">
                {director._count.projects} spot{director._count.projects !== 1 ? "s" : ""}
                {director._count.reels > 0 && ` · ${director._count.reels} reel${director._count.reels !== 1 ? "s" : ""}`}
              </p>
              {director.categories.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {director.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] text-[#999] bg-[#F7F6F3] px-1.5 py-0.5 rounded-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
