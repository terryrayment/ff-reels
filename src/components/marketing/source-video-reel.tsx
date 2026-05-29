"use client";

import { useEffect, useRef, useState } from "react";

interface SourceVideoReelProps {
  projectId: string;
  sourceVideoUrl: string;
  posterUrl?: string | null;
  brand: string;
  title: string;
}

export function SourceVideoReel({
  projectId,
  sourceVideoUrl,
  posterUrl,
  brand,
  title,
}: SourceVideoReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);

    const video = videoRef.current;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true);
    }
  }, [projectId, sourceVideoUrl]);

  return (
    <section className="ff-shell mb-12">
      <div
        className="ff-media-frame ff-media-frame-dark aspect-video overflow-hidden bg-black transition-opacity duration-150"
        data-featured-project-id={projectId}
        data-marketing-featured-media-target
        data-marketing-media-ready={videoReady ? "video" : "poster"}
      >
        {posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            aria-hidden="true"
            data-marketing-poster-layer
            className={`ff-media-fill pointer-events-none object-cover transition-opacity duration-200 ease-out ${
              videoReady && !videoFailed ? "opacity-0" : "opacity-100"
            }`}
            decoding="async"
          />
        )}
        <video
          ref={videoRef}
          key={projectId}
          className={`h-full w-full object-cover transition-opacity duration-200 ease-out ${
            videoReady && !videoFailed ? "opacity-100" : "opacity-0"
          }`}
          src={sourceVideoUrl}
          poster={posterUrl ?? undefined}
          controls
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        />
      </div>
      <p className="ff-kicker-muted mt-4">
        {brand} — {title}
      </p>
    </section>
  );
}
