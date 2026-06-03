"use client";

import { useEffect, useState } from "react";
import {
  clearMarketingTransitionPoster,
  getMarketingTransitionPoster,
} from "@/components/marketing/view-transition";

/** Session poster applies only to the project that just navigated in; gallery switches use props. */
export function useTransitionPoster(
  projectId: string,
  posterUrl?: string | null,
) {
  const [transitionPoster, setTransitionPoster] = useState<string | null>(null);

  useEffect(() => {
    const fromSession = getMarketingTransitionPoster(posterUrl);
    setTransitionPoster(fromSession);
    if (fromSession) {
      clearMarketingTransitionPoster();
    }
  }, [projectId, posterUrl]);

  return transitionPoster ?? posterUrl ?? null;
}
