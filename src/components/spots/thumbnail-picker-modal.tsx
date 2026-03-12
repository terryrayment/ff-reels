"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, RotateCcw, Check, Camera } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface ThumbnailPickerModalProps {
  project: {
    id: string;
    title: string;
    muxPlaybackId: string | null;
    duration: number | null;
    thumbnailUrl: string | null;
  };
  onClose: () => void;
  onSave: (projectId: string, thumbnailUrl: string | null) => void;
  saving?: boolean;
}

/** Parse time from a Mux thumbnail URL, e.g. ?time=12.5 */
function parseMuxTime(url: string | null): number | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const t = u.searchParams.get("time");
    return t ? parseFloat(t) : null;
  } catch {
    return null;
  }
}

export function ThumbnailPickerModal({
  project,
  onClose,
  onSave,
  saving = false,
}: ThumbnailPickerModalProps) {
  const playbackId = project.muxPlaybackId ?? "";
  const duration = project.duration ?? 60;
  const initialTime = parseMuxTime(project.thumbnailUrl) ?? 0;

  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [previewTime, setPreviewTime] = useState(initialTime);

  const [spriteData, setSpriteData] = useState<{
    url: string; cols: number; rows: number; total: number; tileW: number; tileH: number;
  } | null>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [filmstripHovering, setFilmstripHovering] = useState(false);
  const [filmstripPct, setFilmstripPct] = useState(0);

  const filmstripRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storyboardUrl = `https://image.mux.com/${playbackId}/storyboard.jpg`;
  const storyboardVttUrl = `https://image.mux.com/${playbackId}/storyboard.vtt`;

  const getPreviewUrl = (t: number) =>
    `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${t.toFixed(2)}&width=880&fit_mode=smartcrop`;

  // Load storyboard sprite + VTT for the filmstrip
  useEffect(() => {
    const load = async () => {
      try {
        const [vttText, img] = await Promise.all([
          fetch(storyboardVttUrl).then((r) => (r.ok ? r.text() : null)).catch(() => null),
          new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = storyboardUrl;
          }),
        ]);
        let tileW = 284;
        let tileH = 160;
        if (vttText) {
          const m = vttText.match(/#xywh=(\d+),(\d+),(\d+),(\d+)/);
          if (m) { tileW = parseInt(m[3]); tileH = parseInt(m[4]); }
        }
        const cols = Math.max(1, Math.round(img.naturalWidth / tileW));
        const rows = Math.max(1, Math.round(img.naturalHeight / tileH));
        setSpriteData({ url: storyboardUrl, cols, rows, total: cols * rows, tileW, tileH });
      } catch { /* no storyboard */ }
    };
    load();
  }, [storyboardUrl, storyboardVttUrl]);

  // Update preview image debounced to avoid too many Mux requests while dragging
  const updatePreview = useCallback((t: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewTime(t);
      setPreviewLoaded(false);
    }, 80);
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setSelectedTime(t);
    updatePreview(t);
  };

  // Filmstrip hover/click
  const getFilmstripTime = useCallback((e: React.MouseEvent) => {
    if (!filmstripRef.current) return 0;
    const rect = filmstripRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return pct * duration;
  }, [duration]);

  const handleFilmstripMouseMove = useCallback((e: React.MouseEvent) => {
    if (!filmstripRef.current) return;
    const rect = filmstripRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setFilmstripPct(pct);
  }, []);

  const handleFilmstripClick = useCallback((e: React.MouseEvent) => {
    const t = getFilmstripTime(e);
    setSelectedTime(t);
    updatePreview(t);
  }, [getFilmstripTime, updatePreview]);

  // Get sprite tile for a given time
  const getSpriteStyle = useCallback((t: number, containerW: number, containerH: number) => {
    if (!spriteData) return {};
    const pct = Math.min(1, t / duration);
    const frameIndex = Math.min(Math.floor(pct * spriteData.total), spriteData.total - 1);
    const col = frameIndex % spriteData.cols;
    const row = Math.floor(frameIndex / spriteData.cols);
    return {
      backgroundImage: `url(${spriteData.url})`,
      backgroundSize: `${spriteData.cols * containerW}px ${spriteData.rows * containerH}px`,
      backgroundPosition: `-${col * containerW}px -${row * containerH}px`,
    };
  }, [spriteData, duration]);

  // Close on backdrop click or Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSave = () => {
    const url = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${selectedTime.toFixed(2)}&width=640&fit_mode=smartcrop`;
    onSave(project.id, url);
  };

  const handleReset = () => {
    onSave(project.id, null);
  };

  // The filmstrip hover preview time
  const filmstripHoverTime = filmstripPct * duration;
  const FILMSTRIP_H = 48;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden w-full max-w-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Camera size={15} className="text-white/50" />
            <span className="text-[13px] font-medium text-white/90">Set thumbnail</span>
            <span className="text-[12px] text-white/30 truncate max-w-[200px]">{project.title}</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Large preview */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {!previewLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}
          <img
            ref={previewRef}
            key={previewTime}
            src={getPreviewUrl(previewTime)}
            alt={project.title}
            className={`w-full h-full object-contain transition-opacity duration-150 ${previewLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setPreviewLoaded(true)}
          />
          {/* Time badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-[11px] text-white/80 font-mono tabular-nums">
            {formatDuration(Math.round(selectedTime))}
          </div>
        </div>

        {/* Filmstrip */}
        {spriteData && (
          <div className="px-5 pt-4">
            <div
              ref={filmstripRef}
              className="relative w-full overflow-hidden rounded cursor-crosshair select-none"
              style={{ height: FILMSTRIP_H }}
              onMouseEnter={() => setFilmstripHovering(true)}
              onMouseLeave={() => setFilmstripHovering(false)}
              onMouseMove={handleFilmstripMouseMove}
              onClick={handleFilmstripClick}
            >
              {/* Filmstrip: render all frames proportionally across width */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${spriteData.url})`,
                  backgroundSize: `${spriteData.cols * (FILMSTRIP_H * spriteData.tileW / spriteData.tileH)}px ${spriteData.rows * FILMSTRIP_H}px`,
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "0 0",
                }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/20" />

              {/* Selected time marker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                style={{ left: `${(selectedTime / duration) * 100}%` }}
              />

              {/* Hover scrub preview bubble */}
              {filmstripHovering && (
                <div
                  className="absolute bottom-full mb-2 pointer-events-none"
                  style={{
                    left: `${filmstripPct * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div
                    className="w-20 rounded overflow-hidden border border-white/20 shadow-lg"
                    style={{ aspectRatio: "16/9", ...getSpriteStyle(filmstripHoverTime, 80, 45) }}
                  />
                  <div className="text-center mt-1 text-[10px] text-white/60 font-mono tabular-nums">
                    {formatDuration(Math.round(filmstripHoverTime))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Range slider (always shown) */}
        <div className="px-5 pt-3">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.5}
            value={selectedTime}
            onChange={handleSliderChange}
            className="w-full accent-white cursor-pointer"
            style={{ accentColor: "#fff" }}
          />
          <div className="flex justify-between text-[10px] text-white/30 font-mono mt-0.5">
            <span>0:00</span>
            <span>{formatDuration(Math.round(duration))}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-4 mt-1">
          <button
            onClick={handleReset}
            disabled={saving || project.thumbnailUrl === null}
            className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw size={12} />
            Reset to default
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="text-[12px] text-white/50 hover:text-white/80 transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-[12px] bg-white text-[#1A1A1A] px-4 py-1.5 rounded-md font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-[#1A1A1A]/20 border-t-[#1A1A1A] rounded-full animate-spin" />
              ) : (
                <Check size={13} />
              )}
              Set thumbnail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
