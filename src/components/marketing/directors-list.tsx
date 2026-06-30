"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { prepareMarketingCardSourceForTransition } from "@/components/marketing/prepare-marketing-card-source";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";

export type DirectorsListItem = {
  slug: string;
  name: string;
  stillUrl?: string | null;
  muxPlaybackId?: string | null;
  sourceVideoUrl?: string | null;
  playProjectId?: string | null;
};

type DirectorsListProps = {
  directors: DirectorsListItem[];
};

function directorHref(director: DirectorsListItem) {
  return director.playProjectId
    ? `/site/directors/${director.slug}?play=${director.playProjectId}`
    : `/site/directors/${director.slug}`;
}

export function DirectorsList({ directors }: DirectorsListProps) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [exiting, setExiting] = useState<{ slug: string; url: string } | null>(
    null,
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  // Track the previously-rendered director so a director→director switch can
  // dissolve the outgoing still over the incoming frame (a "film cut").
  const prevSlugRef = useRef<string | null>(null);
  const prevStillRef = useRef<string | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const activeDirector =
    directors.find((director) => director.slug === activeSlug) ?? null;

  // Detect a real director→director change and arm the dissolving still.
  // Skips first-hover (no previous), leave (no next), and missing outgoing
  // still (fallback tile has nothing to fade).
  useEffect(() => {
    const nextSlug = activeDirector?.slug ?? null;
    const prevSlug = prevSlugRef.current;
    const prevStill = prevStillRef.current;
    if (prevSlug && nextSlug && prevSlug !== nextSlug && prevStill) {
      setExiting({ slug: prevSlug, url: prevStill });
    }
    prevSlugRef.current = nextSlug;
    prevStillRef.current = activeDirector?.stillUrl ?? null;
  }, [activeDirector?.slug, activeDirector?.stillUrl]);

  // Clear the dissolving still once the fade completes (>= 280ms animation).
  useEffect(() => {
    if (!exiting) return;
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
    }
    exitTimerRef.current = window.setTimeout(() => {
      setExiting(null);
      exitTimerRef.current = null;
    }, 300);
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [exiting]);

  useEffect(() => {
    setImageLoaded(false);
  }, [activeDirector?.stillUrl]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [activeDirector?.stillUrl]);

  const handleClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    director: DirectorsListItem,
  ) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    // Never let a decorative dissolve overlap the morph handoff.
    setExiting(null);

    if (activeSlug !== director.slug) {
      setActiveSlug(director.slug);
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });
    }

    const href = directorHref(director);
    const sourceElement = previewFrameRef.current;
    const sourceNameElement = event.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-director-name-source]",
    );

    await prepareMarketingCardSourceForTransition(
      event.currentTarget,
      sourceElement,
      imageRef,
    );

    const posterUrl =
      imageRef.current?.currentSrc ||
      imageRef.current?.src ||
      director.stillUrl ||
      null;

    await startMarketingViewTransition(router, href, {
      sourceElement,
      sourceNameElement,
      imageUrl: posterUrl,
      directorName: director.name,
      directorSlug: director.slug,
    });
  };

  const activateDirector = (slug: string) => setActiveSlug(slug);

  return (
    <section
      className={`ff-directors-list${activeSlug ? " has-active" : ""}`}
      aria-labelledby="directors-list-heading"
      onMouseLeave={() => setActiveSlug(null)}
    >
      <h1 id="directors-list-heading" className="sr-only">
        Directors
      </h1>
      <div className="ff-directors-list__inner">
        <div className="ff-directors-list__spacer" aria-hidden="true" />
        <nav aria-label="Director roster" className="ff-directors-list__nav">
          <ul className="ff-directors-list__list">
            {directors.map((director) => {
              const isActive = activeSlug === director.slug;
              return (
                <li
                  key={director.slug}
                  className="ff-directors-list__item"
                  onMouseEnter={() => activateDirector(director.slug)}
                >
                  <Link
                    href={directorHref(director)}
                    onClick={(event) => handleClick(event, director)}
                    onFocus={() => activateDirector(director.slug)}
                    className={[
                      "ff-directors-list__link ff-focusable",
                      isActive ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    prefetch={!director.playProjectId}
                    data-director-slug={director.slug}
                  >
                    <span
                      data-marketing-director-name-source
                      className="ff-directors-list__name"
                    >
                      {/* Real name for AT; letters are an aria-hidden visual so
                          the per-letter lift never affects the morph (the name
                          overlay is built from the string, not this DOM). */}
                      <span className="sr-only">{director.name}</span>
                      <span
                        aria-hidden="true"
                        className="ff-directors-list__name-visual"
                      >
                        {Array.from(director.name).map((ch, ci) => (
                          <span
                            key={ci}
                            className="ff-directors-list__char"
                            style={{ transitionDelay: `${ci * 16}ms` }}
                          >
                            {ch === " " ? " " : ch}
                          </span>
                        ))}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <aside
          className="ff-directors-list__preview"
          aria-hidden={!activeDirector}
          aria-live="polite"
        >
          {activeDirector?.stillUrl ? (
            <div
              ref={previewFrameRef}
              data-marketing-media-frame
              className="ff-directors-list__preview-frame ff-media-frame aspect-video is-visible"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={activeDirector.stillUrl}
                alt=""
                className={`ff-media-image ff-media-fill${imageLoaded ? " is-loaded" : ""}`}
                loading="eager"
                decoding="async"
                width={1280}
                height={720}
                onLoad={() => setImageLoaded(true)}
              />
              {activeDirector.muxPlaybackId && (
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
                    playbackId={activeDirector.muxPlaybackId}
                    streamType="on-demand"
                    autoPlay="muted"
                    muted
                    loop
                    playsInline
                    nohotkeys
                  />
                </div>
              )}
              {!activeDirector.muxPlaybackId &&
                activeDirector.sourceVideoUrl && (
                  <video
                    className="ff-media-fill object-cover"
                    src={activeDirector.sourceVideoUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="none"
                  />
                )}
              {exiting && (
                // Decorative outgoing still — dissolves to reveal the incoming
                // frame. Rendered LAST so the morph's querySelector("img")
                // keeps returning the incoming poster. No ref / no morph attrs.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={exiting.slug}
                  src={exiting.url}
                  alt=""
                  aria-hidden="true"
                  className="ff-directors-list__exit-still"
                />
              )}
            </div>
          ) : activeDirector ? (
            <div
              ref={previewFrameRef}
              data-marketing-media-frame
              className="ff-directors-list__preview-frame ff-media-frame aspect-[16/10] is-visible"
            >
              <div className="ff-media-fallback">
                <span>{activeDirector.name}</span>
              </div>
              {exiting && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={exiting.slug}
                  src={exiting.url}
                  alt=""
                  aria-hidden="true"
                  className="ff-directors-list__exit-still"
                />
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
