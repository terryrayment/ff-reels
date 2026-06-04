"use client";

import { useEffect, useRef, useState } from "react";
import { useTransitionPoster } from "@/components/marketing/use-transition-poster";
import { useMarketingViewerScroll } from "@/components/marketing/use-marketing-viewer-scroll";
import { useMarketingGalleryPlayDefer } from "@/components/marketing/use-marketing-gallery-play-defer";
import { clearMarketingTransitionDelay } from "@/components/marketing/view-transition";

interface SourceVideoReelProps {
  projectId: string;
  sourceVideoUrl: string;
  posterUrl?: string | null;
  brand: string;
  title: string;
}

interface PosterOnlyReelProps {
  projectId: string;
  posterUrl?: string | null;
  brand: string;
  title: string;
}


export function PosterOnlyReel({
  projectId,
  posterUrl,
  brand,
  title,
}: PosterOnlyReelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const displayPosterUrl = useTransitionPoster(projectId, posterUrl);
  const [posterReady, setPosterReady] = useState(!displayPosterUrl);

  useMarketingViewerScroll(projectId, sectionRef);

  useEffect(() => {
    setPosterReady(!displayPosterUrl);
    const image = posterRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setPosterReady(true);
    }
  }, [displayPosterUrl]);

  useEffect(() => {
    clearMarketingTransitionDelay();
  }, [projectId]);

  return (
    <section ref={sectionRef} className="ff-shell mb-12">
      <div className="mx-auto w-full md:w-[60%]">
        <div
          className="ff-media-frame ff-media-frame-dark aspect-video overflow-hidden bg-black"
          data-featured-project-id={projectId}
          data-marketing-featured-media-target
          data-marketing-media-ready={posterReady ? "poster" : "loading"}
          data-marketing-autoplay-state="unavailable"
        >
          {displayPosterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={posterRef}
              src={displayPosterUrl}
              alt=""
              aria-hidden="true"
              data-marketing-poster-layer
              className={`ff-media-fill pointer-events-none object-cover transition-opacity duration-200 ease-out ${
                posterReady ? "opacity-100" : "opacity-0"
              }`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setPosterReady(true)}
            />
          ) : (
            <div className="ff-media-fallback">
              <span>{brand || title}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-ff-micro uppercase tracking-ff-micro text-white/80">
              Video unavailable
            </p>
          </div>
        </div>
        <p
          className="ff-section-label mt-4 marketing-transition-reveal"
          data-marketing-transition-reveal
        >
          {brand} — {title}
        </p>
      </div>
    </section>
  );
}

export function SourceVideoReel({
  projectId,
  sourceVideoUrl,
  posterUrl,
  brand,
  title,
}: SourceVideoReelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const displayPosterUrl = useTransitionPoster(projectId, posterUrl);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterReady, setPosterReady] = useState(!displayPosterUrl);
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
    setVideoReady(false);
    setVideoFailed(false);
    setAutoplayState(shouldPlay ? "requested" : "idle");

    const video = videoRef.current;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true);
    }
  }, [projectId, shouldPlay, sourceVideoUrl]);

  useEffect(() => {
    if (!shouldPlay || videoFailed) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      video.muted = true;
      video.playsInline = true;
      setAutoplayState("requested");
      void video.play().then(() => {
        if (!cancelled) setAutoplayState("playing");
      }).catch(() => {
        if (!cancelled) setAutoplayState("blocked");
      });
    };

    tryPlay();
    const retries = [400, 900, 1500].map((ms) =>
      window.setTimeout(tryPlay, ms),
    );
    const onReady = () => tryPlay();
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("canplaythrough", onReady);

    return () => {
      cancelled = true;
      retries.forEach((id) => window.clearTimeout(id));
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("canplaythrough", onReady);
    };
  }, [projectId, shouldPlay, sourceVideoUrl, videoFailed]);

  // Reveal video once loaded after play is allowed — not only after autoplay succeeds.
  const showVideo =
    videoReady &&
    !videoFailed &&
    (shouldPlay ||
      autoplayState === "playing" ||
      autoplayState === "blocked");

  return (
    <section ref={sectionRef} className="ff-shell mb-12">
      <div className="mx-auto w-full md:w-[60%]">
        <div
          className="ff-media-frame ff-media-frame-dark aspect-video overflow-hidden bg-black"
          data-featured-project-id={projectId}
          data-marketing-featured-media-target
          data-marketing-media-ready={
            videoReady ? "video" : posterReady ? "poster" : "loading"
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
                showVideo || !posterReady ? "opacity-0" : "opacity-100"
              }`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setPosterReady(true)}
            />
          )}
          <video
            ref={videoRef}
            key={projectId}
            className={`h-full w-full object-cover transition-opacity duration-200 ease-out ${
              showVideo ? "opacity-100" : "opacity-0"
            }`}
            src={sourceVideoUrl}
            poster={displayPosterUrl ?? undefined}
            autoPlay={shouldPlay}
            controls
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onPlay={() => setAutoplayState("playing")}
            onPlaying={() => {
              setVideoReady(true);
              setAutoplayState("playing");
            }}
            onError={() => {
              setVideoFailed(true);
              setAutoplayState("error");
            }}
          />
        </div>
        <p
          className="ff-section-label mt-4 marketing-transition-reveal"
          data-marketing-transition-reveal
        >
          {brand} — {title}
        </p>
      </div>
    </section>
  );
}
