"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useViewContext } from "./screening-tracker";

interface ScreeningPlayerProps {
  playbackId: string;
  projectId: string;
  title: string;
  duration: number | null;
}

/**
 * Mux video player with engagement tracking.
 * Lazy-loads via IntersectionObserver — shows static thumbnail until visible.
 * Tracks: play, progress, completion, skip, rewatch.
 */
export function ScreeningPlayer({
  playbackId,
  projectId,
  title,
  duration: spotDuration,
}: ScreeningPlayerProps) {
  const { viewId } = useViewContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // Tracking state
  const watchedSeconds = useRef(0);
  const maxPosition = useRef(0);
  const hasRewatched = useRef(false);
  const spotStartedAt = useRef<number | null>(null);
  const lastReportedAt = useRef(0);
  const hasReportedComplete = useRef(false);
  const isPlaying = useRef(false);

  // Richer video signals (Feature 7)
  const pauseCount = useRef(0);
  const seekForwardCount = useRef(0);
  const seekBackwardCount = useRef(0);
  const fullscreenToggleCount = useRef(0);
  const playbackRates = useRef<number[]>([]);
  const lastTimeBeforeSeek = useRef(0);
  const videoQualityRef = useRef<string | null>(null);

  // IntersectionObserver — lazy load player when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Send spot view data to the tracking API
  const sendSpotData = useCallback(
    async (overrides: {
      percentWatched?: number;
      skipped?: boolean;
      rewatched?: boolean;
    } = {}) => {
      if (!viewId) return;

      const now = Date.now();
      // Don't send more than once per 5 seconds unless forced
      if (
        now - lastReportedAt.current < 5000 &&
        !overrides.percentWatched &&
        overrides.skipped === undefined
      ) {
        return;
      }

      lastReportedAt.current = now;

      const totalDur = spotDuration || 0;
      const pct =
        overrides.percentWatched ??
        (totalDur > 0
          ? Math.min(100, Math.round((watchedSeconds.current / totalDur) * 100))
          : 0);

      const payload = {
        viewId,
        projectId,
        watchDuration: Math.round(watchedSeconds.current),
        totalDuration: totalDur,
        percentWatched: pct,
        rewatched: overrides.rewatched ?? hasRewatched.current,
        skipped: overrides.skipped ?? false,
        // Richer video signals
        pauseCount: pauseCount.current,
        seekForwardCount: seekForwardCount.current,
        seekBackwardCount: seekBackwardCount.current,
        fullscreenToggleCount: fullscreenToggleCount.current,
        playbackRateChanges:
          playbackRates.current.length > 0
            ? JSON.stringify(playbackRates.current)
            : null,
        videoQuality: videoQualityRef.current,
      };

      try {
        await fetch("/api/tracking/spot-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Fire-and-forget
      }
    },
    [viewId, projectId, spotDuration]
  );

  // Periodic reporting while playing
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying.current && viewId && watchedSeconds.current > 0) {
        sendSpotData();
      }
    }, 15_000); // Every 15 seconds of play

    return () => clearInterval(interval);
  }, [viewId, sendSpotData]);

  // Report skip on unmount if user barely watched
  useEffect(() => {
    return () => {
      if (!hasStartedPlaying || hasReportedComplete.current) return;

      const totalDur = spotDuration || 0;
      if (totalDur <= 0) return;

      const pct = (watchedSeconds.current / totalDur) * 100;
      if (pct < 25) {
        // User skipped this spot — fire beacon
        if (viewId) {
          const beaconPayload = JSON.stringify({
            viewId,
            projectId,
            watchDuration: Math.round(watchedSeconds.current),
            totalDuration: totalDur,
            percentWatched: Math.round(pct),
            rewatched: hasRewatched.current,
            skipped: true,
            pauseCount: pauseCount.current,
            seekForwardCount: seekForwardCount.current,
            seekBackwardCount: seekBackwardCount.current,
            fullscreenToggleCount: fullscreenToggleCount.current,
            playbackRateChanges:
              playbackRates.current.length > 0
                ? JSON.stringify(playbackRates.current)
                : null,
            videoQuality: videoQualityRef.current,
          });
          navigator.sendBeacon("/api/tracking/spot-view", beaconPayload);
        }
      } else {
        // Partial watch — send what we have
        sendSpotData();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStartedPlaying, viewId, projectId, spotDuration]);

  // Player event handlers
  const handlePlay = () => {
    isPlaying.current = true;
    if (!spotStartedAt.current) {
      spotStartedAt.current = Date.now();
      setHasStartedPlaying(true);
    }
  };

  const handlePause = () => {
    isPlaying.current = false;
    pauseCount.current++;
    // Send update on pause (user paused to think)
    if (watchedSeconds.current > 0) {
      sendSpotData();
    }
  };

  const handleTimeUpdate = (e: Event) => {
    const player = e.target as HTMLMediaElement;
    if (!player || !isPlaying.current) return;

    const currentTime = player.currentTime;

    // Track position for seek direction classification
    lastTimeBeforeSeek.current = currentTime;

    // Track accumulated watch time (timeupdate fires every ~250ms)
    watchedSeconds.current = currentTime;

    // Rewatch detection: user seeked backward past their max position
    if (currentTime < maxPosition.current - 2) {
      hasRewatched.current = true;
    }

    if (currentTime > maxPosition.current) {
      maxPosition.current = currentTime;
    }

    // Capture video quality from player resolution (videoHeight is on HTMLVideoElement)
    const videoEl = player as unknown as HTMLVideoElement;
    if (!videoQualityRef.current && videoEl.videoHeight > 0) {
      const h = videoEl.videoHeight;
      if (h >= 2160) videoQualityRef.current = "4k";
      else if (h >= 1080) videoQualityRef.current = "1080p";
      else if (h >= 720) videoQualityRef.current = "720p";
      else if (h >= 480) videoQualityRef.current = "480p";
      else videoQualityRef.current = "360p";
    }
  };

  const handleEnded = () => {
    isPlaying.current = false;
    hasReportedComplete.current = true;
    sendSpotData({ percentWatched: 100, rewatched: hasRewatched.current });
  };

  const handleSeeked = (e: Event) => {
    const player = e.target as HTMLMediaElement;
    if (!player) return;

    const currentTime = player.currentTime;
    const prevTime = lastTimeBeforeSeek.current;

    // Classify seek direction (2-second buffer to avoid false positives)
    if (currentTime > prevTime + 2) {
      seekForwardCount.current++;
    } else if (currentTime < prevTime - 2) {
      seekBackwardCount.current++;
      hasRewatched.current = true;
    }
  };

  const handleRateChange = (e: Event) => {
    const player = e.target as HTMLMediaElement;
    if (!player) return;
    const rate = player.playbackRate;
    const rates = playbackRates.current;
    if (rates.length === 0 || rates[rates.length - 1] !== rate) {
      rates.push(rate);
    }
  };

  // Track fullscreen toggles
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        fullscreenToggleCount.current++;
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=960&height=540&fit_mode=smartcrop`;

  return (
    <div ref={containerRef} className="aspect-video bg-white/[0.03] rounded-sm overflow-hidden">
      {isVisible ? (
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          metadata={{
            video_id: projectId,
            video_title: title,
          }}
          poster={thumbnailUrl}
          primaryColor="#ffffff"
          secondaryColor="#0e0e0e"
          accentColor="#666666"
          style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onSeeked={handleSeeked}
          onRateChange={handleRateChange}
        />
      ) : (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
