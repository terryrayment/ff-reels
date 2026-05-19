"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import MuxPlayer from "@mux/mux-player-react";

export interface LightboxProject {
  id: string;
  title: string;
  brand?: string | null;
  year?: number | null;
  agency?: string | null;
  muxPlaybackId: string;
  director: { name: string };
}

interface ReelLightboxProps {
  project: LightboxProject | null;
  onClose: () => void;
}

export function ReelLightbox({ project, onClose }: ReelLightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-ff"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close reel"
              className="absolute -top-10 right-0 font-helveticaText text-ff-micro uppercase tracking-ff-wide text-white/70 transition-colors hover:text-white"
            >
              Close
            </button>

            <div
              className="relative aspect-video bg-black overflow-hidden [&_mux-player]:w-full [&_mux-player]:h-full"
              style={
                {
                  "--media-object-fit": "contain",
                } as React.CSSProperties
              }
            >
              <MuxPlayer
                playbackId={project.muxPlaybackId}
                streamType="on-demand"
                autoPlay
                muted={false}
                playsInline
              />
            </div>

            <div className="mt-5 flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 text-white font-helveticaText">
              <div>
                {project.brand && (
                  <p className="text-ff-label font-medium uppercase tracking-ff-label text-white/70">
                    {project.brand}
                  </p>
                )}
                <p className="ff-display-card mt-1 text-white">
                  {project.title}
                </p>
              </div>
              <p className="ff-meta text-white/60">
                Dir. {project.director.name}
                {project.agency ? ` · ${project.agency}` : ""}
                {project.year ? ` · ${project.year}` : ""}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
