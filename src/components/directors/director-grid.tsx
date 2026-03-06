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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {directors.map((director) => {
        const hero = director.projects[0];
        const heroSrc = hero?.muxPlaybackId
          ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=640&height=400&fit_mode=smartcrop&time=3`
          : hero?.thumbnailUrl || null;

        return (
          <Link
            key={director.id}
            href={`/directors/${director.id}`}
            className="group block"
          >
            {/* Hero thumbnail */}
            <div className="aspect-[16/10] bg-[#EEEDEA] overflow-hidden rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-400">
              {heroSrc ? (
                <img
                  src={heroSrc}
                  alt={director.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={24} className="text-[#ddd]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-2.5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[13px] font-medium tracking-tight-2 text-[#1A1A1A] group-hover:text-black transition-colors">
                  {director.name}
                </h2>
                {!director.isActive && (
                  <span className="text-[9px] text-[#bbb] uppercase tracking-wider">
                    Off-roster
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#bbb] mt-0.5">
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
