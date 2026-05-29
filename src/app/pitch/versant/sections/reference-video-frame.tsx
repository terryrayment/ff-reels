"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { CSSProperties } from "react";

type Props = {
  playbackId: string;
  poster: string;
  title: string;
  scale?: number;
};

export function ReferenceVideoFrame({
  playbackId,
  poster,
  title,
  scale = 1,
}: Props) {
  return (
    <div
      className="absolute inset-0 [&_mux-player]:h-full [&_mux-player]:w-full"
      style={
        {
          "--controls": "none",
          "--media-object-fit": "cover",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <MuxPlayer
        className="absolute inset-0"
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
