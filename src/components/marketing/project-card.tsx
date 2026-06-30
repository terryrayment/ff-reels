"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";
import { prepareMarketingCardSourceForTransition } from "@/components/marketing/prepare-marketing-card-source";
import { resolveProjectCardPlayId } from "@/lib/marketing/play-project-id";
import { useRevealOnce } from "@/components/marketing/use-reveal-once";

export interface ProjectCardData {
  id: string;
  title: string;
  brand?: string | null;
  year?: number | null;
  agency?: string | null;
  thumbnailUrl?: string | null;
  muxPlaybackId?: string | null;
  sourceVideoUrl?: string | null;
  playProjectId?: string | null;
  director: { slug: string; name: string };
}

interface ProjectCardProps {
  project: ProjectCardData;
  /** Show "Dir. [Name]" line. Default true. Skip on director-detail pages. */
  showDirector?: boolean;
  /** Append discipline label after director on the meta line. */
  disciplineLabel?: string | null;
  /** Append year after director on the meta line. */
  showYear?: boolean;
  /** Append agency after director on the meta line. */
  showAgency?: boolean;
  /** Thumbnail width to request from Mux. Default 1000. */
  thumbnailWidth?: number;
  /** Optional archive index label, e.g. "01". */
  indexLabel?: string;
  /** Optional archive index meta, e.g. "Commercial". */
  indexMeta?: string | null;
  /** Optional editorial tags shown below card meta. */
  tags?: readonly string[];
  /** Eagerly load important above-the-fold thumbnails. */
  imagePriority?: boolean;
}

export function ProjectCard({
  project,
  showDirector = true,
  disciplineLabel,
  showYear = false,
  showAgency = false,
  thumbnailWidth = 1000,
  indexLabel,
  indexMeta,
  tags,
  imagePriority = false,
}: ProjectCardProps) {
  const router = useRouter();
  const directorSlug = project.director.slug.trim();
  const playProjectId = resolveProjectCardPlayId(project);
  const canOpenViewer = Boolean(
    playProjectId &&
      (project.muxPlaybackId || project.sourceVideoUrl || project.thumbnailUrl),
  );
  const canPlay = Boolean(playProjectId && (project.muxPlaybackId || project.sourceVideoUrl));
  const href = directorSlug
    ? canOpenViewer
      ? `/site/directors/${directorSlug}?play=${playProjectId}`
      : `/site/directors/${directorSlug}`
    : null;
  const [mediaRef, mediaVisible] = useRevealOnce<HTMLDivElement>();
  const imageRef = useRef<HTMLImageElement>(null);

  const muxStill = project.muxPlaybackId
    ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=${thumbnailWidth}`
    : null;
  const preferredStill = muxStill ?? project.thumbnailUrl ?? null;
  const [failedStill, setFailedStill] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const still = useMemo(() => {
    if (!preferredStill) return null;
    if (failedStill !== preferredStill) return preferredStill;
    return muxStill && muxStill !== preferredStill ? muxStill : null;
  }, [failedStill, muxStill, preferredStill]);

  useEffect(() => {
    setImageLoaded(false);
  }, [still]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [still]);

  const metaParts: string[] = [];
  if (showDirector) metaParts.push(`Dir. ${project.director.name}`);
  if (showAgency && project.agency) metaParts.push(project.agency);
  if (disciplineLabel) metaParts.push(disciplineLabel);
  if (showYear && project.year) metaParts.push(String(project.year));
  const metaLine = metaParts.join(" · ");
  const displayIndexMeta =
    indexMeta &&
    indexMeta.trim().toLowerCase() !== project.brand?.trim().toLowerCase()
      ? indexMeta
      : null;
  const fallbackLabel = project.brand || project.title;
  const thumbnailHeight = Math.round((thumbnailWidth * 9) / 16);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (cmd/ctrl/shift) and middle-click follow default browser behaviour.
    if (!href) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    const sourceElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-media-frame]",
    );
    await prepareMarketingCardSourceForTransition(
      e.currentTarget,
      sourceElement,
      imageRef,
    );
    const posterUrl = imageRef.current?.currentSrc || imageRef.current?.src || still;
    await startMarketingViewTransition(router, href, {
      sourceElement,
      imageUrl: posterUrl,
    });
  };

  const cardContent = (
    <>
      {(indexLabel || displayIndexMeta) && (
        <div className="ff-card-index-row">
          <span>{indexLabel}</span>
          <span>{displayIndexMeta}</span>
        </div>
      )}
      <div
        ref={mediaRef}
        data-marketing-media-frame
        className={`ff-media-frame ff-media-reveal aspect-video${mediaVisible || imagePriority ? " is-visible" : ""}`}
      >
        {still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={still}
            alt={project.title}
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority={imagePriority ? "high" : "auto"}
            decoding="async"
            width={thumbnailWidth}
            height={thumbnailHeight}
            className={`ff-media-image${imageLoaded ? " is-loaded" : ""}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setFailedStill(still)}
          />
        ) : (
          <div className="ff-media-fallback">
            <span>{fallbackLabel}</span>
          </div>
        )}
      </div>
      <div className="mt-4 ff-card-caption">
        {project.brand ? (
          <>
            <p className="ff-display-card ff-card-client leading-[1.05]">
              {project.brand}
            </p>
            <p className="ff-display-card ff-card-title mt-1.5 leading-[1.05]">
              {project.title}
            </p>
          </>
        ) : (
          <p className="ff-display-card ff-card-client leading-[1.05]">
            {project.title}
          </p>
        )}
        {metaLine && (
          <p className="ff-display-card ff-card-director mt-2">
            {metaLine}
            {href && (
              <span className="ff-card-arrow" aria-hidden="true">
                →
              </span>
            )}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="ff-card-tag-row">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (!href) {
    return (
      <article className="ff-fluid-card group block">{cardContent}</article>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="ff-focusable ff-fluid-card group block"
      prefetch={!canOpenViewer}
      data-cursor={canPlay ? "play" : "link"}
    >
      {cardContent}
    </Link>
  );
}
