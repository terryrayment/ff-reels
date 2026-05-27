"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export type RosterCreditSpot = {
  label: string;
  title: string;
  embedUrl: string;
};

function playerUrl(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.set("autoplay", "1");
  parsed.searchParams.set("title", "0");
  parsed.searchParams.set("byline", "0");
  parsed.searchParams.set("portrait", "0");
  return parsed.toString();
}

export function RosterCreditLightbox({
  spots,
  dark = false,
}: {
  spots: RosterCreditSpot[];
  dark?: boolean;
}) {
  const [activeSpot, setActiveSpot] = useState<RosterCreditSpot | null>(null);
  const activeUrl = useMemo(
    () => (activeSpot ? playerUrl(activeSpot.embedUrl) : null),
    [activeSpot],
  );

  useEffect(() => {
    if (!activeSpot) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSpot(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSpot]);

  return (
    <>
      <span className="text-[14px] leading-[1.32]">
        {spots.map((spot, index) => (
          <span key={spot.embedUrl}>
            {index > 0 && <span>, </span>}
            <button
              type="button"
              data-versant-credit
              onClick={() => setActiveSpot(spot)}
              className={[
                "rounded-sm text-left underline decoration-current/30 underline-offset-[3px] transition hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                dark
                  ? "text-white focus-visible:outline-white"
                  : "text-black focus-visible:outline-black",
              ].join(" ")}
              aria-label={`Open ${spot.title}`}
            >
              {spot.label}
            </button>
          </span>
        ))}
      </span>

      {activeSpot && activeUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={activeSpot.title}
          onClick={() => setActiveSpot(null)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-[28px] bg-[var(--versant-black)] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/12 px-4 py-3 text-white sm:px-5">
              <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
                {activeSpot.title}
              </p>
              <button
                type="button"
                onClick={() => setActiveSpot(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Close video"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={activeUrl}
                title={activeSpot.title}
                className="h-full w-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
