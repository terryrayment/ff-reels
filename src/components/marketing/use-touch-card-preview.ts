"use client";

import { useEffect, useRef, useState } from "react";

const MAX_CONCURRENT_PREVIEWS = 2;
const MIN_VISIBLE_RATIO = 0.6;
const OBSERVER_THRESHOLDS = [0, 0.6, 1];

interface PreviewEntry {
  ratio: number;
  setActive: (active: boolean) => void;
}

/** Module-level registry: all mounted touch-preview cards on the page. */
const previewEntries = new Map<symbol, PreviewEntry>();

/** Activate the top cards by visibility ratio, max 2 concurrent, min 60% visible. */
function syncActivePreviews() {
  const ranked = Array.from(previewEntries.entries())
    .filter(([, entry]) => entry.ratio >= MIN_VISIBLE_RATIO)
    .sort((a, b) => b[1].ratio - a[1].ratio)
    .slice(0, MAX_CONCURRENT_PREVIEWS);
  const activeKeys = new Set(ranked.map(([key]) => key));
  previewEntries.forEach((entry, key) => {
    entry.setActive(activeKeys.has(key));
  });
}

/**
 * Autoplay-in-view preview gate for touch-primary devices.
 * `active` is true while this card should play its muted preview loop;
 * it is always false on hover-capable devices, under prefers-reduced-motion,
 * when Save-Data is on, or when the card has no video source.
 *
 * `isTouchPrimary` tells the card to IGNORE mouse-hover for previews on
 * touch-primary devices: pointers can still exist there (iPad trackpad,
 * synthetic mouseenter when content scrolls under a stationary cursor) and
 * hover-driven playback would bypass the concurrency cap.
 */
export function useTouchCardPreview(
  frameRef: React.RefObject<HTMLElement>,
  hasVideo: boolean,
) {
  const [active, setActive] = useState(false);
  const [isTouchPrimary, setIsTouchPrimary] = useState(false);
  const keyRef = useRef<symbol | null>(null);
  if (keyRef.current === null) {
    keyRef.current = Symbol("touch-card-preview");
  }

  useEffect(() => {
    setIsTouchPrimary(window.matchMedia("(hover: none)").matches);
  }, []);

  useEffect(() => {
    const element = frameRef.current;
    if (!element || !hasVideo) return;
    if (!window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    const key = keyRef.current as symbol;
    previewEntries.set(key, { ratio: 0, setActive });

    const observer = new IntersectionObserver(
      ([entry]) => {
        const tracked = previewEntries.get(key);
        if (!tracked || !entry) return;
        tracked.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        syncActivePreviews();
      },
      { threshold: OBSERVER_THRESHOLDS },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      previewEntries.delete(key);
      setActive(false);
      syncActivePreviews();
    };
  }, [frameRef, hasVideo]);

  return { active, isTouchPrimary };
}
