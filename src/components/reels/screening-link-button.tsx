"use client";

import { ExternalLink } from "lucide-react";

export function ScreeningLinkButton({ token }: { token: string }) {
  return (
    <a
      href={`/s/${token}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E0DDD8] text-[#bbb] hover:text-[#1A1A1A] hover:border-[#1A1A1A]/20 hover:bg-white/50 transition-all"
      title="Open screening link"
    >
      <ExternalLink size={12} />
    </a>
  );
}
