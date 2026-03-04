"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useViewContext } from "./screening-tracker";
import { formatDuration } from "@/lib/utils";
import { ChevronUp, X } from "lucide-react";

interface SpotItem {
  id: string;
  project: {
    id: string;
    title: string;
    brand: string | null;
    agency: string | null;
    year: number | null;
    duration: number | null;
    muxPlaybackId: string | null;
    thumbnailUrl: string | null;
    contextNote: string | null;
  };
}

interface DirectorInfo {
  name: string;
  bio: string | null;
  statement: string | null;
  headshotUrl: string | null;
}

interface PortfolioStill {
  id: string;
  title: string;
  brand: string | null;
  thumbnailUrl: string | null;
}

interface ScreeningCarouselProps {
  items: SpotItem[];
  director: DirectorInfo;
  reelTitle: string;
  brand: string | null;
  agencyName: string | null;
  campaignName: string | null;
  curatorialNote: string | null;
  portfolioStills?: PortfolioStill[];
}

/**
 * Full-screen carousel player for screening pages.
 * - Single Mux player that switches between spots
 * - Thumbnail strip at bottom for navigation
 * - Auto-advances when a spot ends
 * - Portfolio stills as ambient background between transitions
 * - Director bio slide-up panel
 * - Engagement tracking per spot
 */
