"use client";

import { ExternalLink } from "lucide-react";

/**
 * Opens the screening link in a new tab. This renders inside reel-row
 * <Link> wrappers, so it must NOT be an <a> — the HTML parser splits
 * nested anchors, which desyncs server and client DOM and crashes
 * hydration for the whole list in production.
 */
export function ScreeningLinkButton({ token }: { token: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`/s/${token}`, "_blank", "noopener,noreferrer");
      }}
      className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E0DDD8] text-[#bbb] hover:text-[#1A1A1A] hover:border-[#1A1A1A]/20 hover:bg-white/50 transition-all"
      title="Open screening link"
    >
      <ExternalLink size={12} />
    </button>
  );
}
