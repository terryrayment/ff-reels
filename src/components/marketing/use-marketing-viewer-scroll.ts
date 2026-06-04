"use client";

import { type RefObject, useEffect } from "react";
import {
  MARKETING_TRANSITION_FINISHED,
  MARKETING_VIEWER_SCROLL_FINISHED,
  animateMarketingFeaturedViewerScroll,
  consumeMarketingViewerScroll,
} from "@/components/marketing/view-transition";

export function useMarketingViewerScroll(
  projectId: string,
  sectionRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (typeof window === "undefined" || !consumeMarketingViewerScroll()) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (
        document.documentElement.classList.contains(
          "marketing-media-transition-active",
        )
      ) {
        await new Promise<void>((resolve) => {
          window.addEventListener(MARKETING_TRANSITION_FINISHED, () => resolve(), {
            once: true,
          });
        });
      }
      if (cancelled) return;

      for (let i = 0; i < 60 && !sectionRef.current; i++) {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      }
      if (cancelled) return;

      await animateMarketingFeaturedViewerScroll(sectionRef.current);
      if (cancelled) return;

      requestAnimationFrame(() => {
        if (!cancelled) {
          window.dispatchEvent(new Event(MARKETING_VIEWER_SCROLL_FINISHED));
        }
      });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [projectId, sectionRef]);
}
