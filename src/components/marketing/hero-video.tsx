"use client";

import MuxPlayer from "@mux/mux-player-react";

interface HeroVideoProps {
  /** Mux playback ID for the homepage hero reel. If absent, shows poster gradient. */
  muxPlaybackId?: string | null;
  posterUrl?: string | null;
}

export function HeroVideo({ muxPlaybackId, posterUrl }: HeroVideoProps) {
  return (
    <section className="relative h-[78svh] min-h-[500px] max-h-[800px] w-full overflow-hidden bg-ff-media">
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
              "radial-gradient(ellipse at center, var(--ff-color-media-soft) 0%, var(--ff-color-media) 70%)",
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />

      <div className="ff-shell pointer-events-none relative flex h-full flex-col justify-end pb-16">
        <p className="ff-nav-label text-white/70">
          A creative network
        </p>
        <h1 className="ff-display-hero mt-3 max-w-5xl text-white">
          Friends &amp; Family
        </h1>
        <p className="ff-body mt-4 max-w-md text-white/80">
          Creative led: Los Angeles, New York, São Paulo, Curitiba.
        </p>
      </div>
    </section>
  );
}
