"use client";

import { useEffect, useState } from "react";
import {
  MARKETING_TRANSITION_FINISHED,
  MARKETING_VIEWER_SCROLL_FINISHED,
  clearMarketingTransitionDelay,
  consumeMarketingGalleryPlayDefer,
  getMarketingTransitionDelay,
} from "@/components/marketing/view-transition";

const PLAY_AFTER_LAND_DELAY_MS = 280;

/** Delays autoplay until gallery easy-ease scroll finishes, or morph handoff on entry. */
export function useMarketingGalleryPlayDefer(projectId: string) {
  const [shouldPlay, setShouldPlay] = useState(
    () => getMarketingTransitionDelay() <= 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    setShouldPlay(false);

    if (consumeMarketingGalleryPlayDefer()) {
      let released = false;
      const startPlay = () => {
        if (released) return;
        released = true;
        setShouldPlay(true);
      };
      window.addEventListener(
        MARKETING_VIEWER_SCROLL_FINISHED,
        startPlay,
        { once: true },
      );
      const fallback = window.setTimeout(startPlay, 1500);
      return () => {
        window.removeEventListener(
          MARKETING_VIEWER_SCROLL_FINISHED,
          startPlay,
        );
        window.clearTimeout(fallback);
      };
    }

    const delay = getMarketingTransitionDelay();
    if (delay <= 0) {
      clearMarketingTransitionDelay();
      setShouldPlay(true);
      return;
    }

    let released = false;
    let playTimer: number | undefined;
    const release = () => {
      if (released) return;
      released = true;
      clearMarketingTransitionDelay();
      playTimer = window.setTimeout(() => {
        setShouldPlay(true);
      }, PLAY_AFTER_LAND_DELAY_MS);
    };

    const timer = window.setTimeout(release, delay);
    window.addEventListener(MARKETING_TRANSITION_FINISHED, release, {
      once: true,
    });

    return () => {
      window.clearTimeout(timer);
      if (playTimer) window.clearTimeout(playTimer);
      window.removeEventListener(MARKETING_TRANSITION_FINISHED, release);
    };
  }, [projectId]);

  return shouldPlay;
}
