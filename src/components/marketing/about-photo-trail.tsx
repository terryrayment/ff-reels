"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AboutPhoto } from "@/lib/about/photos";

type TrailPhoto = {
  id: number;
  src: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  rotate: number;
  z: number;
};

interface AboutPhotoTrailProps {
  photos: AboutPhoto[];
}

const WIDTHS = [112, 140, 96, 166, 122, 150, 104, 134];
const ROTATIONS = [-5, 3, -2, 6, -7, 2, 5, -3];
const MIN_DISTANCE = 62;
const NAV_SAFE_TOP = 88;

export function AboutPhotoTrail({ photos }: AboutPhotoTrailProps) {
  const [trail, setTrail] = useState<TrailPhoto[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const nextId = useRef(0);

  const usablePhotos = useMemo(() => photos.filter((photo) => photo.src), [photos]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const addPhoto = useCallback(
    (x: number, y: number, force = false) => {
      if (usablePhotos.length === 0) return;

      const last = lastPoint.current;
      if (!last) {
        lastPoint.current = { x, y };
        if (!force) return;
      }

      if (last && !force) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (Math.hypot(dx, dy) < MIN_DISTANCE) return;
      }

      lastPoint.current = { x, y };
      const id = nextId.current;
      nextId.current += 1;
      const photo = usablePhotos[id % usablePhotos.length];
      const width = WIDTHS[id % WIDTHS.length];
      const safeY = Math.max(y, NAV_SAFE_TOP + width * 0.6);

      setTrail((items) => [
        ...items,
        {
          id,
          src: photo.src,
          alt: photo.alt,
          x,
          y: safeY,
          width,
          rotate: reduceMotion ? 0 : ROTATIONS[id % ROTATIONS.length],
          z: id + 1,
        },
      ]);
    },
    [reduceMotion, usablePhotos],
  );

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-white"
      aria-label="Friends and Family photo field"
      onPointerMove={(event) => addPhoto(event.clientX, event.clientY)}
      onPointerDown={(event) =>
        addPhoto(event.clientX, event.clientY, event.pointerType !== "mouse")
      }
    >
      <div aria-hidden="true" className="absolute inset-0">
        {trail.map((photo) => (
          <img
            key={photo.id}
            src={photo.src}
            alt=""
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute select-none object-cover shadow-[0_18px_50px_rgba(17,17,17,0.12)]"
            style={{
              left: photo.x,
              top: photo.y,
              width: photo.width,
              zIndex: photo.z,
              transform: `translate(-50%, -50%) rotate(${photo.rotate}deg)`,
            }}
          />
        ))}
      </div>
      <p className="sr-only">
        Move the cursor around the page to leave a permanent trail of Friends
        and Family archive photographs.
      </p>
    </section>
  );
}
