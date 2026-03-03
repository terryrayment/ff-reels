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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
      {directors.map((director) => {
        const hero = director.projects[0];
        const heroSrc = hero?.muxPlaybackId
          ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
          : hero?.thumbnailUrl || null;

        return (
          <Link
            key={director.id}
            href={`/directors/${director.id}`}
            className="group block"
          >
            {/* Hero thumbnail */}
            <div className="aspect-[16/10] bg-[#EEEDEA] overflow-hidden">
              {heroSrc ? (
                <img
                  src={heroSrc}
                  alt={director.name}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500 ease-out"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={28} className="text-[#ddd]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-lg tracking-tight-2 text-[#1A1A1A] group-hover:text-black transition-colors">
                  {director.name}
                </h2>
                {!director.isActive && (
                  <span className="text-[10px] text-[#999] uppercase tracking-wider">
                    Off-roster
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#999] mt-0.5">
                {director._count.projects} spot{director._count.projects !== 1 ? "s" : ""}
                {director._count.reels > 0 && ` · ${director._count.reels} reel${director._count.reels !== 1 ? "s" : ""}`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
