"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { Film, Camera, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
  heroThumbnailUrl: string | null;
  projects: DirectorProject[];
  _count: { projects: number; reels: number };
}

interface DirectorGridProps {
  directors: DirectorWithProjects[];
}

interface SpotOption {
  id: string;
  title: string;
  brand: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
}

function getThumbSrc(
  spot: { muxPlaybackId: string | null; thumbnailUrl: string | null },
  width = 320,
) {
  if (spot.muxPlaybackId) {
    return `https://image.mux.com/${spot.muxPlaybackId}/thumbnail.jpg?width=${width}&time=3`;
  }
  return spot.thumbnailUrl || null;
}

/* ── Spot picker modal ──────────────────────────────────────── */

function ThumbnailPickerModal({
  director,
  currentHeroUrl,
  onClose,
}: {
  director: DirectorWithProjects;
  currentHeroUrl: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [spots, setSpots] = useState<SpotOption[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState(3);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentHeroUrl);
  const [previewError, setPreviewError] = useState(false);

  // Fetch all spots on mount
  useEffect(() => {
    fetch(`/api/directors/${director.id}`)
      .then((r) => r.json())
      .then((data) => {
        const allSpots = (data.projects || [])
          .filter((p: SpotOption) => p.muxPlaybackId)
          .map((p: SpotOption) => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            muxPlaybackId: p.muxPlaybackId,
            thumbnailUrl: p.thumbnailUrl,
            duration: p.duration,
          }));
        setSpots(allSpots);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [director.id]);

  const handleSelectSpot = useCallback(
    (spot: SpotOption) => {
      setSelectedSpotId(spot.id);
      setSelectedTime(3);
      if (spot.muxPlaybackId) {
        setPreviewError(false);
        setPreviewUrl(
          `https://image.mux.com/${spot.muxPlaybackId}/thumbnail.jpg?width=880&time=3`
        );
      }
    },
    []
  );

  const handleTimeChange = useCallback(
    (time: number) => {
      setSelectedTime(time);
      const spot = spots?.find((s) => s.id === selectedSpotId);
      if (spot?.muxPlaybackId) {
        setPreviewError(false);
        setPreviewUrl(
          `https://image.mux.com/${spot.muxPlaybackId}/thumbnail.jpg?width=880&time=${time}`
        );
      }
    },
    [spots, selectedSpotId]
  );

  const [saveError, setSaveError] = useState(false);

  const handleSave = useCallback(async () => {
    if (!selectedSpotId) return;
    setSaving(true);
    setSaveError(false);
    const spot = spots?.find((s) => s.id === selectedSpotId);
    // Save time-only URL so each display context can add its own sizing
    const saveUrl = spot?.muxPlaybackId
      ? `https://image.mux.com/${spot.muxPlaybackId}/thumbnail.jpg?time=${selectedTime.toFixed(2)}`
      : previewUrl;
    try {
      const res = await fetch(`/api/directors/${director.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroProjectId: selectedSpotId,
          heroThumbnailUrl: saveUrl,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh();
      onClose();
    } catch {
      setSaving(false);
      setSaveError(true);
    }
  }, [director.id, selectedSpotId, selectedTime, spots, previewUrl, router, onClose]);

  const handleReset = useCallback(async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch(`/api/directors/${director.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroProjectId: null,
          heroThumbnailUrl: null,
        }),
      });
      if (!res.ok) throw new Error("Reset failed");
      router.refresh();
      onClose();
    } catch {
      setSaving(false);
      setSaveError(true);
    }
  }, [director.id, router, onClose]);

  const selectedSpot = spots?.find((s) => s.id === selectedSpotId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[680px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#eee]">
          <h3 className="text-[14px] font-medium text-[#1A1A1A]">
            Choose thumbnail for {director.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#f5f5f5] text-[#999] hover:text-[#666] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="px-5 pt-4">
          <div className="aspect-[16/10] bg-[#EEEDEA] rounded-lg overflow-hidden">
            {previewUrl && !previewError ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  // Retry once with a cache-bust param
                  if (!previewError) {
                    setPreviewError(true);
                    setTimeout(() => {
                      setPreviewError(false);
                      setPreviewUrl(previewUrl + "&_r=1");
                    }, 1000);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#ccc]">
                <Film size={32} />
              </div>
            )}
          </div>

          {/* Time scrubber — shown when a spot is selected */}
          {selectedSpot?.muxPlaybackId && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] text-[#999] w-8 text-right tabular-nums">
                {Math.floor(selectedTime)}s
              </span>
              <input
                type="range"
                min={0}
                max={selectedSpot.duration || 30}
                step={0.5}
                value={selectedTime}
                onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-[#1A1A1A]"
              />
              <span className="text-[10px] text-[#999] w-8 tabular-nums">
                {selectedSpot.duration
                  ? `${Math.floor(selectedSpot.duration)}s`
                  : ""}
              </span>
            </div>
          )}
        </div>

        {/* Spot grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[10px] text-[#999] uppercase tracking-wider mb-2.5">
            Select a spot
          </p>
          {loading ? (
            <div className="py-8 text-center text-[12px] text-[#bbb]">
              Loading spots…
            </div>
          ) : !spots?.length ? (
            <div className="py-8 text-center text-[12px] text-[#bbb]">
              No spots with video found
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {spots.map((spot) => {
                const thumb = getThumbSrc(spot, 240);
                const isSelected = spot.id === selectedSpotId;
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSelectSpot(spot)}
                    className={`group/spot relative rounded-md overflow-hidden transition-all ${
                      isSelected
                        ? "ring-2 ring-[#1A1A1A] ring-offset-1"
                        : "hover:ring-1 hover:ring-[#ccc]"
                    }`}
                  >
                    <div className="aspect-[16/10] bg-[#f5f5f5]">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={spot.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={14} className="text-[#ddd]" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                      <p className="text-[8px] text-white/90 truncate leading-tight">
                        {spot.brand ? `${spot.brand} · ` : ""}
                        {spot.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {saveError && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-md bg-red-50 text-red-600 text-[11px]">
            Failed to save. Please try again.
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#eee] bg-[#fafafa]">
          <button
            onClick={handleReset}
            disabled={saving}
            className="text-[11px] text-[#999] hover:text-[#666] transition-colors disabled:opacity-50"
          >
            Reset to default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-[11px] rounded-md border border-[#ddd] text-[#666] hover:bg-[#f5f5f5] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedSpotId || saving}
              className="px-3.5 py-1.5 text-[11px] rounded-md bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Director card ──────────────────────────────────────────── */

function DirectorCard({ director }: { director: DirectorWithProjects }) {
  const [showPicker, setShowPicker] = useState(false);

  const hero = director.projects[0];
  const heroSrc = director.heroThumbnailUrl
    ? (director.heroThumbnailUrl.includes("width=")
        ? director.heroThumbnailUrl
        : `${director.heroThumbnailUrl}${director.heroThumbnailUrl.includes("?") ? "&" : "?"}width=640`)
    : hero?.muxPlaybackId
      ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=640&time=3`
      : hero?.thumbnailUrl || null;

  return (
    <>
      <div className="group relative block">
        {/* Camera button — top right on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPicker(true);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          title="Change thumbnail"
        >
          <Camera size={14} />
        </button>

        <Link href={`/directors/${director.id}`} className="block">
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
              {director._count.projects} spot
              {director._count.projects !== 1 ? "s" : ""}
              {director._count.reels > 0 &&
                ` · ${director._count.reels} reel${director._count.reels !== 1 ? "s" : ""}`}
            </p>
          </div>
        </Link>
      </div>

      {showPicker && (
        <ThumbnailPickerModal
          director={director}
          currentHeroUrl={heroSrc}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

/* ── Grid ───────────────────────────────────────────────────── */

export function DirectorGrid({ directors }: DirectorGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {directors.map((director) => (
        <DirectorCard key={director.id} director={director} />
      ))}
    </div>
  );
}
