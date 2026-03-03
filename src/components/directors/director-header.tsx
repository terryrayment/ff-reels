"use client";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

interface DirectorHeaderProps {
  director: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    statement: string | null;
    categories: string[];
    isActive: boolean;
    _count: { projects: number; reels: number };
  };
}

export function DirectorHeader({ director }: DirectorHeaderProps) {
  return (
    <div>
      <Link
        href="/directors"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] hover:text-[#1A1A1A] transition-colors mb-8 block"
      >
        <ArrowLeft size={11} />
        Directors
      </Link>

      <div className="flex items-start justify-between">
        <div className="max-w-2xl">
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
              {director.name}
            </h1>
            {!director.isActive && (
              <span className="text-[10px] uppercase tracking-wider text-[#999]">
                Off-roster
              </span>
            )}
          </div>

          {director.bio && (
            <p className="text-[14px] text-[#666] mt-4 leading-relaxed max-w-2xl">
              {director.bio}
            </p>
          )}

          <div className="flex gap-8 mt-6">
            <div>
              <p className="text-2xl font-light tracking-tight-2 text-[#1A1A1A]">
                {director._count.projects}
              </p>
              <p className="text-[10px] text-[#999] mt-0.5 uppercase tracking-wider">
                Spots
              </p>
            </div>
            <div>
              <p className="text-2xl font-light tracking-tight-2 text-[#1A1A1A]">
                {director._count.reels}
              </p>
              <p className="text-[10px] text-[#999] mt-0.5 uppercase tracking-wider">
                Reels
              </p>
            </div>
          </div>
        </div>

        <button className="p-2 text-[#ccc] hover:text-[#1A1A1A] transition-colors">
          <Pencil size={14} />
        </button>
      </div>
    </div>
  );
}
