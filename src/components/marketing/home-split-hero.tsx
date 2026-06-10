"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import {
  HOME_SPLASH_POSTER,
  HOME_SPLASH_VIDEO_MP4,
} from "@/lib/marketing/home-splash";

export type HomeSplitHeroSlide = {
  slug: string;
  name: string;
  stillUrl: string | null;
  muxPlaybackId?: string | null;
  sourceVideoUrl?: string | null;
};

type HomeSplitHeroProps = {
  slides: HomeSplitHeroSlide[];
};

export function HomeSplitHero({ slides }: HomeSplitHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? null;
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="ff-home-split-hero" aria-label="Friends and Family">
      <div className="ff-home-split-hero__copy">
        <div className="ff-home-split-hero__copy-inner">
          <h1 className="ff-home-split-hero__title">
            <span className="ff-home-split-hero__title-line">Friends &amp;</span>
            <span className="ff-home-split-hero__title-line">Family</span>
          </h1>
          <p className="ff-home-split-hero__tagline">
            Directors, production, post
          </p>
          <div className="ff-home-split-hero__rule" aria-hidden="true" />
          <p className="ff-home-split-hero__locations">
            Los Angeles · New York · Brazil
          </p>
          <Link href="/site/work" className="ff-home-split-hero__cta ff-link-small">
            View work
          </Link>
        </div>
      </div>

      <div className="ff-home-split-hero__media" aria-hidden={slides.length === 0}>
        <div className="ff-home-split-hero__media-frame ff-media-frame aspect-video min-[992px]:aspect-auto">
          {slides.length > 0 ? (
            <>
              {slides.map((slide, index) => (
                <div
                  key={slide.slug}
                  className={[
                    "ff-home-split-hero__slide",
                    index === activeIndex ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {slide.stillUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.stillUrl}
                      alt=""
                      className="ff-media-image ff-media-fill is-loaded"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      width={1280}
                      height={720}
                    />
                  ) : (
                    <div className="ff-media-fallback">
                      <span>{slide.name}</span>
                    </div>
                  )}
                  {index === activeIndex && slide.muxPlaybackId && (
                    <div
                      className="ff-media-fill opacity-0 animate-[fadeIn_300ms_ease-out_forwards] [&_mux-player]:h-full [&_mux-player]:w-full"
                      style={
                        {
                          "--controls": "none",
                          "--media-object-fit": "cover",
                        } as React.CSSProperties
                      }
                    >
                      <MuxPlayer
                        playbackId={slide.muxPlaybackId}
                        streamType="on-demand"
                        autoPlay="muted"
                        muted
                        loop
                        playsInline
                        nohotkeys
                      />
                    </div>
                  )}
                  {index === activeIndex &&
                    !slide.muxPlaybackId &&
                    slide.sourceVideoUrl && (
                      <video
                        className="ff-media-fill object-cover"
                        src={slide.sourceVideoUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="none"
                      />
                    )}
                </div>
              ))}
            </>
          ) : (
            <video
              className="ff-home-split-hero__fallback-video ff-media-fill object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={HOME_SPLASH_POSTER}
            >
              <source src={HOME_SPLASH_VIDEO_MP4} type="video/mp4" />
            </video>
          )}
        </div>
        {slides.length > 1 && activeSlide && (
          <p className="ff-home-split-hero__caption ff-copy-small">
            {activeSlide.name}
          </p>
        )}
      </div>
    </section>
  );
}
