"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { X } from "lucide-react";

import { muxAnimatedUrl, muxStillUrl } from "./media";

type Spot = {
  title: string;
  muxPlaybackId: string;
  duration: number;
};

function spotLabel(title: string) {
  const [, detail = title] = title.split(" · ");
  return detail.replace(/^Callaway\s*[·-]\s*/i, "");
}

export function CallawaySpotLightbox({ spots }: { spots: Spot[] }) {
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);

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
      <div className="mt-5 grid gap-2">
        {spots.map((spot) => {
          const label = spotLabel(spot.title);

          return (
            <button
              key={spot.muxPlaybackId}
              type="button"
              onClick={() => setActiveSpot(spot)}
              className="group/spot grid min-w-0 grid-cols-[minmax(8.5rem,1fr)_auto] items-center gap-3 rounded-[18px] border border-white/22 bg-black p-2 text-left text-white transition hover:border-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:grid-cols-[minmax(9.75rem,1fr)_auto]"
              aria-label={`Open ${spot.title}`}
            >
              <div className="relative aspect-video min-w-0 overflow-hidden rounded-[12px] bg-white/8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={muxStillUrl(spot.muxPlaybackId, 360, spot.duration)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={muxAnimatedUrl(spot.muxPlaybackId, 360, spot.duration)}
                  alt=""
                  className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition duration-300 group-hover/spot:opacity-100 motion-safe:block"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 right-2 rounded-full bg-black/58 px-2.5 py-1 text-[12px] font-semibold leading-none tracking-[-0.01em] text-white shadow-[0_6px_20px_rgba(0,0,0,0.24)]">
                  {label}
                </span>
              </div>
              <span className="shrink-0 text-[12px] font-semibold text-white/72">
                Open
              </span>
            </button>
          );
        })}
      </div>

      {activeSpot && (
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
            <MuxPlayer
              playbackId={activeSpot.muxPlaybackId}
              streamType="on-demand"
              autoPlay
              metadata={{ video_title: activeSpot.title }}
              primaryColor="#ffffff"
              secondaryColor="#101010"
              accentColor="#C6A24C"
              style={{ width: "100%", aspectRatio: "16 / 9" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
