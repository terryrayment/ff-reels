"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef, useState } from "react";
import { useTransitionPoster } from "@/components/marketing/use-transition-poster";
import { useMarketingViewerScroll } from "@/components/marketing/use-marketing-viewer-scroll";
import { useMarketingGalleryPlayDefer } from "@/components/marketing/use-marketing-gallery-play-defer";

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
  const sectionRef = useRef<HTMLElement>(null);
  const playerRef = useRef<HTMLElement | null>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const displayPosterUrl = useTransitionPoster(projectId, posterUrl);
  const [posterReady, setPosterReady] = useState(!displayPosterUrl);
  const [muxPlaying, setMuxPlaying] = useState(false);
  const shouldPlay = useMarketingGalleryPlayDefer(projectId);
  const [autoplayState, setAutoplayState] = useState<
    "idle" | "requested" | "playing" | "blocked" | "error"
  >("idle");

  useEffect(() => {
    setPosterReady(!displayPosterUrl);
    const image = posterRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setPosterReady(true);
    }
  }, [displayPosterUrl]);

  useMarketingViewerScroll(projectId, sectionRef);

  useEffect(() => {
    setMuxPlaying(false);
    setAutoplayState("idle");
  }, [projectId, muxPlaybackId]);

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
      setAutoplayState("requested");
      el.play().catch(() => {
        if (!cancelled) setAutoplayState("blocked");
      });
    };

    tryPlay();
    const retry = window.setTimeout(tryPlay, 400);

    const onPlaying = () => {
      setMuxPlaying(true);
      setAutoplayState("playing");
    };
    el.addEventListener("playing", onPlaying);

    return () => {
      cancelled = true;
      window.clearTimeout(retry);
      el.removeEventListener("playing", onPlaying);
    };
  }, [shouldPlay, muxPlaybackId]);

  const showMux = muxPlaying && autoplayState === "playing";

  return (
    <section ref={sectionRef} className="ff-shell mb-12">
      <div className="mx-auto w-full md:w-[60%]">
        <div
          className="ff-media-frame ff-media-frame-dark aspect-video overflow-hidden bg-black [&_mux-player]:h-full [&_mux-player]:w-full"
          style={
            {
              "--media-object-fit": "cover",
            } as React.CSSProperties
          }
          data-featured-project-id={projectId}
          data-marketing-featured-media-target
          data-marketing-media-ready={
            showMux ? "video" : posterReady ? "poster" : "loading"
          }
          data-marketing-autoplay-state={autoplayState}
        >
          {displayPosterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={posterRef}
              src={displayPosterUrl}
              alt=""
              aria-hidden="true"
              data-marketing-poster-layer
              className={`ff-media-fill pointer-events-none object-cover transition-opacity duration-200 ease-out ${
                showMux || !posterReady ? "opacity-0" : "opacity-100"
              }`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setPosterReady(true)}
            />
          )}
          <MuxPlayer
            ref={playerRef as React.RefObject<never>}
            playbackId={muxPlaybackId}
            poster={displayPosterUrl ?? undefined}
            streamType="on-demand"
            {...(shouldPlay ? { autoPlay: "muted" as const } : {})}
            muted
            playsInline
            preload={shouldPlay ? "auto" : "metadata"}
            className={`transition-opacity duration-200 ease-out ${
              showMux ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        <div className="mt-4 marketing-transition-reveal" data-marketing-transition-reveal>
          {brand && <p className="ff-card-brand">{brand}</p>}
          <p className="ff-display-feature mt-1">{title}</p>
        </div>
      </div>
    </section>
  );
}
