"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";

interface DirectorCardProps {
  slug: string;
  name: string;
  /** Tagline / positioning line (short). Defaults to first category. */
  positioning?: string | null;
  /** Still image URL (heroThumbnailUrl ?? headshotUrl ?? Mux thumbnail fallback). */
  stillUrl: string | null;
  /** Mux playback ID for hover-to-play loop. */
  muxPlaybackId?: string | null;
  /** Optional project to open and autoplay when the director has no intro reel. */
  playProjectId?: string | null;
}

export function DirectorCard({
  slug,
  name,
  positioning,
  stillUrl,
  muxPlaybackId,
  playProjectId,
}: DirectorCardProps) {
  const [hovering, setHovering] = useState(false);
  const router = useRouter();
  const href = playProjectId
    ? `/site/directors/${slug}?play=${playProjectId}`
    : `/site/directors/${slug}`;

  const onEnter = () => setHovering(true);
  const onLeave = () => setHovering(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const sourceElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-media-frame]",
    );
    const sourceNameElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-director-name-source]",
    );
    startMarketingViewTransition(router, href, {
      sourceElement,
      sourceNameElement,
      imageUrl: stillUrl,
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
      className="ff-focusable group block"
      prefetch
    >
      <div
        data-marketing-media-frame
        className="ff-media-frame aspect-video"
      >
        {stillUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stillUrl}
            alt={name}
            className="ff-media-image ff-media-fill"
            loading="lazy"
          />
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
      </div>
      <div className="mt-3.5 flex items-baseline justify-between gap-4">
        <h3
          className="ff-display-card"
          data-marketing-director-name-source
        >
          {name}
        </h3>
        {positioning && (
          <span className="ff-card-positioning">
            {positioning}
          </span>
        )}
      </div>
    </Link>
  );
}
