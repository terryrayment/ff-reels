"use client";

import type { CSSProperties } from "react";
import { VersantBackgroundMux } from "./versant-background-mux";

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
      className="absolute inset-0 overflow-hidden"
      style={
        {
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        } as CSSProperties
      }
    >
      <VersantBackgroundMux
        playbackId={playbackId}
        poster={poster}
        title={title}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-100 [&_mux-player]:h-full [&_mux-player]:w-full"
      />
    </div>
  );
}
