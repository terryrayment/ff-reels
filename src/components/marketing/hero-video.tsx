"use client";

import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  /** Mux playback ID for the homepage hero reel. If absent, shows poster gradient. */
  muxPlaybackId?: string | null;
  posterUrl?: string | null;
}

export function HeroVideo({ muxPlaybackId, posterUrl }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setLoaded(true);
    v.addEventListener("canplay", onCanPlay);
    return () => v.removeEventListener("canplay", onCanPlay);
  }, []);

  return (
    <section className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-[#0A0A0A]">
      {muxPlaybackId ? (
        <video
          ref={videoRef}
          src={`https://stream.mux.com/${muxPlaybackId}/high.mp4`}
          poster={
            posterUrl ??
            `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?width=1920`
          }
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
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

      <div className="relative h-full mx-auto max-w-[1400px] px-6 lg:px-10 flex flex-col justify-end pb-16">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
          Commercial production
        </p>
        <h1 className="mt-3 text-[42px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight-3 font-light text-white max-w-4xl">
          Friends &amp; Family
        </h1>
        <p className="mt-4 text-[15px] md:text-[17px] tracking-tight-2 text-white/80 max-w-md">
          Los Angeles &amp; New York. Independently run, director-led, built on
          long relationships.
        </p>
      </div>
    </section>
  );
}
