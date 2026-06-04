"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film, Send, Eye, Flame, Search, Copy, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { ScreeningLinkButton } from "@/components/reels/screening-link-button";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ReelWithStats = {
  id: string;
  title: string;
  reelType: string;
  curatorialNote: string | null;
  updatedAt: string | Date;
  director: { id: string; name: string };
  items: {
    id: string;
    project: { muxPlaybackId: string | null; title: string };
  }[];
  screeningLinks: {
    id: string;
    token: string;
    isActive: boolean;
    _count: { views: number };
  }[];
  _count: { items: number; screeningLinks: number };
  totalViews: number;
  activeLink: { token: string } | null;
  lastViewed: string | Date | null;
  activity: "hot" | "recent" | "stale" | "dead" | "none";
  isHotLead: boolean;
};

export function ReelsList({ reels }: { reels: ReelWithStats[] }) {
  const [search, setSearch] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReelWithStats | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  const filtered = search.trim()
    ? reels.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.director.name.toLowerCase().includes(q) ||
          (r.curatorialNote && r.curatorialNote.toLowerCase().includes(q))
        );
      })
    : reels;

  async function handleDuplicate(e: React.MouseEvent, reelId: string) {
    e.preventDefault();
    e.stopPropagation();
    setDuplicatingId(reelId);
    try {
      const res = await fetch(`/api/reels/${reelId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDuplicatingId(null);
    }
  }

  function handleDeletePrompt(e: React.MouseEvent, reel: ReelWithStats) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteError("");
    setDeleteTarget(reel);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/reels/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete reel");
      }

      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete reel"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-5 md:mb-6">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb]"
        />
        <input
          type="text"
          placeholder="Search reels by title, director, or note..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="quartr-input w-full pl-9 pr-4"
        />
      </div>

      {/* Count */}
      <p className="section-header mb-4">
        {filtered.length} reel{filtered.length !== 1 ? "s" : ""} found
        {search.trim() && filtered.length !== reels.length && (
          <span>
            {" "}
            of {reels.length} total
          </span>
        )}
      </p>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((reel) => (
            <div key={reel.id} className="relative group/row">
              <Link
                href={`/reels/${reel.id}`}
                className="content-card flex items-center gap-3 md:gap-5 p-3 md:p-4 group"
              >
                {/* Activity indicator dot */}
                <div className="flex-shrink-0 hidden md:block">
                  {reel.activity === "hot" ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  ) : reel.activity === "recent" ? (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                  ) : reel.activity === "stale" ? (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#ddd]" />
                  ) : reel.activity === "dead" ? (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-300" />
                  ) : (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#eee]" />
                  )}
                </div>

                {/* Thumbnail strip */}
                <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                  {reel.items.slice(0, 3).map((item, i) => (
                    <div
                      key={item.id}
                      className={`w-14 h-9 md:w-20 md:h-12 bg-[#EEEDEA]/60 overflow-hidden rounded-md ${
                        i >= 2 ? "hidden md:block" : ""
                      }`}
                    >
                      {item.project.muxPlaybackId ? (
                        <img
                          src={`https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=160&height=96&fit_mode=smartcrop`}
                          alt={item.project.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={10} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <h3 className="text-[14px] md:text-[16px] font-semibold text-[#111] group-hover:text-black transition-colors truncate">
                      {reel.title}
                    </h3>
                    {reel.isHotLead && (
                      <span
                        title="Hot lead — high engagement"
                        className="flex-shrink-0"
                      >
                        <Flame size={13} className="text-amber-500" />
                      </span>
                    )}
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#DEDDD7] text-[9px] text-[#777] uppercase tracking-[0.1em] flex-shrink-0">
                      <span className="w-1 h-1 rounded-full bg-[#ccc]" />
                      {reel.reelType.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-[12px] text-[#777] mt-0.5">
                    {reel.director.name} · {reel._count.items} spot
                    {reel._count.items !== 1 ? "s" : ""}
                    <span className="md:hidden">
                      {" "}
                      · {timeAgo(reel.updatedAt)}
                    </span>
                  </p>
                  {reel.curatorialNote && (
                    <p className="hidden md:block text-[12px] text-[#999] mt-1.5 truncate">
                      &ldquo;{reel.curatorialNote}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right side — engagement stats + actions */}
                <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                  {/* View count badge */}
                  <div
                    className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] tabular-nums ${
                      reel.totalViews > 0
                        ? "border-[#DEDDD7] bg-[#FAFAF7] text-[#111] font-semibold"
                        : "border-transparent text-[#ccc]"
                    }`}
                  >
                    <Eye
                      size={11}
                      className={
                        reel.totalViews > 0 ? "text-[#999]" : "text-[#ddd]"
                      }
                    />
                    {reel.totalViews}
                  </div>

                  {/* Last viewed — desktop */}
                  {reel.lastViewed && (
                    <span className="hidden md:block text-[10px] text-[#bbb] whitespace-nowrap">
                      {timeAgo(reel.lastViewed)}
                    </span>
                  )}

                  {/* Screening link icon */}
                  {reel.activeLink && (
                    <ScreeningLinkButton token={reel.activeLink.token} />
                  )}

                  {/* Send count — desktop */}
                  <div className="hidden md:flex items-center gap-1 text-[11px] text-[#999]">
                    <Send size={10} />
                    {reel._count.screeningLinks}
                  </div>

                  {/* Mobile: compact stats */}
                  <div className="md:hidden flex items-center gap-2.5">
                    {reel.totalViews > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-[#999] font-medium">
                        <Eye size={9} />
                        {reel.totalViews}
                      </span>
                    )}
                    {reel._count.screeningLinks > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-[#bbb]">
                        <Send size={9} />
                        {reel._count.screeningLinks}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Row actions — appear on hover */}
              <div className="absolute right-2 top-2 md:right-3 md:top-3 opacity-100 md:opacity-0 md:group-hover/row:opacity-100 md:focus-within:opacity-100 transition-opacity z-10 flex items-center gap-1.5">
                <button
                  onClick={(e) => handleDuplicate(e, reel.id)}
                  disabled={duplicatingId === reel.id}
                  title="Duplicate reel"
                  className="w-8 h-8 rounded-md bg-white border border-[#DEDDD7] hover:border-[#999] hover:bg-[#FAFAF7] flex items-center justify-center disabled:opacity-60"
                >
                  {duplicatingId === reel.id ? (
                    <span className="w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Copy size={12} className="text-[#999]" />
                  )}
                </button>
                <button
                  onClick={(e) => handleDeletePrompt(e, reel)}
                  disabled={deletingId === reel.id}
                  title="Delete reel"
                  className="w-8 h-8 rounded-md bg-white border border-red-100 hover:border-red-300 hover:bg-red-50 flex items-center justify-center disabled:opacity-60"
                >
                  {deletingId === reel.id ? (
                    <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={12} className="text-red-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : search.trim() ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={18} className="text-[#ccc] mb-3" />
          <p className="text-[13px] text-[#999]">
            No reels matching &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center">
          <Film size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-semibold text-[#111]">No reels yet</h3>
          <p className="text-[12px] text-[#999] mt-1 max-w-sm">
            Build your first reel by selecting spots from a director&apos;s
            library.
          </p>
          <Link
            href="/reels/build"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#111] text-white text-[12px] font-semibold uppercase tracking-[0.12em] active:bg-[#333] transition-colors"
          >
            Build Your First Reel
          </Link>
        </div>
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          if (!deletingId) setDeleteTarget(null);
        }}
        title="Delete reel"
        description="This cannot be undone."
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-100 bg-red-50/60 px-4 py-3">
              <p className="text-[13px] font-medium text-[#111]">
                Delete &ldquo;{deleteTarget.title}&rdquo;?
              </p>
              <p className="mt-1 text-[12px] text-[#777]">
                This removes the reel, its screening links, and viewing analytics.
              </p>
            </div>

            {deleteError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-600">
                {deleteError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={deletingId === deleteTarget.id}
                onClick={handleDelete}
              >
                <Trash2 size={13} />
                Delete reel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
