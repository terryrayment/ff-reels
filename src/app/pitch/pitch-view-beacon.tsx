"use client";

import { useEffect } from "react";

/**
 * Fires one open-tracking beacon per browser session for a pitch page.
 * Client-side on purpose: email link-scanners don't execute JS, so they
 * never show up as opens.
 */
export function PitchViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `ff-pitch-viewed-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode without storage: still send, worst case a duplicate.
    }

    const payload = JSON.stringify({
      slug,
      referrer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/tracking/pitch-view",
        new Blob([payload], { type: "application/json" }),
      );
    } else {
      fetch("/api/tracking/pitch-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [slug]);

  return null;
}
