"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";
import { prepareMarketingCardSourceForTransition } from "@/components/marketing/prepare-marketing-card-source";
import { useRevealOnce } from "@/components/marketing/use-reveal-once";

interface DirectorCardProps {
  slug: string;
  name: string;
  /** Tagline / positioning line (short). Defaults to first category. */
  positioning?: string | null;
  /** Still image URL (heroThumbnailUrl ?? headshotUrl ?? Mux thumbnail fallback). */
  stillUrl: string | null;
  /** Mux playback ID for hover-to-play loop. */
  muxPlaybackId?: string | null;
  /** Source-site video URL for hover-to-play loop when the card is driven by canonical Webflow data. */
  sourceVideoUrl?: string | null;
  /** Optional project to open and autoplay when the director has no intro reel. */
  playProjectId?: string | null;
  /** Optional archive index label, e.g. "01". */
  indexLabel?: string;
  /** Optional archive index meta, e.g. "Director". */
  indexMeta?: string | null;
  /** Optional tags shown under the director name. */
  tags?: readonly string[];
}

export function DirectorCard({
  slug,
  name,
  positioning,
  stillUrl,
  muxPlaybackId,
  sourceVideoUrl,
  playProjectId,
  indexLabel,
  indexMeta,
  tags,
}: DirectorCardProps) {
  const [hovering, setHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const router = useRouter();
  const [mediaRef, mediaVisible] = useRevealOnce<HTMLDivElement>();
  const href = playProjectId
    ? `/site/directors/${slug}?play=${playProjectId}`
    : `/site/directors/${slug}`;

  const onEnter = () => setHovering(true);
  const onLeave = () => setHovering(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [stillUrl]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [stillUrl]);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    const sourceElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-media-frame]",
    );
    const sourceNameElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-director-name-source]",
    );
    await prepareMarketingCardSourceForTransition(
      e.currentTarget,
      sourceElement,
      imageRef,
    );
    const posterUrl = imageRef.current?.currentSrc || imageRef.current?.src || stillUrl;
    await startMarketingViewTransition(router, href, {
      sourceElement,
      sourceNameElement,
      imageUrl: posterUrl,
      directorName: name,
      directorSlug: slug,
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="ff-focusable ff-fluid-card group block"
      prefetch={!playProjectId}
    >
      {(indexLabel || indexMeta) && (
        <div className="ff-card-index-row">
          <span>{indexLabel}</span>
          <span>{indexMeta}</span>
        </div>
      )}
      <div
        ref={mediaRef}
        data-marketing-media-frame
        className={`ff-media-frame ff-media-reveal ${stillUrl ? "aspect-video" : "aspect-[16/10]"}${mediaVisible ? " is-visible" : ""}`}
      >
        {stillUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={stillUrl}
            alt={name}
            className={`ff-media-image ff-media-fill${imageLoaded ? " is-loaded" : ""}`}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="ff-media-fallback">
            <span>{name}</span>
          </div>
        )}
        {muxPlaybackId && hovering && (
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
              playbackId={muxPlaybackId}
              streamType="on-demand"
              autoPlay="muted"
              muted
              loop
              playsInline
              nohotkeys
            />
          </div>
        )}
        {!muxPlaybackId && sourceVideoUrl && hovering && (
          <video
            className="ff-media-fill object-cover opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
            src={sourceVideoUrl}
            muted
            autoPlay
            loop
            playsInline
            preload="none"
          />
        )}
      </div>
      <div className="mt-3.5 flex items-baseline justify-between gap-4">
        <h3 className="ff-display-card" data-marketing-director-name-source>
          {name}
        </h3>
        {positioning && (
          <span className="ff-card-positioning">{positioning}</span>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className="ff-card-tag-row">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
