"use client";

import { useEffect, useRef, useState } from "react";
import {
  MARKETING_TRANSITION_FINISHED,
  clearMarketingTransitionDelay,
  clearMarketingTransitionPoster,
  consumeMarketingViewerScroll,
  getMarketingTransitionDelay,
  getMarketingTransitionPoster,
} from "@/components/marketing/view-transition";

const PLAY_AFTER_LAND_DELAY_MS = 280;

interface SourceVideoReelProps {
  projectId: string;
  sourceVideoUrl: string;
  posterUrl?: string | null;
  brand: string;
  title: string;
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
  const [landingPoster] = useState(() =>
    getMarketingTransitionPoster(posterUrl),
  );
  const displayPosterUrl = landingPoster ?? posterUrl;
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(
    () => getMarketingTransitionDelay() <= 0,
  );
  const [autoplayState, setAutoplayState] = useState<
    "idle" | "requested" | "playing" | "blocked" | "error"
  >("idle");

  useEffect(() => {
    clearMarketingTransitionPoster();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !consumeMarketingViewerScroll()) {
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    window.requestAnimationFrame(() => {
      const navHeight = window.innerWidth >= 1024 ? 104 : 88;
      const top =
        section.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    });
  }, [projectId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const delay = getMarketingTransitionDelay();
    if (delay <= 0) {
      clearMarketingTransitionDelay();
      setShouldPlay(true);
      return;
    }

    setShouldPlay(false);

    let released = false;
    let playTimer: number | undefined;
    const release = () => {
      if (released) return;
      released = true;
      clearMarketingTransitionDelay();
      playTimer = window.setTimeout(() => {
        setShouldPlay(true);
      }, PLAY_AFTER_LAND_DELAY_MS);
    };

    const timer = window.setTimeout(release, delay);
    window.addEventListener(MARKETING_TRANSITION_FINISHED, release, {
      once: true,
    });

    return () => {
      window.clearTimeout(timer);
      if (playTimer) window.clearTimeout(playTimer);
      window.removeEventListener(MARKETING_TRANSITION_FINISHED, release);
    };
  }, [projectId, sourceVideoUrl]);

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
      video.play().catch(() => {
        if (!cancelled) setAutoplayState("blocked");
      });
    };

    tryPlay();

    return () => {
      cancelled = true;
    };
  }, [projectId, shouldPlay, sourceVideoUrl, videoFailed]);

  const showVideo = videoReady && !videoFailed && autoplayState === "playing";

  return (
    <section ref={sectionRef} className="ff-shell mb-12">
      <div className="mx-auto w-full md:w-[60%]">
        <div
          className="ff-media-frame ff-media-frame-dark aspect-video overflow-hidden bg-black transition-opacity duration-150"
          data-featured-project-id={projectId}
          data-marketing-featured-media-target
          data-marketing-media-ready={videoReady ? "video" : "poster"}
          data-marketing-autoplay-state={autoplayState}
        >
          {displayPosterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayPosterUrl}
              alt=""
              aria-hidden="true"
              data-marketing-poster-layer
              className={`ff-media-fill pointer-events-none object-cover transition-opacity duration-200 ease-out ${
                showVideo ? "opacity-0" : "opacity-100"
              }`}
              decoding="async"
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
        <p className="ff-kicker-muted mt-4">
          {brand} — {title}
        </p>
      </div>
    </section>
  );
}
