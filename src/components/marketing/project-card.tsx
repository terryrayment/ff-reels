"use client";

import Link from "next/link";
import { useState } from "react";
import { ReelLightbox, type LightboxProject } from "./reel-lightbox";

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
  const [open, setOpen] = useState(false);

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

  const inner = (
    <>
      <div className="relative aspect-video overflow-hidden bg-[#EEEDEA]">
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
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1A1A1A] font-bold font-helveticaText">
            {project.brand}
          </p>
        )}
        <p className="text-[18px] md:text-[20px] tracking-tight-2 font-light text-[#1A1A1A] leading-[1.15] mt-1 font-helveticaDisplay">
          {project.title}
        </p>
        {metaLine && (
          <p className="text-[12px] tracking-tight text-[#666] mt-2 font-helveticaText">
            {metaLine}
          </p>
        )}
      </div>
    </>
  );

  if (!project.muxPlaybackId) {
    return (
      <Link
        href={`/site/directors/${project.director.slug}`}
        className="group block"
      >
        {inner}
      </Link>
    );
  }

  const lightboxProject: LightboxProject = {
    id: project.id,
    title: project.title,
    brand: project.brand,
    year: project.year,
    agency: project.agency,
    muxPlaybackId: project.muxPlaybackId,
    director: { name: project.director.name },
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block text-left w-full cursor-pointer"
      >
        {inner}
      </button>
      <ReelLightbox
        project={open ? lightboxProject : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
