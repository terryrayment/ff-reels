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
  transitionName?: string;
}

export function FeaturedReel({
  projectId,
  muxPlaybackId,
  brand,
  title,
  directorName,
  agency,
  year,
  transitionName,
}: FeaturedReelProps) {
  const playerRef = useRef<HTMLElement | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    setCanPlay(false);

    if (typeof window === "undefined") return;

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      clearMarketingTransitionDelay();
      setCanPlay(true);
    };

    const delay = getMarketingTransitionDelay();
    const timer = window.setTimeout(release, delay > 0 ? delay : 80);
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
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-16 lg:mb-24">
      <div
        className="relative aspect-video overflow-hidden bg-black [&_mux-player]:w-full [&_mux-player]:h-full"
        style={
          {
            viewTransitionName: `project-${projectId}`,
            ...(transitionName ? { viewTransitionName: transitionName } : {}),
            "--media-object-fit": "cover",
          } as React.CSSProperties
        }
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#1A1A1A] font-bold font-helveticaText">
              {brand}
            </p>
          )}
          <p className="text-[22px] md:text-[28px] tracking-tight-2 font-light text-[#1A1A1A] mt-1 font-helveticaDisplay">
            {title}
          </p>
        </div>
        <p className="text-[12px] tracking-tight text-[#666] font-helveticaText">
          Dir. {directorName}
          {agency ? ` · ${agency}` : ""}
          {year ? ` · ${year}` : ""}
        </p>
      </div>
    </section>
  );
}
