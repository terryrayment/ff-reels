"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Compact pill showing the F&F-branded share URL with a copy-to-clipboard button.
 * Click the URL text to open in new tab; click the icon to copy.
 */
export function CopyTreatmentLinkButton({
  token,
  shareDomain,
}: {
  token: string;
  shareDomain?: string;
}) {
  const [copied, setCopied] = useState(false);
  const base = shareDomain || "https://reels.friendsandfamily.tv";
  const shareUrl = `${base}/t/${token}`;
  // Display the URL without the protocol for a cleaner look
  const displayUrl = shareUrl.replace(/^https?:\/\//, "");

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F6F3] border border-[#E8E7E3] hover:border-[#ccc] transition-colors group/link">
      <a
        href={`/t/${token}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[11px] text-[#666] hover:text-[#1A1A1A] font-mono truncate max-w-[260px] transition-colors"
        title="Open branded treatment link"
      >
        {displayUrl}
      </a>
      <button
        onClick={handleCopy}
        className="text-[#bbb] hover:text-[#1A1A1A] transition-colors flex-shrink-0 p-0.5"
        title="Copy link"
      >
        {copied ? (
          <Check size={11} className="text-emerald-600" />
        ) : (
          <Copy size={11} />
        )}
      </button>
    </div>
  );
}
