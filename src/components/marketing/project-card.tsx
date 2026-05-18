"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startMarketingViewTransition } from "@/components/marketing/view-transition";

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
}

export function ProjectCard({
  project,
  showDirector = true,
  disciplineLabel,
  showYear = false,
  showAgency = false,
  thumbnailWidth = 1000,
}: ProjectCardProps) {
  const router = useRouter();
  const href = `/site/directors/${project.director.slug}?play=${project.id}`;

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
      className="group block"
      prefetch
    >
      <div
        data-marketing-media-frame
        className="relative aspect-video overflow-hidden bg-[#EEEDEA]"
      >
        {still && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={still}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.015] group-hover:opacity-95"
          />
        )}
      </div>
      <div className="mt-4">
        {project.brand && (
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A] font-medium font-helveticaText">
            {project.brand}
          </p>
        )}
        <p className="text-[20px] md:text-[24px] font-medium text-[#1A1A1A] leading-[1.05] mt-1.5 font-helveticaDisplay">
          {project.title}
        </p>
        {metaLine && (
          <p className="text-[11px] text-[#666] mt-2 font-helveticaText leading-snug">
            {metaLine}
          </p>
        )}
      </div>
    </Link>
  );
}
