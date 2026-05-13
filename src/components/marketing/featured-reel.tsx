"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef } from "react";

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

  // Belt-and-braces autoplay nudge: some browsers don't honour the
  // autoplay attribute on a custom element that mounts after route
  // change / view transition. Force play() once the metadata loads.
  useEffect(() => {
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
  }, [muxPlaybackId]);

  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-16 lg:mb-24">
      <div
        className="relative aspect-video overflow-hidden bg-black [&_mux-player]:w-full [&_mux-player]:h-full"
        style={
          {
            viewTransitionName: `project-${projectId}`,
            "--media-object-fit": "cover",
          } as React.CSSProperties
        }
      >
        <MuxPlayer
          ref={playerRef as React.RefObject<never>}
          playbackId={muxPlaybackId}
          streamType="on-demand"
          autoPlay="muted"
          muted
          playsInline
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
