"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ProximityTextProps {
  text: string;
  className?: string;
  /** Base variable-font weight (matches the surrounding type). */
  baseWeight?: number;
  /** Extra weight added to the letter under the cursor (bolding). */
  weightBoost?: number;
  /** Extra size (in em) added to the letter under the cursor (scaling). */
  sizeBoost?: number;
  /** Feather radius in px — how far the bulge reaches around the cursor. */
  radius?: number;
}

/**
 * Cursor-proximity type: letters near the pointer bold up (and grow a touch),
 * feathering out radially across a few letters, the bulge following the cursor.
 * Uses real font metrics (variable-font weight + font-size) — NOT transform —
 * so letters reflow and push apart instead of overlapping. Real text lives in
 * an sr-only copy; the visual letters are aria-hidden. No-op under
 * prefers-reduced-motion.
 */
export function ProximityText({
  text,
  className,
  baseWeight = 500,
  weightBoost = 250,
  // Weight-only by default: font-size growth would make the row taller and
  // shove the names below it. Bolding widens letters within the name's own
  // row (reflow, no overlap) without moving any other name.
  sizeBoost = 0,
  radius = 20,
}: ProximityTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  // Base (unscaled) letter centres, cached on enter so per-frame distance
  // reads never reflow and the bulge stays anchored as letters widen.
  const centres = useRef<{ x: number; y: number }[]>([]);

  const prefersReduce = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chars = () =>
    ref.current
      ? Array.from(
          ref.current.querySelectorAll<HTMLElement>("[data-proximity-char]"),
        )
      : [];

  const measure = () => {
    centres.current = chars().map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };

  const onEnter = () => {
    if (prefersReduce()) return;
    measure();
  };

  const onMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (prefersReduce()) return;
    if (centres.current.length === 0) measure();
    const px = event.clientX;
    const py = event.clientY;
    const els = chars();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r2 = radius * radius;
      els.forEach((c, i) => {
        const centre = centres.current[i];
        if (!centre) return;
        const dx = px - centre.x;
        const dy = py - centre.y;
        const falloff = Math.exp(-(dx * dx + dy * dy) / (2 * r2));
        c.style.fontVariationSettings = `"wdth" 86, "wght" ${Math.round(
          baseWeight + weightBoost * falloff,
        )}`;
        if (sizeBoost) {
          c.style.fontSize = `${(1 + sizeBoost * falloff).toFixed(3)}em`;
        }
      });
    });
  };

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    chars().forEach((c) => {
      c.style.fontVariationSettings = "";
      c.style.fontSize = "";
    });
  };

  return (
    <span
      ref={ref}
      className={cn("ff-proximity", className)}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="ff-proximity__visual">
        {Array.from(text).map((ch, i) => (
          <span key={i} data-proximity-char className="ff-proximity__char">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
