"use client";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      {/* Back link */}
      <Link
        href="/directors"
        className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
      >
        <ArrowLeft size={12} />
        Directors
      </Link>

      {/* Name + status */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-light tracking-tight">{director.name}</h1>
            {!director.isActive && (
              <Badge variant="warning">Off-roster</Badge>
            )}
          </div>

          {/* Categories */}
          {director.categories.length > 0 && (
            <div className="flex gap-2 mt-2">
              {director.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs text-white/30 uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {director.bio && (
            <p className="text-sm text-white/50 mt-3 max-w-2xl leading-relaxed">
              {director.bio}
            </p>
          )}
        </div>

        <button className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Pencil size={16} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex gap-6 mt-5 pt-5 border-t border-white/5">
        <div>
          <p className="text-2xl font-light">{director._count.projects}</p>
          <p className="text-xs text-white/30 mt-0.5">Spots</p>
        </div>
        <div>
          <p className="text-2xl font-light">{director._count.reels}</p>
          <p className="text-xs text-white/30 mt-0.5">Reels</p>
        </div>
      </div>
    </div>
  );
}
