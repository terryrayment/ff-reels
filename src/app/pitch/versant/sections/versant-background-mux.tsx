"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

type Props = {
  playbackId: string;
  poster: string;
  title: string;
  className?: string;
};

/**
 * Full-bleed muted background loop for Versant pitch panels.
 * Client-only Mux + explicit play() — autoplay on the custom element is
 * unreliable after SSR on production (see featured-reel.tsx).
 */
export function VersantBackgroundMux({
  playbackId,
  poster,
  title,
  className = "pointer-events-none absolute inset-0 min-h-full w-full opacity-72 [&_mux-player]:h-full [&_mux-player]:w-full",
}: Props) {
  const playerRef = useRef<HTMLElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setVideoReady(false);
  }, [playbackId]);

  useEffect(() => {
    const el = playerRef.current as
      | (HTMLElement & { play?: () => Promise<void>; muted?: boolean })
      | null;
    if (!el) return;

    let cancelled = false;

    const markPlaying = () => {
      if (!cancelled) setVideoReady(true);
    };

    const tryPlay = () => {
      if (cancelled || !el.play) return;
      el.muted = true;
      void el.play().then(markPlaying).catch(() => {});
    };

    el.addEventListener("playing", markPlaying);
    tryPlay();
    const retryA = window.setTimeout(tryPlay, 400);
    const retryB = window.setTimeout(tryPlay, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(retryA);
      window.clearTimeout(retryB);
      el.removeEventListener("playing", markPlaying);
    };
  }, [playbackId]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={
        {
          "--controls": "none",
          "--media-object-fit": "cover",
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
        loading="eager"
        decoding="async"
      />
      <MuxPlayer
        ref={playerRef as React.RefObject<never>}
        className="absolute inset-0 h-full w-full min-h-[12rem]"
        playbackId={playbackId}
        streamType="on-demand"
        autoPlay="muted"
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        metadata={{ video_title: title }}
        nohotkeys
        onPlay={() => setVideoReady(true)}
      />
    </div>
  );
}
