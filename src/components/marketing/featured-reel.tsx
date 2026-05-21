"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef, useState } from "react";
import {
  MARKETING_TRANSITION_FINISHED,
  clearMarketingTransitionDelay,
  clearMarketingTransitionPoster,
  getMarketingTransitionDelay,
  getMarketingTransitionPoster,
} from "@/components/marketing/view-transition";

const PLAY_AFTER_LAND_DELAY_MS = 280;

interface FeaturedReelProps {
  projectId: string;
  muxPlaybackId: string;
  posterUrl?: string | null;
  brand?: string | null;
  title: string;
}

export function FeaturedReel({
  projectId,
  muxPlaybackId,
  posterUrl,
  brand,
  title,
}: FeaturedReelProps) {
  const playerRef = useRef<HTMLElement | null>(null);
  const [landingPoster] = useState(() =>
    getMarketingTransitionPoster(posterUrl),
  );
  const [canPlay, setCanPlay] = useState(
    () => getMarketingTransitionDelay() <= 0,
  );
  const [shouldPlay, setShouldPlay] = useState(
    () => getMarketingTransitionDelay() <= 0,
  );

  useEffect(() => {
    clearMarketingTransitionPoster();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const delay = getMarketingTransitionDelay();
    if (delay <= 0) {
      clearMarketingTransitionDelay();
      setCanPlay(true);
      setShouldPlay(true);
      return;
    }

    setCanPlay(false);
    setShouldPlay(false);

    let released = false;
    let playTimer: number | undefined;
    const release = () => {
      if (released) return;
      released = true;
      clearMarketingTransitionDelay();
      setCanPlay(true);
      playTimer = window.setTimeout(() => {
        setShouldPlay(true);
      }, PLAY_AFTER_LAND_DELAY_MS);
    };

    const timer = window.setTimeout(release, delay);
    window.addEventListener(MARKETING_TRANSITION_FINISHED, release, { once: true });

    return () => {
      window.clearTimeout(timer);
      if (playTimer) window.clearTimeout(playTimer);
      window.removeEventListener(MARKETING_TRANSITION_FINISHED, release);
    };
  }, [muxPlaybackId]);

  // Some browsers do not honor autoplay on a custom element after a route
  // view transition, so nudge playback once the shared-media morph has ended.
  useEffect(() => {
    if (!shouldPlay) return;

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
  }, [shouldPlay, muxPlaybackId]);

  return (
    <section className="mx-auto w-[calc(100vw-48px)] md:w-[64vw] max-w-[920px] mb-14 lg:mb-20">
      <div
        className={`ff-media-frame ff-media-frame-dark aspect-video transition-opacity duration-150 [&_mux-player]:h-full [&_mux-player]:w-full ${
          canPlay ? "opacity-100" : "opacity-0"
        }`}
        style={
          {
            "--media-object-fit": "cover",
          } as React.CSSProperties
        }
        data-featured-project-id={projectId}
        data-marketing-featured-media-target
      >
        {landingPoster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={landingPoster}
            alt=""
            aria-hidden="true"
            className={`ff-media-fill z-10 object-cover pointer-events-none transition-opacity duration-150 ${
              shouldPlay ? "opacity-0" : "opacity-100"
            }`}
            decoding="async"
          />
        )}
        <MuxPlayer
          ref={playerRef as React.RefObject<never>}
          playbackId={muxPlaybackId}
          poster={landingPoster ?? posterUrl ?? undefined}
          streamType="on-demand"
          {...(shouldPlay ? { autoPlay: "muted" as const } : {})}
          muted
          playsInline
          preload={shouldPlay ? "auto" : "metadata"}
        />
      </div>
      <div className="mt-5">
        <div>
          {brand && (
            <p className="ff-card-brand">
              {brand}
            </p>
          )}
          <p className="ff-display-feature mt-1">
            {title}
          </p>
        </div>
      </div>
    </section>
  );
}
