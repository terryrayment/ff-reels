"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";
import { useRevealOnce } from "@/components/marketing/use-reveal-once";

export interface ProjectCardData {
  id: string;
  title: string;
  brand?: string | null;
  year?: number | null;
  agency?: string | null;
  thumbnailUrl?: string | null;
  muxPlaybackId?: string | null;
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
}: ProjectCardProps) {
  const router = useRouter();
  const href = `/site/directors/${project.director.slug}?play=${project.id}`;
  const [mediaRef, mediaVisible] = useRevealOnce<HTMLDivElement>();

  const still =
    project.thumbnailUrl ??
    (project.muxPlaybackId
      ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=${thumbnailWidth}`
      : null);

  const metaParts: string[] = [];
  if (showDirector) metaParts.push(`Dir. ${project.director.name}`);
  if (showAgency && project.agency) metaParts.push(project.agency);
  if (disciplineLabel) metaParts.push(disciplineLabel);
  if (showYear && project.year) metaParts.push(String(project.year));
  const metaLine = metaParts.join(" · ");
  const displayIndexMeta =
    indexMeta && indexMeta.trim().toLowerCase() !== project.brand?.trim().toLowerCase()
      ? indexMeta
      : null;
  const fallbackLabel = project.brand || project.title;
  const thumbnailHeight = Math.round(thumbnailWidth * 9 / 16);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (cmd/ctrl/shift) and middle-click follow default browser behaviour.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const sourceElement = e.currentTarget.querySelector<HTMLElement>(
      "[data-marketing-media-frame]",
    );
    startMarketingViewTransition(router, href, {
      sourceElement,
      imageUrl: still,
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="ff-focusable ff-fluid-card group block"
      prefetch
      data-cursor="play"
    >
      {(indexLabel || displayIndexMeta) && (
        <div className="ff-card-index-row">
          <span>{indexLabel}</span>
          <span>{displayIndexMeta}</span>
        </div>
      )}
      <div
        ref={mediaRef}
        data-marketing-media-frame
        className={`ff-media-frame ff-media-reveal aspect-video${mediaVisible ? " is-visible" : ""}`}
      >
        {still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={still}
            alt={project.title}
            loading="lazy"
            decoding="async"
            width={thumbnailWidth}
            height={thumbnailHeight}
            className="ff-media-image"
          />
        ) : (
          <div className="ff-media-fallback">
            <span>{fallbackLabel}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        {project.brand && (
          <p className="ff-card-brand">
            {project.brand}
          </p>
        )}
        <p className="ff-display-card mt-1.5 leading-[1.05]">
          {project.title}
        </p>
        {metaLine && (
          <p className="ff-meta mt-2">
            {metaLine}
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
    </Link>
  );
}
