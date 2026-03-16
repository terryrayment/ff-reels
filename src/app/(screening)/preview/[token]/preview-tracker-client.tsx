"use client";

import type { ReactNode } from "react";
import { ViewContext } from "@/components/video/screening-tracker";

/**
 * A no-op ViewContext provider for preview mode.
 * ScreeningCarousel calls useViewContext() — this provides a null viewId
 * so no tracking occurs.
 */
export function PreviewTrackerClient({ children }: { children: ReactNode }) {
  return (
    <ViewContext.Provider value={{ viewId: null }}>
      {children}
    </ViewContext.Provider>
  );
}
