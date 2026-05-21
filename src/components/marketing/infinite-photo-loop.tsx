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

const PHOTO_LAYOUTS = [
  "col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3",
  "col-span-2 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-2",
  "col-span-1 row-span-2 md:col-span-2 md:row-span-3 lg:col-span-2 lg:row-span-3",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2",
  "col-span-2 row-span-2 md:col-span-3 md:row-span-2 lg:col-span-5 lg:row-span-3",
  "col-span-2 row-span-1 md:col-span-3 md:row-span-2 lg:col-span-4 lg:row-span-2",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  "col-span-1 row-span-2 md:col-span-2 md:row-span-3 lg:col-span-3 lg:row-span-3",
] as const;

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
  const appendLockRef = useRef(false);
  const lastAppendScrollYRef = useRef(Number.NEGATIVE_INFINITY);
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
    appendLockRef.current = false;
    lastAppendScrollYRef.current = Number.NEGATIVE_INFINITY;
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
          const scrollY = window.scrollY;
          if (
            appendLockRef.current ||
            scrollY - lastAppendScrollYRef.current < 160
          ) {
            return;
          }

          appendLockRef.current = true;
          lastAppendScrollYRef.current = scrollY;
          appendPhotos(chunkSize, true);
          window.setTimeout(() => {
            appendLockRef.current = false;
          }, 260);
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
          "grid grid-flow-dense auto-rows-[72px] grid-cols-4 gap-1 md:auto-rows-[92px] md:grid-cols-6 lg:auto-rows-[118px] lg:grid-cols-12",
          className,
        )}
      >
        {renderedPhotos.map((photo, index) => (
          <figure
            key={photo.key}
            className={cn(
              "about-photo-loop__item ff-media-frame group",
              PHOTO_LAYOUTS[index % PHOTO_LAYOUTS.length],
            )}
            style={
              photo.batch > 0
                ? ({
                    "--about-photo-delay": `${(index % 8) * 45}ms`,
                    animation: "aboutPhotoLoopFade 300ms ease-out both",
                  } as React.CSSProperties)
                : undefined
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="ff-media-image about-photo-loop__image grayscale-[12%] group-hover:grayscale-0"
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

        @keyframes aboutPhotoLoopBreathe {
          0% {
            transform: scale(1.035) translate3d(-0.45rem, -0.25rem, 0);
          }
          100% {
            transform: scale(1.08) translate3d(0.45rem, 0.3rem, 0);
          }
        }

        .about-photo-loop__item {
          min-height: 0;
        }

        .about-photo-loop__image {
          transform: scale(1.04);
          animation: aboutPhotoLoopBreathe 8s ease-in-out infinite alternate;
          animation-delay: var(--about-photo-delay, 0ms);
          transition:
            filter var(--ff-duration-fast) var(--ff-ease-out),
            transform 900ms var(--ff-ease-out);
        }

        .about-photo-loop__item:nth-child(3n) .about-photo-loop__image {
          animation-duration: 10s;
        }

        .about-photo-loop__item:nth-child(4n) .about-photo-loop__image {
          animation-direction: alternate-reverse;
        }

        .about-photo-loop__item:hover .about-photo-loop__image {
          transform: scale(1.02);
        }

        @media (prefers-reduced-motion: reduce) {
          .about-photo-loop__item,
          .about-photo-loop__image {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
