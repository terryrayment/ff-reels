"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Photo = {
  src: string;
  alt: string;
};

type RenderedPhoto = Photo & {
  batch: number;
  key: string;
};

type InfinitePhotoLoopProps = {
  photos: Photo[];
  /** How many photos in the initial first chunk. Default 24. */
  initialCount?: number;
  /** How many photos to append each time the sentinel is reached. Default 16. */
  chunkSize?: number;
  /** Optional Tailwind class on the outer grid. */
  className?: string;
};

function shufflePhotos(photos: Photo[]) {
  const shuffled = [...photos];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function buildChunk(photos: Photo[], count: number) {
  const chunk: Photo[] = [];

  while (chunk.length < count && photos.length > 0) {
    chunk.push(...shufflePhotos(photos));
  }

  return chunk.slice(0, count);
}

export function InfinitePhotoLoop({
  photos,
  initialCount = 24,
  chunkSize = 16,
  className,
}: InfinitePhotoLoopProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const batchRef = useRef(0);
  const keyRef = useRef(0);
  const initializedRef = useRef(false);
  const [renderedPhotos, setRenderedPhotos] = useState<RenderedPhoto[]>([]);

  const appendPhotos = useCallback(
    (count: number, animate: boolean) => {
      if (photos.length === 0 || count <= 0) {
        return;
      }

      const batch = animate ? batchRef.current + 1 : batchRef.current;
      if (animate) {
        batchRef.current = batch;
      }

      const nextPhotos = buildChunk(photos, count).map((photo) => ({
        ...photo,
        batch,
        key: `${batch}-${keyRef.current++}-${photo.src}`,
      }));

      setRenderedPhotos((current) => [...current, ...nextPhotos]);
    },
    [photos],
  );

  useEffect(() => {
    initializedRef.current = false;
    batchRef.current = 0;
    keyRef.current = 0;
    setRenderedPhotos([]);
    appendPhotos(initialCount, false);
    initializedRef.current = true;
  }, [appendPhotos, initialCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      renderedPhotos.length === 0 ||
      !sentinel ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!initializedRef.current) {
          return;
        }

        if (entries.some((entry) => entry.isIntersecting)) {
          appendPhotos(chunkSize, true);
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [appendPhotos, chunkSize, renderedPhotos.length]);

  return (
    <>
      <div
        className={cn(
          "grid min-h-[calc(((((100vw-3rem)-0.25rem)/2)*12)+2.75rem)] grid-cols-2 gap-1 md:min-h-[calc(((((100vw-3rem)-0.5rem)/3)*8)+1.75rem)] md:grid-cols-3 lg:min-h-[calc(((((min(100vw,1400px)-5rem)-0.75rem)/4)*6)+1.25rem)] lg:grid-cols-4",
          className,
        )}
      >
        {renderedPhotos.map((photo) => (
          <figure
            key={photo.key}
            className="about-photo-loop__item group relative aspect-square overflow-hidden bg-ff-line-soft"
            style={
              photo.batch > 0
                ? { animation: "aboutPhotoLoopFade 300ms ease-out both" }
                : undefined
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover grayscale-[12%] transition duration-[900ms] ease-out group-hover:scale-[1.035] group-hover:grayscale-0"
            />
          </figure>
        ))}
        <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      </div>

      <style jsx>{`
        @keyframes aboutPhotoLoopFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-photo-loop__item {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
