"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { useTransitionPoster } from "@/components/marketing/use-transition-poster";
import {
  MARKETING_TRANSITION_FINISHED,
  clearMarketingTransitionDelay,
  consumeMarketingViewerScroll,
  getMarketingTransitionDelay,
} from "@/components/marketing/view-transition";

const PLAY_AFTER_LAND_DELAY_MS = 280;

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

function useViewerScroll(projectId: string, sectionRef: RefObject<HTMLElement>) {
  useEffect(() => {
    if (typeof window === "undefined" || !consumeMarketingViewerScroll()) {
      return;
    }

    const scrollToViewer = () => {
      const section = sectionRef.current;
      if (!section) return;

      window.requestAnimationFrame(() => {
        const navHeight = window.innerWidth >= 1024 ? 104 : 88;
        const top =
          section.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      });
    };

    if (
      document.documentElement.classList.contains(
        "marketing-media-transition-active",
      )
    ) {
      window.addEventListener(MARKETING_TRANSITION_FINISHED, scrollToViewer, {
        once: true,
      });
      return () => {
        window.removeEventListener(
          MARKETING_TRANSITION_FINISHED,
          scrollToViewer,
        );
      };
    }

    scrollToViewer();
  }, [projectId, sectionRef]);
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

  useViewerScroll(projectId, sectionRef);

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
          className="ff-kicker-muted mt-4 marketing-transition-reveal"
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
  const [shouldPlay, setShouldPlay] = useState(
    () => getMarketingTransitionDelay() <= 0,
  );
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

  useViewerScroll(projectId, sectionRef);

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
          className="ff-kicker-muted mt-4 marketing-transition-reveal"
          data-marketing-transition-reveal
        >
          {brand} — {title}
        </p>
      </div>
    </section>
  );
}
