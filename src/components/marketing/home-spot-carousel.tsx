"use client";

import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { prepareMarketingCardSourceForTransition } from "@/components/marketing/prepare-marketing-card-source";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";
import { cn } from "@/lib/utils";
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

function formatIndexLabel(index: number) {
  return String(index + 1).padStart(2, "0");
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
  const sectionRef = useRef<HTMLElement>(null);
  const [mediaReady, setMediaReady] = useState(false);

  const active = slides[activeIndex] ?? slides[0];
  const clipDuration = HOME_SPOT_CLIP_DURATION_SECONDS;
  const clipDurationMs = clipDuration * 1000;
  const clipProgressRunning = progressRunning && !reduceMotion;

  useEffect(() => {
    setProgressRunning(false);
    setMediaReady(false);
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
    const sourceElement = sectionRef.current?.querySelector<HTMLElement>(
      "[data-marketing-media-frame]",
    );
    if (!sourceElement) return;
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
      ref={sectionRef}
      className="ff-home-spot-carousel ff-shell"
      aria-label="Featured spots"
      aria-roledescription="carousel"
    >
      <div className="ff-home-spot-carousel__split">
        <div className="ff-home-spot-carousel__media-col">
          <Link
            href={active.href}
            className="ff-home-spot-carousel__link"
            data-cursor="link"
            onClick={handleOpenSpot}
            aria-label={`${active.brand} ${active.title}, Dir. ${active.directorName}`}
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
                        className={cn(
                          "ff-home-spot-carousel__video",
                          mediaReady && "is-ready",
                        )}
                        src={slide.sourceVideoUrl}
                        width={1920}
                        height={1080}
                        muted
                        playsInline
                        preload="auto"
                        onLoadedData={() => setMediaReady(true)}
                        onCanPlay={() => setMediaReady(true)}
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
            </div>
          </Link>
        </div>

        <div className="ff-home-spot-carousel__editorial">
          <div className="ff-home-spot-carousel__active" aria-live="polite">
            <span
              key={`indicator-${progressEpoch}`}
              className={cn(
                "ff-home-spot-carousel__active-indicator",
                clipProgressRunning && "is-running",
                reduceMotion && "is-reduced-motion",
              )}
              style={
                {
                  "--ff-spot-clip-duration": `${clipDuration}s`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
            <span className="ff-home-spot-carousel__active-num">
              {formatIndexLabel(activeIndex)}
            </span>
            <Link
              href={active.href}
              className="ff-home-spot-carousel__active-link ff-focusable"
              data-cursor="link"
              onClick={handleOpenSpot}
              aria-label={`${active.brand} ${active.title}, Dir. ${active.directorName}`}
            >
              <span className="ff-home-spot-carousel__active-brand">
                {active.brand}
              </span>
              <span className="ff-home-spot-carousel__active-title">
                {active.title}
              </span>
            </Link>
            <p className="ff-home-spot-carousel__active-director">
              Dir. {active.directorName}
            </p>
            <Link
              href={active.href}
              className="ff-home-spot-carousel__active-action ff-focusable"
              data-cursor="link"
              onClick={handleOpenSpot}
            >
              View project
            </Link>
          </div>

          <nav
            className="ff-home-spot-carousel__next"
            aria-label="Next featured spots"
          >
            <p className="ff-home-spot-carousel__next-label">NEXT</p>
            <ol className="ff-home-spot-carousel__next-list">
              {slides.map((slide, index) => {
                if (index === activeIndex) return null;

                return (
                  <li key={slide.id} className="ff-home-spot-carousel__next-item">
                    <button
                      type="button"
                      className="ff-home-spot-carousel__next-row ff-focusable"
                      aria-label={`Show ${slide.brand} ${slide.title}`}
                      onClick={() => goTo(index)}
                    >
                      <span className="ff-home-spot-carousel__next-num">
                        {formatIndexLabel(index)}
                      </span>
                      <span className="ff-home-spot-carousel__next-copy">
                        {slide.brand} — {slide.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
