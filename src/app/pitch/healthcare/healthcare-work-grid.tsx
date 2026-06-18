"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import MuxPlayer, {
  type MuxPlayerCSSProperties,
} from "@mux/mux-player-react";
import { X } from "lucide-react";

type HealthcareProject = {
  id: string;
  brand: string;
  title: string;
  year: number | null;
  agency: string | null;
  thumbnailUrl: string | null;
  sourceVideoUrl: string | null;
  muxPlaybackId: string | null;
  duration?: number | null;
  director: { name: string };
};

const BRAND_DISPLAY_NAMES: Record<string, string> = {
  Trihealth: "TriHealth",
};

const PLAYER_STYLE = {
  width: "100%",
  aspectRatio: "16 / 9",
  "--media-object-fit": "contain",
} satisfies MuxPlayerCSSProperties;

function brandName(project: HealthcareProject) {
  return BRAND_DISPLAY_NAMES[project.brand] ?? project.brand;
}

function mediaTitle(project: HealthcareProject) {
  return `${brandName(project)} ${project.title}`;
}

export function HealthcareLightboxController({
  projects,
}: {
  projects: HealthcareProject[];
}) {
  const [activeProject, setActiveProject] =
    useState<HealthcareProject | null>(null);
  const [mounted, setMounted] = useState(false);
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest<HTMLButtonElement>(
        "[data-healthcare-lightbox-id]",
      );
      if (!trigger) return;

      const projectId = trigger.dataset.healthcareLightboxId;
      if (!projectId) return;

      const project = projectsById.get(projectId);
      if (!project) return;

      event.preventDefault();
      setActiveProject(project);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [projectsById]);

  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  if (!mounted) return null;

  if (!activeProject) {
    return <span data-healthcare-lightbox-controller="ready" hidden />;
  }

  return createPortal(
    <HealthcareSpotLightbox
      project={activeProject}
      onClose={() => setActiveProject(null)}
    />,
    document.body,
  );
}

function HealthcareSpotLightbox({
  project,
  onClose,
}: {
  project: HealthcareProject;
  onClose: () => void;
}) {
  const title = mediaTitle(project);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/88 px-3 py-6 text-white backdrop-blur-md sm:px-6 lg:px-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-[4px] bg-[#080807] shadow-[0_24px_90px_rgba(0,0,0,0.48)] ring-1 ring-white/14"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/12 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
              {title}
            </p>
            <p className="mt-1 truncate text-[11px] font-medium tracking-[-0.005em] text-white/48">
              Directed by {project.director.name}
              {project.agency ? ` · ${project.agency}` : ""}
              {project.year ? ` · ${project.year}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-white text-black transition hover:bg-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close video"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {project.muxPlaybackId ? (
          <MuxPlayer
            playbackId={project.muxPlaybackId}
            streamType="on-demand"
            autoPlay
            playsInline
            metadata={{ video_title: title }}
            primaryColor="#ffffff"
            secondaryColor="#080807"
            accentColor="#B19343"
            style={PLAYER_STYLE}
          />
        ) : project.sourceVideoUrl ? (
          <video
            src={project.sourceVideoUrl}
            poster={project.thumbnailUrl ?? undefined}
            className="aspect-video w-full bg-black object-contain"
            autoPlay
            controls
            playsInline
          />
        ) : null}
      </div>
    </div>
  );
}
