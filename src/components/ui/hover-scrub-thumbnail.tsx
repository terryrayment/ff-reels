"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Fallback tile dimensions (Mux default storyboard tile size)
const DEFAULT_TILE_W = 284;
const DEFAULT_TILE_H = 160;

interface HoverScrubThumbnailProps {
  muxPlaybackId: string;
  duration: number | null;
  alt: string;
  className?: string;
  staticClassName?: string;
  /** Override the static (non-hover) thumbnail, e.g. a Mux time-based URL from the picker */
  staticUrlOverride?: string | null;
}

/**
 * Video thumbnail that scrubs through Mux storyboard frames on hover.
 * Fetches the storyboard VTT to get accurate tile dimensions, then uses
 * CSS background-position on the sprite sheet to scrub through frames.
 */
export function HoverScrubThumbnail({
  muxPlaybackId,
  duration,
  alt,
  className = "",
  staticClassName = "",
  staticUrlOverride,
}: HoverScrubThumbnailProps) {
  const [hovering, setHovering] = useState(false);
  const [scrubPct, setScrubPct] = useState(0);
  const [spriteReady, setSpriteReady] = useState(false);
  const [spriteSize, setSpriteSize] = useState<{
    w: number;
    h: number;
    cols: number;
    rows: number;
    total: number;
  } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const spriteLoadedRef = useRef(false);

  const staticUrl = staticUrlOverride || `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?width=640`;
  const storyboardUrl = `https://image.mux.com/${muxPlaybackId}/storyboard.jpg`;
  const storyboardVttUrl = `https://image.mux.com/${muxPlaybackId}/storyboard.vtt`;

  // Preload storyboard sprite + VTT on first hover
  useEffect(() => {
    if (!hovering || spriteLoadedRef.current) return;
    spriteLoadedRef.current = true;

    const load = async () => {
      try {
        // Fetch VTT (for accurate tile dimensions) and sprite image in parallel
        const [vttText, img] = await Promise.all([
          fetch(storyboardVttUrl)
            .then((r) => (r.ok ? r.text() : null))
            .catch(() => null),
          new Promise<HTMLImageElement>((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = storyboardUrl;
          }),
        ]);

        // Parse tile dimensions from VTT xywh fragment (e.g. #xywh=0,0,284,160)
        let tileW = DEFAULT_TILE_W;
        let tileH = DEFAULT_TILE_H;

        if (vttText) {
          const xywhMatch = vttText.match(/#xywh=(\d+),(\d+),(\d+),(\d+)/);
          if (xywhMatch) {
            tileW = parseInt(xywhMatch[3], 10);
            tileH = parseInt(xywhMatch[4], 10);
          }
        }

        const cols = Math.max(1, Math.round(img.naturalWidth / tileW));
        const rows = Math.max(1, Math.round(img.naturalHeight / tileH));

        setSpriteSize({
          w: img.naturalWidth,
          h: img.naturalHeight,
          cols,
          rows,
          total: cols * rows,
        });
        setSpriteReady(true);
      } catch {
        // Storyboard not available — stay on static thumbnail
      }
    };

    load();
  }, [hovering, storyboardUrl, storyboardVttUrl]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setScrubPct(pct);
    },
    []
  );

  const handleEnter = useCallback(() => {
    setHovering(true);
    // Snapshot container dimensions on first hover so we can do pixel-accurate cover math
    if (containerRef.current) {
      setContainerSize({
        w: containerRef.current.offsetWidth,
        h: containerRef.current.offsetHeight,
      });
    }
  }, []);
  const handleLeave = useCallback(() => {
    setHovering(false);
    setScrubPct(0);
  }, []);

  // Calculate which frame to show
  const frameIndex =
    spriteSize ? Math.min(Math.floor(scrubPct * spriteSize.total), spriteSize.total - 1) : 0;
  const col = spriteSize ? frameIndex % spriteSize.cols : 0;
  const row = spriteSize ? Math.floor(frameIndex / spriteSize.cols) : 0;

  const showScrub = hovering && spriteReady && spriteSize;

  // Pixel-accurate cover positioning — matches object-cover/object-center behavior
  const scrubStyle: React.CSSProperties = (() => {
    if (!showScrub || !containerSize) return {};
    const tileW = spriteSize.w / spriteSize.cols;
    const tileH = spriteSize.h / spriteSize.rows;
    // Scale so tile covers the container (same as object-cover)
    const scale = Math.max(containerSize.w / tileW, containerSize.h / tileH);
    const scaledSpriteW = spriteSize.w * scale;
    const scaledSpriteH = spriteSize.h * scale;
    const scaledTileW = tileW * scale;
    const scaledTileH = tileH * scale;
    // Center-crop the tile within the container
    const x = -(col * scaledTileW) - (scaledTileW - containerSize.w) / 2;
    const y = -(row * scaledTileH) - (scaledTileH - containerSize.h) / 2;
    return {
      backgroundImage: `url(${storyboardUrl})`,
      backgroundSize: `${scaledSpriteW}px ${scaledSpriteH}px`,
      backgroundPosition: `${x}px ${y}px`,
    };
  })();

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove}
      className={`relative ${className}`}
    >
      {/* Static thumbnail (always rendered, hidden during scrub) */}
      <img
        src={staticUrl}
        alt={alt}
        className={`w-full h-full object-cover ${staticClassName} ${showScrub ? "invisible" : ""}`}
        loading="lazy"
      />

      {/* Storyboard scrub layer */}
      {showScrub && (
        <div className="absolute inset-0" style={scrubStyle} />
      )}

      {/* Scrub progress bar */}
      {hovering && duration && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20">
          <div
            className="h-full bg-white/90 transition-[width] duration-75 ease-linear"
            style={{ width: `${scrubPct * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
