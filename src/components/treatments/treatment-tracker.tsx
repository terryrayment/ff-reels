"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface TrackerContextValue {
  /** Call when the viewer navigates to a new page of a PDF treatment. */
  notePage: (pageNumber: number) => void;
}

const TrackerContext = createContext<TrackerContextValue>({ notePage: () => {} });

export function useTreatmentTracker() {
  return useContext(TrackerContext);
}

/**
 * Silent client component that records a TreatmentView on mount and finalizes
 * it on unload (via sendBeacon). Invisible — no UI at all.
 *
 * Also exposes a context so child viewers (e.g. the PDF viewer) can emit
 * per-page events without this component knowing about react-pdf.
 */
export function TreatmentTracker({
  treatmentId,
  children,
}: {
  treatmentId: string;
  children?: React.ReactNode;
}) {
  const [viewId, setViewId] = useState<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const pagesViewedRef = useRef<Set<number>>(new Set([1]));
  const maxPageReachedRef = useRef<number>(1);

  // Record the view on mount
  useEffect(() => {
    let cancelled = false;

    fetch("/api/tracking/treatment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ treatmentId }),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.viewId) {
          setViewId(data.viewId);
        }
      })
      .catch(() => {
        // Tracking is best-effort; swallow errors
      });

    return () => {
      cancelled = true;
    };
  }, [treatmentId]);

  // Finalize the view on unload
  useEffect(() => {
    if (!viewId) return;

    function finalize() {
      const payload = JSON.stringify({
        viewId,
        totalDuration: Math.round((Date.now() - startedAtRef.current) / 1000),
        pagesViewed: Array.from(pagesViewedRef.current).sort((a, b) => a - b),
        maxPageReached: maxPageReachedRef.current,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/tracking/treatment/end",
          new Blob([payload], { type: "application/json" }),
        );
      } else {
        fetch("/api/tracking/treatment/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }

    // Fire on both pagehide (mobile-friendly) and beforeunload
    window.addEventListener("pagehide", finalize);
    window.addEventListener("beforeunload", finalize);
    return () => {
      window.removeEventListener("pagehide", finalize);
      window.removeEventListener("beforeunload", finalize);
    };
  }, [viewId]);

  const value: TrackerContextValue = {
    notePage(pageNumber: number) {
      if (typeof pageNumber !== "number" || pageNumber < 1) return;
      pagesViewedRef.current.add(pageNumber);
      if (pageNumber > maxPageReachedRef.current) {
        maxPageReachedRef.current = pageNumber;
      }
    },
  };

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
}
