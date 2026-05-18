"use client";

import MuxPlayer from "@mux/mux-player-react";

interface HeroVideoProps {
  /** Mux playback ID for the homepage hero reel. If absent, shows poster gradient. */
  muxPlaybackId?: string | null;
  posterUrl?: string | null;
}

export function HeroVideo({ muxPlaybackId, posterUrl }: HeroVideoProps) {
  return (
    <section className="relative w-full h-[78svh] min-h-[500px] max-h-[800px] overflow-hidden bg-[#0A0A0A]">
      {muxPlaybackId ? (
        <div
          className="absolute inset-0 w-full h-full [&_mux-player]:w-full [&_mux-player]:h-full"
          style={
            {
              "--controls": "none",
              "--media-object-fit": "cover",
            } as React.CSSProperties
          }
        >
          <MuxPlayer
            playbackId={muxPlaybackId}
            streamType="on-demand"
            autoPlay="muted"
            muted
            loop
            playsInline
            preload="auto"
            poster={
              posterUrl ??
              `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?width=1920`
            }
            nohotkeys
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse at center, #2A2A2A 0%, #0A0A0A 70%)",
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />

      <div className="relative h-full mx-auto max-w-[1400px] px-6 lg:px-10 flex flex-col justify-end pb-16 pointer-events-none">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70 font-helveticaText">
          A creative network
        </p>
        <h1 className="mt-3 text-[58px] md:text-[98px] lg:text-[126px] leading-[0.92] text-white max-w-5xl font-helveticaDisplay font-medium">
          Friends &amp; Family
        </h1>
        <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-white/80 max-w-md">
          Director-led. Los Angeles, New York, São Paulo, Curitiba.
        </p>
      </div>
    </section>
  );
}
