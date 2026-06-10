"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MEDIA } from "./system";

type Props = {
  /** Overlay label on the preview tile. Omit for no label. */
  label?: string;
  videoSrc: string;
  /** When set, clicking the tile opens the video in a lightbox. */
  lightboxTitle?: string;
};

export function PartnerVideo({ label, videoSrc, lightboxTitle }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const preview = (
    <>
      <video
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="versant-card-image absolute inset-0 h-full w-full object-cover opacity-[0.9]"
      />
      <div className="absolute inset-0 bg-[var(--versant-black)]/12 transition duration-500 group-hover:bg-[var(--versant-black)]/5" />
      {label && (
        <div className="absolute bottom-3 left-3 text-[12px] font-medium leading-none tracking-[-0.01em] text-white/76">
          {label}
        </div>
      )}
    </>
  );

  if (!lightboxTitle) {
    return (
      <div className={`${MEDIA} relative aspect-video bg-black/70`} aria-hidden="true">
        {preview}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${lightboxTitle}`}
        className={`${MEDIA} relative block aspect-video w-full cursor-pointer bg-black/70 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
      >
        {preview}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxTitle}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-[4px] bg-[var(--versant-black)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/12 px-4 py-3 text-white sm:px-5">
              <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
                {lightboxTitle}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-white text-black transition hover:bg-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Close video"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={videoSrc}
              autoPlay
              controls
              playsInline
              className="block w-full"
              style={{ aspectRatio: "16 / 9" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
