"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

/**
 * Duplicates a reel (spots, metadata, fresh screening link) and navigates
 * to the copy. The copy is owned by the current user, so REPs can use any
 * reel in the library as a starting point.
 */
export function DuplicateReelButton({ reelId }: { reelId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleDuplicate() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/reels/${reelId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const copy = await res.json();
        router.push(`/reels/${copy.id}`);
        router.refresh();
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      title="Duplicate this reel — the copy is yours to edit and send"
      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-[#DEDDD7] bg-white text-[11px] font-semibold uppercase tracking-[0.12em] text-[#111] hover:border-[#999] hover:bg-[#FAFAF7] transition-colors disabled:opacity-60"
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
      ) : (
        <Copy size={12} className="text-[#777]" />
      )}
      {error ? "Try again" : "Duplicate"}
    </button>
  );
}
