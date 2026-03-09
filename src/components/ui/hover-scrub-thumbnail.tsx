"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const TILE_W = 160;
const TILE_H = 90;

interface HoverScrubThumbnailProps {
  muxPlaybackId: string;
  duration: number | null;
  alt: string;
  className?: string;
  staticClassName?: string;
}

/**
 * Video thumbnail that scrubs through Mux storyboard frames on hover.
 * Loads a single storyboard sprite sheet and uses CSS background-position
 * to scrub through frames as the mouse moves left → right.
 */
export function HoverScrubThumbnail({
  muxPlaybackId,
  duration,
  alt,
  className = "",
  staticClassName = "",
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

  const containerRef = useRef<HTMLDivElement>(null);
  const spriteLoadedRef = useRef(false);

  const staticUrl = `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`;
  const storyboardUrl = `https://image.mux.com/${muxPlaybackId}/storyboard.jpg`;

  // Preload storyboard sprite on first hover
  useEffect(() => {
    if (!hovering || spriteLoadedRef.current) return;

    const img = new Image();
    img.onload = () => {
      const cols = Math.round(img.naturalWidth / TILE_W);
      const rows = Math.round(img.naturalHeight / TILE_H);
      setSpriteSize({ w: img.naturalWidth, h: img.naturalHeight, cols, rows, total: cols * rows });
      setSpriteReady(true);
      spriteLoadedRef.current = true;
    };
    img.onerror = () => {
      // Storyboard not available — stay on static thumbnail
      spriteLoadedRef.current = true;
    };
    img.src = storyboardUrl;
  }, [hovering, storyboardUrl]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setScrubPct(pct);
    },
    []
  );

  const handleEnter = useCallback(() => setHovering(true), []);
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
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${storyboardUrl})`,
            backgroundSize: `${spriteSize.cols * 100}% ${spriteSize.rows * 100}%`,
            backgroundPosition: `${(col / (spriteSize.cols - 1)) * 100}% ${(row / (spriteSize.rows - 1)) * 100}%`,
          }}
        />
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