export function ScreeningCarousel({
  items,
  director,
  reelTitle,
  brand,
  agencyName,
  campaignName,
  curatorialNote,
  portfolioStills = [],
}: ScreeningCarouselProps) {
  const { viewId } = useViewContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [bgStillIndex, setBgStillIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  // Tracking state per spot
  const watchedSeconds = useRef(0);
  const maxPosition = useRef(0);
  const hasRewatched = useRef(false);
  const spotStartedAt = useRef<number | null>(null);
  const lastReportedAt = useRef(0);
  const hasReportedComplete = useRef(false);
  const isPlaying = useRef(false);

  const currentItem = items[currentIndex];
  const currentProject = currentItem?.project;

  const totalDuration = items.reduce(
    (sum, item) => sum + (item.project.duration || 0),
    0
  );

  // Get thumbnail for a spot — prefer Mux thumbnail, fall back to stored URL
  const getThumbUrl = (item: SpotItem, size: "small" | "large" = "small") => {
    if (item.project.muxPlaybackId) {
      const w = size === "large" ? 1920 : 160;
      const h = size === "large" ? 1080 : 90;
      return `https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=${w}&height=${h}&fit_mode=smartcrop`;
    }
    return item.project.thumbnailUrl;
  };

  // Cycle background stills for ambient visual journey
  useEffect(() => {
    if (portfolioStills.length === 0) return;
    const interval = setInterval(() => {
      setBgStillIndex((prev) => (prev + 1) % portfolioStills.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [portfolioStills.length]);

  // Reset tracking state when spot changes
  const resetTracking = useCallback(() => {
    watchedSeconds.current = 0;
    maxPosition.current = 0;
    hasRewatched.current = false;
    spotStartedAt.current = null;
    lastReportedAt.current = 0;
    hasReportedComplete.current = false;
    isPlaying.current = false;
  }, []);

  // Send spot view data
  const sendSpotData = useCallback(
    async (
      projectId: string,
      spotDuration: number | null,
      overrides: {
        percentWatched?: number;
        skipped?: boolean;
        rewatched?: boolean;
      } = {}
    ) => {
      if (!viewId) return;

      const now = Date.now();
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

      try {
        await fetch("/api/tracking/spot-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            viewId,
            projectId,
            watchDuration: Math.round(watchedSeconds.current),
            totalDuration: totalDur,
            percentWatched: pct,
            rewatched: overrides.rewatched ?? hasRewatched.current,
            skipped: overrides.skipped ?? false,
          }),
        });
      } catch {
        // Fire-and-forget
      }
    },
    [viewId]
  );

  // Periodic reporting
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying.current && viewId && watchedSeconds.current > 0 && currentProject) {
        sendSpotData(currentProject.id, currentProject.duration);
      }
    }, 15_000);

    return () => clearInterval(interval);
  }, [viewId, sendSpotData, currentProject]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbStripRef.current) return;
    const activeThumb = thumbStripRef.current.children[currentIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentIndex]);

  // Navigate to a specific spot
  const goToSpot = useCallback(
    (index: number) => {
      if (index === currentIndex || index < 0 || index >= items.length) return;

      // Report current spot data before switching
      if (currentProject && watchedSeconds.current > 0 && !hasReportedComplete.current) {
        const totalDur = currentProject.duration || 0;
        const pct = totalDur > 0 ? (watchedSeconds.current / totalDur) * 100 : 0;
        sendSpotData(currentProject.id, currentProject.duration, {
          skipped: pct < 25,
        });
      }

      setShowInfo(false);
      setIsTransitioning(true);
      resetTracking();

      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 400);
    },
    [currentIndex, items.length, currentProject, sendSpotData, resetTracking]
  );

  // Player event handlers
  const handlePlay = () => {
    isPlaying.current = true;
    setShowInfo(false);
    if (!spotStartedAt.current) {
      spotStartedAt.current = Date.now();
    }
  };

  const handlePause = () => {
    isPlaying.current = false;
    if (watchedSeconds.current > 0 && currentProject) {
      sendSpotData(currentProject.id, currentProject.duration);
    }
  };

  const handleTimeUpdate = (e: Event) => {
    const player = e.target as HTMLMediaElement;
    if (!player || !isPlaying.current) return;

    const currentTime = player.currentTime;
    watchedSeconds.current = currentTime;

    if (currentTime < maxPosition.current - 2) {
      hasRewatched.current = true;
    }

    if (currentTime > maxPosition.current) {
      maxPosition.current = currentTime;
    }
  };

  const handleEnded = () => {
    isPlaying.current = false;
    hasReportedComplete.current = true;

    if (currentProject) {
      sendSpotData(currentProject.id, currentProject.duration, {
        percentWatched: 100,
        rewatched: hasRewatched.current,
      });
    }

    // Auto-advance to next spot
    if (currentIndex < items.length - 1) {
      goToSpot(currentIndex + 1);
    }
  };

  const handleSeeked = (e: Event) => {
    const player = e.target as HTMLMediaElement;
    if (!player) return;
    if (player.currentTime < maxPosition.current - 2) {
      hasRewatched.current = true;
    }
  };

  if (!currentProject) return null;

  const hasBio = director.bio || director.statement;
  const subtitle = brand
    ? [agencyName, campaignName].filter(Boolean).join(" · ") || `Directed by ${director.name}`
    : reelTitle;
  const titleDisplay = brand ? reelTitle : director.name;

  // Current background still from portfolio
  const currentBgStill = portfolioStills[bgStillIndex]?.thumbnailUrl;
  const nextBgStill = portfolioStills[(bgStillIndex + 1) % Math.max(1, portfolioStills.length)]?.thumbnailUrl;

  return (
    <div className="h-screen bg-[#0e0e0e] text-white flex flex-col overflow-hidden">
      {/* Main player area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        {/* Ambient portfolio stills — crossfade behind player */}
        {portfolioStills.length > 0 && showInfo && (
          <div className="absolute inset-0 z-0">
            {currentBgStill && (
              <img
                key={`bg-${bgStillIndex}`}
                src={currentBgStill}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[0.07] blur-sm animate-[fadeIn_2s_ease-in-out]"
              />
            )}
            {nextBgStill && (
              <img
                src={nextBgStill}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-0"
                loading="eager"
              />
            )}
          </div>
        )}

        {/* Info overlay — shows initially, fades when playing */}
        <div
          className={`absolute inset-0 z-10 flex items-end pointer-events-none transition-opacity duration-700 ${
            showInfo ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent px-8 pb-6 pt-24">
            <div className="max-w-4xl mx-auto">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mb-4">
                Friends & Family
              </p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">
                {titleDisplay}
              </h1>
              <p className="text-sm text-white/40 mt-2">{subtitle}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-white/20">
                <span>{items.length} spot{items.length !== 1 ? "s" : ""}</span>
                {totalDuration > 0 && (
                  <>
                    <span className="text-white/10">·</span>
                    <span>{formatDuration(totalDuration)} total</span>
                  </>
                )}
              </div>
              {curatorialNote && (
                <p className="text-sm text-white/35 italic mt-4 max-w-xl leading-relaxed">
                  {curatorialNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Spot info — top left, shows when playing */}
        <div
          className={`absolute top-5 left-6 z-10 pointer-events-none transition-opacity duration-500 ${
            !showInfo ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2 className="text-sm font-medium text-white/60">
            {currentProject.title}
          </h2>
          <p className="text-[11px] text-white/25 mt-0.5">
            {[currentProject.brand, currentProject.agency, currentProject.year]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {/* Spot counter — top right */}
        <div className="absolute top-5 right-6 z-10 pointer-events-none">
          <span className="text-[11px] text-white/20 tabular-nums">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Video player / Thumbnail display */}
        <div
          className={`w-full h-full transition-opacity duration-400 relative z-[1] ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentProject.muxPlaybackId ? (
            <MuxPlayer
              key={currentProject.id}
              playbackId={currentProject.muxPlaybackId}
              streamType="on-demand"
              autoPlay={currentIndex > 0 ? ("any" as const) : undefined}
              metadata={{
                video_id: currentProject.id,
                video_title: currentProject.title,
              }}
              poster={getThumbUrl(currentItem, "large") || undefined}
              primaryColor="#ffffff"
              secondaryColor="#0e0e0e"
              accentColor="#666666"
              style={{ width: "100%", height: "100%" }}
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onSeeked={handleSeeked}
            />
          ) : currentProject.thumbnailUrl ? (
            /* No Mux yet — show full-size thumbnail with play overlay */
            <div className="w-full h-full relative bg-black flex items-center justify-center">
              <img
                src={currentProject.thumbnailUrl}
                alt={currentProject.title}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="white" className="ml-1 opacity-60">
                    <polygon points="0,0 20,12 0,24" />
                  </svg>
                </div>
              </div>
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/25 uppercase tracking-widest">
                Video uploading to stream
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs text-white/15">Processing...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: thumbnails + bio button */}
      <div className="relative z-20 border-t border-white/[0.06] bg-[#080808] flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Thumbnail strip */}
          <div
            ref={thumbStripRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item, i) => {
              const thumb = getThumbUrl(item);
              const isActive = i === currentIndex;
              const isPast = i < currentIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => goToSpot(i)}
                  className={`flex-shrink-0 group relative transition-all duration-300 rounded-[4px] overflow-hidden ${
                    isActive
                      ? "ring-1 ring-white/50 scale-105"
                      : isPast
                        ? "opacity-50 hover:opacity-75"
                        : "opacity-35 hover:opacity-60"
                  }`}
                >
                  <div className="w-[72px] h-[40px] bg-white/[0.04]">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[8px] text-white/15 tabular-nums">
                          {i + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 px-2 py-1 rounded text-[9px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    {item.project.title}
                    {item.project.duration ? ` · ${formatDuration(item.project.duration)}` : ""}
                  </div>

                  {/* Active dot */}
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bio button */}
          {hasBio && (
            <button
              onClick={() => setShowBio(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all text-[9px] text-white/30 hover:text-white/50 uppercase tracking-[0.15em]"
            >
              <ChevronUp size={10} />
              Bio
            </button>
          )}
        </div>
      </div>

      {/* Bio slide-up panel */}
      {hasBio && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-500 ${
            showBio ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
              showBio ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setShowBio(false)}
          />

          {/* Panel */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
              showBio ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ maxHeight: "70vh" }}
          >
            <div className="max-w-2xl mx-auto px-8 py-8 overflow-y-auto" style={{ maxHeight: "70vh" }}>
              {/* Drag handle */}
              <div className="flex justify-center mb-6">
                <div className="w-10 h-1 rounded-full bg-white/10" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowBio(false)}
                className="absolute top-4 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={16} className="text-white/30" />
              </button>

              {/* Director info */}
              <div className="flex items-start gap-6 mb-8">
                {director.headshotUrl && (
                  <img
                    src={director.headshotUrl}
                    alt={director.name}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                  />
                )}
                <div>
                  <h3 className="text-xl font-light text-white/90 tracking-tight">
                    {director.name}
                  </h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">
                    Director
                  </p>
                </div>
              </div>

              {/* Bio text */}
              {director.bio && (
                <div className="mb-8">
                  <p className="text-[13px] text-white/50 leading-[1.8] whitespace-pre-line">
                    {director.bio}
                  </p>
                </div>
              )}

              {/* Portfolio stills grid — visual journey */}
              {portfolioStills.length > 0 && (
                <div className="border-t border-white/5 pt-6 mb-8">
                  <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                    Selected Work
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {portfolioStills.slice(0, 8).map((still) =>
                      still.thumbnailUrl ? (
                        <div key={still.id} className="aspect-video rounded-sm overflow-hidden">
                          <img
                            src={still.thumbnailUrl}
                            alt={still.title}
                            className="w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Statement */}
              {director.statement && (
                <div className="border-t border-white/5 pt-6">
                  <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                    Statement
                  </p>
                  <p className="text-[13px] text-white/35 leading-[1.8] italic whitespace-pre-line">
                    {director.statement}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
