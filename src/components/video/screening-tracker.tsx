"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ViewContextValue {
  viewId: string | null;
}

const ViewContext = createContext<ViewContextValue>({ viewId: null });

export function useViewContext() {
  return useContext(ViewContext);
}

interface ScreeningTrackerProps {
  screeningLinkId: string;
  children: ReactNode;
}

/**
 * Wraps the screening page. On mount, records a ReelView via the tracking API.
 * On unload, fires a beacon to close the session with total duration.
 * Provides viewId to child ScreeningPlayer components via context.
 */
export function ScreeningTracker({
  screeningLinkId,
  children,
}: ScreeningTrackerProps) {
  const [viewId, setViewId] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const viewIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function recordView() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
        const res = await fetch("/api/tracking/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ screeningLinkId, timezone }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setViewId(data.viewId);
            viewIdRef.current = data.viewId;
          }
        }
      } catch {
        // Silently fail — don't break the viewing experience
      }
    }

    recordView();

    return () => {
      cancelled = true;
    };
  }, [screeningLinkId]);

  // Close session on page unload
  useEffect(() => {
    function handleUnload() {
      if (!viewIdRef.current) return;

      const duration = (Date.now() - startTime.current) / 1000;
      const payload = JSON.stringify({
        viewId: viewIdRef.current,
        totalDuration: Math.round(duration),
      });

      navigator.sendBeacon("/api/tracking/view/end", payload);
    }

    // visibilitychange is more reliable on mobile than beforeunload
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        handleUnload();
      }
    }

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <ViewContext.Provider value={{ viewId }}>
      {children}
    </ViewContext.Provider>
  );
}
