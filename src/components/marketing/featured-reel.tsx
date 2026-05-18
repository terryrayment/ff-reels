"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef, useState } from "react";
import {
  MARKETING_TRANSITION_FINISHED,
  clearMarketingTransitionDelay,
  getMarketingTransitionDelay,
} from "@/components/marketing/view-transition";

interface FeaturedReelProps {
  projectId: string;
  muxPlaybackId: string;
  brand?: string | null;
  title: string;
  directorName: string;
  agency?: string | null;
  year?: number | null;
}

export function FeaturedReel({
  projectId,
  muxPlaybackId,
  brand,
  title,
  directorName,
  agency,
  year,
}: FeaturedReelProps) {
  const playerRef = useRef<HTMLElement | null>(null);
  const [canPlay, setCanPlay] = useState(
    () => getMarketingTransitionDelay() <= 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const delay = getMarketingTransitionDelay();
    if (delay <= 0) {
      clearMarketingTransitionDelay();
      setCanPlay(true);
      return;
    }

    setCanPlay(false);

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      clearMarketingTransitionDelay();
      setCanPlay(true);
    };

    const timer = window.setTimeout(release, delay);
    window.addEventListener(MARKETING_TRANSITION_FINISHED, release, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(MARKETING_TRANSITION_FINISHED, release);
    };
  }, [muxPlaybackId]);

  // Some browsers do not honor autoplay on a custom element after a route
  // view transition, so nudge playback once the shared-media morph has ended.
  useEffect(() => {
    if (!canPlay) return;

    const el = playerRef.current as
      | (HTMLElement & { play?: () => Promise<void>; muted?: boolean })
      | null;
    if (!el) return;
    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || !el.play) return;
      el.muted = true;
      el.play().catch(() => {});
    };
    tryPlay();
    const t = setTimeout(tryPlay, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [canPlay, muxPlaybackId]);

  return (
    <section className="mx-auto w-[calc(100vw-48px)] md:w-[64vw] max-w-[920px] mb-14 lg:mb-20">
      <div
        className={`relative aspect-video overflow-hidden bg-black transition-opacity duration-150 [&_mux-player]:w-full [&_mux-player]:h-full ${
          canPlay ? "opacity-100" : "opacity-0"
        }`}
        style={
          {
            "--media-object-fit": "cover",
          } as React.CSSProperties
        }
        data-featured-project-id={projectId}
      >
        <MuxPlayer
          ref={playerRef as React.RefObject<never>}
          playbackId={muxPlaybackId}
          streamType="on-demand"
          {...(canPlay ? { autoPlay: "muted" as const } : {})}
          muted
          playsInline
          preload={canPlay ? "auto" : "metadata"}
        />
      </div>
      <div className="mt-5 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
        <div>
          {brand && (
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A] font-medium font-helveticaText">
              {brand}
            </p>
          )}
          <p className="text-[24px] md:text-[34px] font-medium text-[#1A1A1A] mt-1 font-helveticaDisplay leading-[1.02]">
            {title}
          </p>
        </div>
        <p className="text-[12px] text-[#666] font-helveticaText leading-snug">
          Dir. {directorName}
          {agency ? ` · ${agency}` : ""}
          {year ? ` · ${year}` : ""}
        </p>
      </div>
    </section>
  );
}
