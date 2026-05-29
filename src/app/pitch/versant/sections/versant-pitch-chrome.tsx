"use client";

import { useCallback, useEffect, useState } from "react";

type ScrollMetrics = {
  thumbTop: number;
  thumbHeight: number;
  show: boolean;
};

/** Custom blue scroll thumb — native styling is unreliable on macOS overlay scrollbars. */
export function VersantPitchChrome() {
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    thumbTop: 0,
    thumbHeight: 80,
    show: false,
  });

  const updateMetrics = useCallback(() => {
    const root = document.documentElement;
    const viewport = root.clientHeight;
    const scrollable = root.scrollHeight - viewport;

    if (scrollable <= 1) {
      setMetrics({ thumbTop: 0, thumbHeight: viewport, show: false });
      return;
    }

    const thumbHeight = Math.max(56, (viewport / root.scrollHeight) * viewport);
    const maxThumbTop = viewport - thumbHeight;
    const thumbTop = (root.scrollTop / scrollable) * maxThumbTop;

    setMetrics({ thumbTop, thumbHeight, show: true });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("versant-pitch-page");

    updateMetrics();
    window.addEventListener("scroll", updateMetrics, { passive: true });
    window.addEventListener("resize", updateMetrics);

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(document.body);
    resizeObserver.observe(root);

    return () => {
      root.classList.remove("versant-pitch-page");
      window.removeEventListener("scroll", updateMetrics);
      window.removeEventListener("resize", updateMetrics);
      resizeObserver.disconnect();
    };
  }, [updateMetrics]);

  if (!metrics.show) {
    return null;
  }

  return (
    <div className="versant-custom-scrollbar" aria-hidden="true">
      <div className="versant-custom-scrollbar-track" />
      <div
        className="versant-custom-scrollbar-thumb"
        style={{
          height: `${metrics.thumbHeight}px`,
          transform: `translate3d(0, ${metrics.thumbTop}px, 0)`,
        }}
      />
    </div>
  );
}
