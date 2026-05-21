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
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {spots.map((spot) => {
          const [brand, detail] = spot.title.split(" · ");

          return (
            <button
              key={spot.muxPlaybackId}
              type="button"
              onClick={() => setActiveSpot(spot)}
              className="group/spot overflow-hidden rounded-[18px] border border-black/14 bg-black text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              aria-label={`Open ${spot.title}`}
            >
              <div className="relative aspect-video overflow-hidden">
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
              </div>
              <div className="grid min-h-[4.5rem] grid-cols-[1fr_auto] gap-3 px-3 py-2.5 text-[11px] font-semibold tracking-[-0.01em]">
                <span className="min-w-0">
                  <span className="block truncate">{brand}</span>
                  <span className="block text-white/62">{detail}</span>
                </span>
                <span className="pt-0.5 text-white/72">Open</span>
              </div>
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-[var(--versant-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
              accentColor="#ff4b32"
              style={{ width: "100%", aspectRatio: "16 / 9" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
