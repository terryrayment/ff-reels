"use client";

import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { prepareMarketingCardSourceForTransition } from "@/components/marketing/prepare-marketing-card-source";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";
import {
  HOME_SPOT_CLIP_DURATION_SECONDS,
  type HomeSpotCarouselSlide,
} from "@/lib/marketing/home-spot-carousel";

interface HomeSpotCarouselProps {
  slides: HomeSpotCarouselSlide[];
}

function muxPoster(playbackId: string) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1920`;
}

export function HomeSpotCarousel({ slides }: HomeSpotCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const muxRef = useRef<HTMLElement | null>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const clipEndRef = useRef(0);
  const [progressRunning, setProgressRunning] = useState(false);
  const [progressEpoch, setProgressEpoch] = useState(0);

  const active = slides[activeIndex] ?? slides[0];
  const clipDuration = HOME_SPOT_CLIP_DURATION_SECONDS;
  const clipDurationMs = clipDuration * 1000;

  useEffect(() => {
    setProgressRunning(false);
  }, [activeIndex]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setProgressRunning(false);
      setProgressEpoch((value) => value + 1);
      setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const startProgress = useCallback(() => {
    if (reduceMotion) return;
    setProgressRunning(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgressRunning(true));
    });
  }, [reduceMotion]);

  const advance = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (!active || reduceMotion) return;

    clipEndRef.current = active.clipStartSeconds + clipDuration;
    let cancelled = false;

    const onSourceVideo = (video: HTMLVideoElement) => {
      const seekAndPlay = () => {
        if (cancelled) return;
        try {
          video.currentTime = active.clipStartSeconds;
        } catch {
          /* ignore seek before metadata */
        }
        video.muted = true;
        void video.play().then(() => startProgress()).catch(() => {});
      };

      if (video.readyState >= 1) seekAndPlay();
      else video.addEventListener("loadedmetadata", seekAndPlay, { once: true });

      const onTimeUpdate = () => {
        if (video.currentTime >= clipEndRef.current) {
          video.pause();
          setProgressRunning(false);
          advance();
        }
      };
      video.addEventListener("timeupdate", onTimeUpdate);

      return () => {
        video.removeEventListener("loadedmetadata", seekAndPlay);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.pause();
      };
    };

    const onMux = (
      el: HTMLElement & {
        currentTime?: number;
        pause?: () => void;
        play?: () => Promise<void>;
        muted?: boolean;
      },
    ) => {
      const seekAndPlay = () => {
        if (cancelled || el.currentTime === undefined) return;
        try {
          el.currentTime = active.clipStartSeconds;
        } catch {
          /* ignore */
        }
        el.muted = true;
        void el.play?.().then(() => startProgress()).catch(() => {});
      };

      seekAndPlay();
      const retry = window.setTimeout(seekAndPlay, 400);

      const onPlaying = () => startProgress();
      el.addEventListener("playing", onPlaying);

      const onTimeUpdate = () => {
        if (el.currentTime !== undefined && el.currentTime >= clipEndRef.current) {
          el.pause?.();
          setProgressRunning(false);
          advance();
        }
      };
      el.addEventListener("timeupdate", onTimeUpdate);

      return () => {
        window.clearTimeout(retry);
        el.removeEventListener("playing", onPlaying);
        el.removeEventListener("timeupdate", onTimeUpdate);
        el.pause?.();
      };
    };

    let cleanup: (() => void) | undefined;
    let fallbackTimer: number | undefined;

    const mountTimer = window.setTimeout(() => {
      if (active.sourceVideoUrl && videoRef.current) {
        cleanup = onSourceVideo(videoRef.current);
      } else if (active.muxPlaybackId && muxRef.current) {
        cleanup = onMux(muxRef.current);
      } else {
        startProgress();
        fallbackTimer = window.setTimeout(advance, clipDurationMs);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(mountTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      cleanup?.();
    };
  }, [
    active,
    activeIndex,
    advance,
    clipDuration,
    clipDurationMs,
    reduceMotion,
    startProgress,
  ]);

  const handleOpenSpot = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const sourceElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-media-frame]",
    );
    await prepareMarketingCardSourceForTransition(
      e.currentTarget,
      sourceElement,
      posterRef,
    );
    const posterUrl =
      posterRef.current?.currentSrc || posterRef.current?.src || active.thumbnailUrl;
    await startMarketingViewTransition(router, active.href, {
      sourceElement,
      imageUrl: posterUrl,
    });
  };

  if (slides.length === 0) return null;

  return (
    <section
      className="ff-home-spot-carousel ff-shell"
      aria-label="Featured spots"
      aria-roledescription="carousel"
    >
      <div className="ff-home-spot-carousel__inner">
      <Link
        href={active.href}
        className="ff-home-spot-carousel__link"
        data-cursor="link"
        onClick={handleOpenSpot}
      >
        <div
          className="ff-home-spot-carousel__stage"
          data-marketing-media-frame
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            const slidePoster =
              slide.thumbnailUrl ??
              (slide.muxPlaybackId ? muxPoster(slide.muxPlaybackId) : null);

            return (
              <div
                key={slide.id}
                className={`ff-home-spot-carousel__slide${isActive ? " is-active" : ""}`}
                aria-hidden={!isActive}
              >
                {slidePoster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={isActive ? posterRef : undefined}
                    src={slidePoster}
                    alt=""
                    className="ff-home-spot-carousel__poster"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                ) : (
                  <div className="ff-home-spot-carousel__fallback">
                    <span>
                      {slide.brand} — {slide.title}
                    </span>
                  </div>
                )}

                {isActive && !reduceMotion && slide.sourceVideoUrl ? (
                  <video
                    ref={videoRef}
                    key={slide.id}
                    className="ff-home-spot-carousel__video"
                    src={slide.sourceVideoUrl}
                    muted
                    playsInline
                    preload="auto"
                  />
                ) : null}

                {isActive && !reduceMotion && slide.muxPlaybackId ? (
                  <MuxPlayer
                    ref={muxRef as React.RefObject<never>}
                    key={slide.id}
                    playbackId={slide.muxPlaybackId}
                    streamType="on-demand"
                    muted
                    playsInline
                    preload="auto"
                    poster={slidePoster ?? undefined}
                    className="ff-home-spot-carousel__mux"
                    nohotkeys
                  />
                ) : null}
              </div>
            );
          })}

          <div className="ff-home-spot-carousel__shade" aria-hidden="true" />
          <div className="ff-home-spot-carousel__caption">
            <p className="ff-home-spot-carousel__brand">{active.brand}</p>
            <p className="ff-home-spot-carousel__title">{active.title}</p>
            <p className="ff-home-spot-carousel__director">
              Dir. {active.directorName}
            </p>
          </div>
        </div>
      </Link>

      <div className="ff-home-spot-carousel__controls">
        <div
          className="ff-home-spot-carousel__dots"
          role="tablist"
          aria-label="Spot slides"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            const isRunning = isActive && progressRunning && !reduceMotion;

            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${slide.brand} ${slide.title}`}
                className={`ff-home-spot-carousel__dot${isActive ? " is-active" : ""}`}
                onClick={() => goTo(index)}
              >
                <span
                  key={isActive ? `progress-${progressEpoch}` : slide.id}
                  className={`ff-home-spot-carousel__dot-fill${isRunning ? " is-running" : ""}${isPast ? " is-complete" : ""}`}
                  style={
                    {
                      "--ff-spot-clip-duration": `${clipDuration}s`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <p className="ff-home-spot-carousel__hint">
          <span className="sr-only">Current spot: </span>
          {active.brand} — {active.title}
        </p>
      </div>
      </div>
    </section>
  );
}
