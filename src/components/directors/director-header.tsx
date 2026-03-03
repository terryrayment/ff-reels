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
      <Link
        href="/directors"
        className="inline-flex items-center gap-1.5 text-[12px] text-[#999] hover:text-[#1A1A1A] transition-colors mb-5"
      >
        <ArrowLeft size={12} />
        Directors
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">{director.name}</h1>
            {!director.isActive && (
              <Badge variant="warning">Off-roster</Badge>
            )}
          </div>

          {director.categories.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {director.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[11px] text-[#999] bg-[#F0F0EC] px-2 py-0.5 rounded-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {director.bio && (
            <p className="text-[13px] text-[#666] mt-3 max-w-2xl leading-relaxed">
              {director.bio}
            </p>
          )}
        </div>

        <button className="p-2 text-[#ccc] hover:text-[#1A1A1A] hover:bg-[#F7F6F3] rounded-sm transition-colors">
          <Pencil size={15} />
        </button>
      </div>

      <div className="flex gap-6 mt-4 pt-4 border-t border-[#E8E8E3]">
        <div>
          <p className="text-xl font-semibold text-[#1A1A1A]">{director._count.projects}</p>
          <p className="text-[11px] text-[#999] mt-0.5 uppercase tracking-wider font-semibold">Spots</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-[#1A1A1A]">{director._count.reels}</p>
          <p className="text-[11px] text-[#999] mt-0.5 uppercase tracking-wider font-semibold">Reels</p>
        </div>
      </div>
    </div>
  );
}
