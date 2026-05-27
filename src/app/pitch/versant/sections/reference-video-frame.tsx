"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { CSSProperties } from "react";

type Props = {
  playbackId: string;
  poster: string;
  title: string;
};

export function ReferenceVideoFrame({ playbackId, poster, title }: Props) {
  return (
    <div
      className="absolute inset-0 [&_mux-player]:h-full [&_mux-player]:w-full"
      style={
        {
          "--controls": "none",
          "--media-object-fit": "cover",
        } as CSSProperties
      }
    >
      <MuxPlayer
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
      />
    </div>
  );
}
