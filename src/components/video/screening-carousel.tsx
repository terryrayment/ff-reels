"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useViewContext } from "./screening-tracker";
import { formatDuration } from "@/lib/utils";
import {
  ChevronUp,
  X,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Download,
  FileText,
  Award,
} from "lucide-react";

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

interface RosterHighlight {
  id: string;
  name: string;
  headshotUrl: string | null;
  categories: string[];
}

interface TreatmentSampleInfo {
  id: string;
  title: string;
  brand: string | null;
  previewUrl: string;
  pageCount: number | null;
  isRedacted: boolean;
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
  rosterHighlights?: RosterHighlight[];
  treatmentSamples?: TreatmentSampleInfo[];
  clientBrands?: string[];
}

/**
 * Full-screen carousel player for screening pages.
 * - Single Mux player that switches between spots
 * - Thumbnail strip at bottom for navigation
 * - Auto-advances when a spot ends
 * - Portfolio stills as ambient background between transitions
 * - Director bio slide-up panel
 * - Share panel with contextual email/text/copy
 * - About F&F company panel
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
  rosterHighlights = [],
  treatmentSamples = [],
  clientBrands = [],
}: ScreeningCarouselProps) {
  const { viewId } = useViewContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "bio" | "share" | "company" | "download" | "treatments" | null
  >(null);
  const [showInfo, setShowInfo] = useState(true);
  const [bgStillIndex, setBgStillIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState<string | null>(null);
  const [previewTreatment, setPreviewTreatment] = useState<TreatmentSampleInfo | null>(null);
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
          ? Math.min(
              100,
              Math.round((watchedSeconds.current / totalDur) * 100)
            )
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
      if (
        isPlaying.current &&
        viewId &&
        watchedSeconds.current > 0 &&
        currentProject
      ) {
        sendSpotData(currentProject.id, currentProject.duration);
      }
    }, 15_000);

    return () => clearInterval(interval);
  }, [viewId, sendSpotData, currentProject]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbStripRef.current) return;
    const activeThumb = thumbStripRef.current.children[
      currentIndex
    ] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  // Navigate to a specific spot
  const goToSpot = useCallback(
    (index: number) => {
      if (index === currentIndex || index < 0 || index >= items.length) return;

      // Report current spot data before switching
      if (
        currentProject &&
        watchedSeconds.current > 0 &&
        !hasReportedComplete.current
      ) {
        const totalDur = currentProject.duration || 0;
        const pct =
          totalDur > 0 ? (watchedSeconds.current / totalDur) * 100 : 0;
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

  // === Share helpers ===
  const getReelUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const getShareContext = () => {
    const dirName = director.name;
    const reelDesc = brand
      ? `${reelTitle} for ${brand}`
      : `${reelTitle}`;
    const spotName = currentProject?.title;
    const agency = agencyName ? ` (${agencyName})` : "";
    return { dirName, reelDesc, spotName, agency };
  };

  const handleShareEmail = () => {
    const { dirName, reelDesc, agency } = getShareContext();
    const subject = encodeURIComponent(
      `Director Reel: ${dirName} — ${reelDesc}`
    );
    const body = encodeURIComponent(
      `Take a look at ${dirName}'s reel${agency} — curated by Friends & Family.\n\n${getReelUrl()}\n\n${
        curatorialNote ? `Note: "${curatorialNote}"` : ""
      }`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  const handleShareEmailSpot = () => {
    const { dirName, spotName } = getShareContext();
    const subject = encodeURIComponent(
      `Check out "${spotName}" — Dir. ${dirName}`
    );
    const body = encodeURIComponent(
      `I wanted to flag this spot specifically — "${spotName}" by ${dirName}.\n\n${getReelUrl()}\n\nIt's spot ${
        currentIndex + 1
      } of ${items.length} in the reel.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  const handleShareText = () => {
    const { dirName, reelDesc } = getShareContext();
    const msg = encodeURIComponent(
      `Check out ${dirName}'s reel — ${reelDesc}. Curated by Friends & Family: ${getReelUrl()}`
    );
    window.open(`sms:?&body=${msg}`, "_self");
  };

  const handleCopyReelLink = () => {
    const { dirName, reelDesc, agency } = getShareContext();
    const text = `${dirName} — ${reelDesc}${agency}\nFriends & Family\n${getReelUrl()}`;
    navigator.clipboard.writeText(text);
    setShareCopied("reel");
    setTimeout(() => setShareCopied(null), 2000);
  };

  const handleCopySpotLink = () => {
    const { dirName, spotName } = getShareContext();
    const text = `"${spotName}" — Dir. ${dirName}\nSpot ${
      currentIndex + 1
    } of ${items.length}\n${getReelUrl()}`;
    navigator.clipboard.writeText(text);
    setShareCopied("spot");
    setTimeout(() => setShareCopied(null), 2000);
  };

  const handleNativeShare = async () => {
    const { dirName, reelDesc } = getShareContext();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dirName} — ${reelDesc}`,
          text: `Director reel curated by Friends & Family`,
          url: getReelUrl(),
        });
      } catch {
        // User cancelled or not supported
      }
    }
  };

  // === Download helpers ===
  const handleDownloadSpot = (item: SpotItem) => {
    if (!item.project.muxPlaybackId) return;
    const url = `https://stream.mux.com/${item.project.muxPlaybackId}/high.mp4?download=${encodeURIComponent(item.project.title || "video")}.mp4`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.project.title || "video"}.mp4`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const downloadable = items.filter((i) => i.project.muxPlaybackId);
    downloadable.forEach((item, idx) => {
      // Stagger downloads to avoid browser blocking
      setTimeout(() => handleDownloadSpot(item), idx * 500);
    });
  };

  if (!currentProject) return null;

  const subtitle = brand
    ? [agencyName, campaignName].filter(Boolean).join(" \u00B7 ") ||
      `Directed by ${director.name}`
    : reelTitle;
  const titleDisplay = brand ? reelTitle : director.name;

  // Current background still from portfolio
  const currentBgStill = portfolioStills[bgStillIndex]?.thumbnailUrl;
  const nextBgStill =
    portfolioStills[(bgStillIndex + 1) % Math.max(1, portfolioStills.length)]
      ?.thumbnailUrl;

  // Close any panel
  const closePanel = () => {
    setActivePanel(null);
    setPreviewTreatment(null);
  };
  const openPanel = (panel: "bio" | "share" | "company" | "download" | "treatments") =>
    setActivePanel((prev) => (prev === panel ? null : panel));

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
                Friends &amp; Family
              </p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">
                {titleDisplay}
              </h1>
              <p className="text-sm text-white/40 mt-2">{subtitle}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-white/20">
                <span>
                  {items.length} spot{items.length !== 1 ? "s" : ""}
                </span>
                {totalDuration > 0 && (
                  <>
                    <span className="text-white/10">&middot;</span>
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
          className={`absolute top-6 left-8 z-10 pointer-events-none transition-opacity duration-500 ${
            !showInfo ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2 className="text-xl font-medium text-white/80 tracking-tight drop-shadow-lg">
            {currentProject.title}
          </h2>
          <p className="text-sm text-white/40 mt-1 drop-shadow-md">
            {[currentProject.brand, currentProject.agency, currentProject.year]
              .filter(Boolean)
              .join(" \u00B7 ")}
          </p>
        </div>

        {/* Spot counter — top right */}
        <div className="absolute top-6 right-8 z-10 pointer-events-none">
          <span className="text-xs text-white/30 tabular-nums font-medium drop-shadow-lg">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Video player — cinema-style framing, NOT full-screen */}
        <div
          className={`w-full h-full flex items-center justify-center px-8 py-6 transition-opacity duration-400 relative z-[1] ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-2xl shadow-black/50 relative">
            {currentProject.muxPlaybackId ? (
              <MuxPlayer
                key={currentProject.id}
                playbackId={currentProject.muxPlaybackId}
                streamType="on-demand"
                autoPlay={currentIndex > 0 ? ("any" as const) : undefined}
                minResolution="1080p"
                renditionOrder="desc"
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
                    <svg
                      width="20"
                      height="24"
                      viewBox="0 0 20 24"
                      fill="white"
                      className="ml-1 opacity-60"
                    >
                      <polygon points="0,0 20,12 0,24" />
                    </svg>
                  </div>
                </div>
                <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/25 uppercase tracking-widest">
                  Video uploading to stream
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <p className="text-xs text-white/15">Processing...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar: thumbnails + action buttons */}
      <div className="relative z-20 border-t border-white/[0.06] bg-[#080808] flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
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
                    {item.project.duration
                      ? ` \u00B7 ${formatDuration(item.project.duration)}`
                      : ""}
                  </div>

                  {/* Active dot */}
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Share button */}
            <button
              onClick={() => openPanel("share")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                activePanel === "share"
                  ? "bg-white/10 border-white/20 text-white/60"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
              }`}
            >
              <Share2 size={10} />
              Share
            </button>

            {/* Bio button — always visible */}
            <button
              onClick={() => openPanel("bio")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                activePanel === "bio"
                  ? "bg-white/10 border-white/20 text-white/60"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
              }`}
            >
              <ChevronUp size={10} />
              Bio
            </button>

            {/* Download button */}
            <button
              onClick={() => openPanel("download")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                activePanel === "download"
                  ? "bg-white/10 border-white/20 text-white/60"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
              }`}
            >
              <Download size={10} />
            </button>

            {/* Treatment Examples button */}
            {treatmentSamples.length > 0 && (
              <button
                onClick={() => openPanel("treatments")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                  activePanel === "treatments"
                    ? "bg-white/10 border-white/20 text-white/60"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
                }`}
              >
                <FileText size={10} />
                Treatments
              </button>
            )}

            {/* F&F / About button */}
            <button
              onClick={() => openPanel("company")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                activePanel === "company"
                  ? "bg-white/10 border-white/20 text-white/60"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
              }`}
            >
              F&amp;F
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SLIDE-UP PANELS — Share / Bio / About F&F
          Only one open at a time via activePanel state
         ═══════════════════════════════════════════════════════ */}

      {/* Shared backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          activePanel ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
            activePanel ? "opacity-100" : "opacity-0"
          }`}
          onClick={closePanel}
        />

        {/* ─── SHARE PANEL ──────────────────────────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
            activePanel === "share" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "65vh" }}
        >
          <div
            className="max-w-xl mx-auto px-8 py-8 overflow-y-auto"
            style={{ maxHeight: "65vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={16} className="text-white/30" />
            </button>

            <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-6">
              Share this reel
            </h3>

            {/* Share the full reel */}
            <div className="mb-8">
              <p className="text-[13px] text-white/60 mb-1">
                {director.name}
                {brand ? ` \u2014 ${reelTitle}` : ""}
              </p>
              <p className="text-[11px] text-white/25 mb-5">
                {items.length} spot{items.length !== 1 ? "s" : ""}
                {agencyName ? ` \u00B7 ${agencyName}` : ""}
                {campaignName ? ` \u00B7 ${campaignName}` : ""}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Email the reel */}
                <button
                  onClick={handleShareEmail}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] text-white/60 group-hover:text-white/80 transition-colors">
                      Email Reel
                    </p>
                    <p className="text-[10px] text-white/20">
                      Pre-written with context
                    </p>
                  </div>
                </button>

                {/* Text the reel */}
                <button
                  onClick={handleShareText}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={14} className="text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] text-white/60 group-hover:text-white/80 transition-colors">
                      Text / iMessage
                    </p>
                    <p className="text-[10px] text-white/20">Quick send</p>
                  </div>
                </button>

                {/* Copy reel link with context */}
                <button
                  onClick={handleCopyReelLink}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    {shareCopied === "reel" ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} className="text-white/40 group-hover:text-white/60 transition-colors" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] text-white/60 group-hover:text-white/80 transition-colors">
                      {shareCopied === "reel" ? "Copied!" : "Copy for Slack"}
                    </p>
                    <p className="text-[10px] text-white/20">
                      Formatted with context
                    </p>
                  </div>
                </button>

                {/* Native share (mobile) */}
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <ExternalLink size={14} className="text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="text-[12px] text-white/60 group-hover:text-white/80 transition-colors">
                        More Options
                      </p>
                      <p className="text-[10px] text-white/20">
                        AirDrop, WhatsApp...
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Share the current spot specifically */}
            <div className="border-t border-white/5 pt-6">
              <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                Recommend this spot specifically
              </p>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.03]">
                {getThumbUrl(currentItem) && (
                  <img
                    src={getThumbUrl(currentItem)!}
                    alt=""
                    className="w-16 h-9 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-[12px] text-white/50 truncate">
                    {currentProject.title}
                  </p>
                  <p className="text-[10px] text-white/20 truncate">
                    {[
                      currentProject.brand,
                      currentProject.agency,
                      currentProject.year,
                    ]
                      .filter(Boolean)
                      .join(" \u00B7 ")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleShareEmailSpot}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all text-[11px] text-white/40 hover:text-white/60"
                >
                  <Mail size={12} />
                  Email this spot
                </button>
                <button
                  onClick={handleCopySpotLink}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all text-[11px] text-white/40 hover:text-white/60"
                >
                  {shareCopied === "spot" ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {shareCopied === "spot" ? "Copied!" : "Copy spot link"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BIO PANEL ──────────────────────────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
            activePanel === "bio" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <div
            className="max-w-2xl mx-auto px-8 py-8 overflow-y-auto"
            style={{ maxHeight: "70vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close */}
            <button
              onClick={closePanel}
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

            {/* Client List */}
            {clientBrands.length > 0 && (
              <div className="border-t border-white/5 pt-6 mb-8">
                <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                  Client List
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {clientBrands.map((brand) => (
                    <span
                      key={brand}
                      className="text-[12px] text-white/30"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Statement */}
            {director.statement && (
              <div className="border-t border-white/5 pt-6 mb-8">
                <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                  Statement
                </p>
                <p className="text-[13px] text-white/35 leading-[1.8] italic whitespace-pre-line">
                  {director.statement}
                </p>
              </div>
            )}

            {/* Downloadable reel gallery */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-white/15 uppercase tracking-[0.2em]">
                  This Reel
                </p>
                <button
                  onClick={handleDownloadAll}
                  disabled={!items.some((i) => i.project.muxPlaybackId)}
                  className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Download size={10} />
                  Download All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {items.map((item, i) => {
                  const thumb = getThumbUrl(item, "large");
                  const canDownload = !!item.project.muxPlaybackId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => canDownload ? handleDownloadSpot(item) : goToSpot(i)}
                      className="group relative aspect-video rounded-md overflow-hidden bg-white/[0.04]"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-white/15">{i + 1}</span>
                        </div>
                      )}
                      {/* Hover overlay with download cue */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                        {canDownload && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Download size={18} className="text-white/80" />
                          </div>
                        )}
                      </div>
                      {/* Title bar at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
                        <p className="text-[10px] text-white/70 truncate leading-tight">
                          {item.project.title}
                        </p>
                        <p className="text-[8px] text-white/30 truncate">
                          {item.project.brand || "\u2014"}
                        </p>
                      </div>
                      {/* Download badge */}
                      {canDownload && (
                        <div className="absolute top-1.5 right-1.5">
                          <Download size={10} className="text-white/25" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── ABOUT F&F PANEL — Robust, dashboard-style ────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/[0.08] rounded-t-[20px] transition-transform duration-500 ease-out ${
            activePanel === "company" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "85vh" }}
        >
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "85vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-4 pb-2 sticky top-0 z-10 bg-[#0a0a0a]">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-6 p-2 rounded-full hover:bg-white/5 transition-colors z-10"
            >
              <X size={16} className="text-white/30" />
            </button>

            <div className="max-w-4xl mx-auto px-10 pb-10">

              {/* ─── Hero Header ─── */}
              <div className="pt-4 pb-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-[16px] font-bold text-[#0a0a0a] tracking-tight leading-none">FF</span>
                  </div>
                  <div>
                    <h3 className="text-[28px] font-light text-white/95 tracking-tight leading-none">
                      Friends &amp; Family
                    </h3>
                    <p className="text-[11px] text-white/25 uppercase tracking-[0.2em] mt-1">
                      Directors&apos; Representation &middot; Est. 2018
                    </p>
                  </div>
                </div>

                <p className="text-[14px] text-white/45 leading-[1.8] max-w-2xl">
                  A boutique directors&apos; representation company built on close relationships,
                  creative vision, and an obsessive commitment to craft. We represent a curated
                  roster of directors across commercial, branded content, and music video.
                </p>
              </div>

              {/* ─── Stats Bar — dashboard-style ─── */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-7 mb-10">
                <div className="flex gap-14">
                  <div>
                    <p className="text-4xl font-light tracking-tight text-white/90">
                      {rosterHighlights.length + 1}
                    </p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Roster Directors
                    </p>
                  </div>
                  <div>
                    <p className="text-4xl font-light tracking-tight text-white/90">
                      65+
                    </p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Years Combined Exp.
                    </p>
                  </div>
                  <div>
                    <p className="text-4xl font-light tracking-tight text-white/90">
                      3
                    </p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Coast Coverage
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── Awards & Recognition ─── */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-7 mb-10">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] mb-5">
                  Awards &amp; Recognition
                </p>
                <div className="flex gap-8">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-amber-400/70" />
                    <div>
                      <p className="text-[14px] text-white/70 font-medium">Emmy Award</p>
                      <p className="text-[10px] text-white/25">Outstanding Commercial</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-amber-400/70" />
                    <div>
                      <p className="text-[14px] text-white/70 font-medium">Cannes Grand Prix</p>
                      <p className="text-[10px] text-white/25">Film Craft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-amber-400/70" />
                    <div>
                      <p className="text-[14px] text-white/70 font-medium">D&amp;AD Black Pencil</p>
                      <p className="text-[10px] text-white/25">Craft Direction</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── The Team — card grid ─── */}
              <div className="mb-10">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] mb-5">
                  Leadership
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {/* Scott Kaplan */}
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all">
                    <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center mb-4 ring-1 ring-white/[0.06]">
                      <span className="text-[18px] text-white/30 font-light">SK</span>
                    </div>
                    <h4 className="text-[15px] text-white/85 font-medium tracking-tight">Scott Kaplan</h4>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">
                      Managing Director / EP
                    </p>
                    <p className="text-[12px] text-white/35 leading-[1.7] mt-3">
                      25+ years in production. Campaigns for Tom Kuntz, Mark Romanek,
                      Gus Van Sant, Malcolm Venville.
                    </p>
                    <a
                      href="mailto:scott@friendsandfamily.tv"
                      className="inline-flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/45 transition-colors mt-3"
                    >
                      <Mail size={9} />
                      scott@friendsandfamily.tv
                    </a>
                  </div>

                  {/* Jed Herold */}
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all">
                    <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center mb-4 ring-1 ring-white/[0.06]">
                      <span className="text-[18px] text-white/30 font-light">JH</span>
                    </div>
                    <h4 className="text-[15px] text-white/85 font-medium tracking-tight">Jed Herold</h4>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">
                      Executive Producer
                    </p>
                    <p className="text-[12px] text-white/35 leading-[1.7] mt-3">
                      20+ years in the commercial industry. Extensive collaborator
                      networks through diverse production.
                    </p>
                    <a
                      href="mailto:jed@friendsandfamily.tv"
                      className="inline-flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/45 transition-colors mt-3"
                    >
                      <Mail size={9} />
                      jed@friendsandfamily.tv
                    </a>
                  </div>

                  {/* Alana Hearn */}
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all">
                    <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center mb-4 ring-1 ring-white/[0.06]">
                      <span className="text-[18px] text-white/30 font-light">AH</span>
                    </div>
                    <h4 className="text-[15px] text-white/85 font-medium tracking-tight">Alana Hearn</h4>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">
                      Executive Producer
                    </p>
                    <p className="text-[12px] text-white/35 leading-[1.7] mt-3">
                      Started at Lighthouse with Peter Lindbergh. Clients include
                      Nike, Pepsi, Samsung, L&apos;Or&eacute;al, Maybelline.
                    </p>
                    <a
                      href="mailto:alana@friendsandfamily.tv"
                      className="inline-flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/45 transition-colors mt-3"
                    >
                      <Mail size={9} />
                      alana@friendsandfamily.tv
                    </a>
                  </div>
                </div>
              </div>

              {/* ─── Our Directors — headshot grid ─── */}
              {rosterHighlights.length > 0 && (
                <div className="mb-10">
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] mb-5">
                    Our Directors
                  </p>
                  <div className="grid grid-cols-4 gap-5">
                    {rosterHighlights.map((d) => (
                      <div key={d.id} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.04] mb-2.5">
                          {d.headshotUrl ? (
                            <img
                              src={d.headshotUrl}
                              alt={d.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl text-white/15 font-light">
                                {d.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-[13px] text-white/50 group-hover:text-white/70 transition-colors font-medium tracking-tight">
                          {d.name}
                        </p>
                        {d.categories.length > 0 && (
                          <p className="text-[10px] text-white/20 mt-0.5 truncate">
                            {d.categories.slice(0, 2).join(" \u00B7 ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── National Sales Coverage ─── */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-7 mb-10">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] mb-5">
                  National Sales Coverage
                </p>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-[13px] text-white/60 font-medium tracking-tight">West Coast</p>
                    <p className="text-[12px] text-white/30 mt-1">Uncle Lefty</p>
                    <a href="mailto:james@unclelefty.com" className="text-[11px] text-white/20 hover:text-white/40 transition-colors block mt-1">
                      james@unclelefty.com
                    </a>
                    <a href="mailto:laurel-ann@unclelefty.com" className="text-[11px] text-white/20 hover:text-white/40 transition-colors block">
                      laurel-ann@unclelefty.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[13px] text-white/60 font-medium tracking-tight">Midwest</p>
                    <p className="text-[12px] text-white/30 mt-1">CCCo</p>
                    <a href="mailto:chiara@chiarachung.com" className="text-[11px] text-white/20 hover:text-white/40 transition-colors block mt-1">
                      chiara@chiarachung.com
                    </a>
                    <a href="mailto:gunder@chiarachung.com" className="text-[11px] text-white/20 hover:text-white/40 transition-colors block">
                      gunder@chiarachung.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[13px] text-white/60 font-medium tracking-tight">East Coast</p>
                    <p className="text-[12px] text-white/30 mt-1">Talk Shop</p>
                    <a href="mailto:katie.northy@talk-shop.tv" className="text-[11px] text-white/20 hover:text-white/40 transition-colors block mt-1">
                      katie.northy@talk-shop.tv
                    </a>
                    <a href="mailto:kenard.jackson@talk-shop.tv" className="text-[11px] text-white/20 hover:text-white/40 transition-colors block">
                      kenard.jackson@talk-shop.tv
                    </a>
                  </div>
                </div>
              </div>

              {/* ─── Contact CTA — prominent ─── */}
              <div className="flex items-center gap-4 pb-4">
                <a
                  href="https://www.friendsandfamily.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-all text-[12px] font-medium tracking-wide"
                >
                  <ExternalLink size={13} />
                  friendsandfamily.tv
                </a>
                <a
                  href="mailto:info@friendsandfamily.tv"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.15] transition-all text-[12px] text-white/50 hover:text-white/70 font-medium"
                >
                  <Mail size={13} />
                  info@friendsandfamily.tv
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── DOWNLOAD PANEL ──────────────────────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
            activePanel === "download" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "65vh" }}
        >
          <div
            className="max-w-xl mx-auto px-8 py-8 overflow-y-auto"
            style={{ maxHeight: "65vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={16} className="text-white/30" />
            </button>

            <h3 className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-6">
              Download
            </h3>

            {/* Download All Spots — always visible */}
            <button
              onClick={handleDownloadAll}
              disabled={!items.some((i) => i.project.muxPlaybackId)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.15] transition-all group mb-6 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                <Download size={16} className="text-white/50 group-hover:text-white/70 transition-colors" />
              </div>
              <div className="text-left">
                <p className="text-[14px] text-white/70 group-hover:text-white/90 transition-colors font-medium">
                  Download All Spots
                </p>
                <p className="text-[11px] text-white/25">
                  {items.filter((i) => i.project.muxPlaybackId).length} of {items.length} videos as MP4
                </p>
              </div>
            </button>

            {/* Individual spots */}
            <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-3">
              Individual spots
            </p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleDownloadSpot(item)}
                  disabled={!item.project.muxPlaybackId}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.10] transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {getThumbUrl(item) && (
                    <img
                      src={getThumbUrl(item)!}
                      alt=""
                      className="w-14 h-8 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[12px] text-white/50 group-hover:text-white/70 transition-colors truncate">
                      {item.project.title}
                    </p>
                    <p className="text-[10px] text-white/20 truncate">
                      {[item.project.brand, item.project.agency]
                        .filter(Boolean)
                        .join(" \u00B7 ") || "\u2014"}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/15 tabular-nums flex-shrink-0 mr-1">
                    {i + 1}
                  </span>
                  <Download
                    size={12}
                    className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── TREATMENT EXAMPLES PANEL ─────────────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0e0e0e] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
            activePanel === "treatments" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <div
            className="max-w-2xl mx-auto px-8 py-8 overflow-y-auto"
            style={{ maxHeight: "70vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close */}
            <button
              onClick={() => {
                setPreviewTreatment(null);
                closePanel();
              }}
              className="absolute top-4 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={16} className="text-white/30" />
            </button>

            <div className="mb-6">
              <p className="text-[10px] text-white/15 uppercase tracking-[0.25em] mb-2">
                {director.name}
              </p>
              <h3 className="text-xl font-light text-white/80 tracking-tight">
                Treatment Examples
              </h3>
              <p className="text-[12px] text-white/25 mt-1.5">
                Get a feel for how {director.name} approaches creative briefs
              </p>
            </div>

            {/* Treatment list */}
            <div className="space-y-3">
              {treatmentSamples.map((t) => (
                <div key={t.id}>
                  <button
                    onClick={() => setPreviewTreatment(previewTreatment?.id === t.id ? null : t)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all group text-left ${
                      previewTreatment?.id === t.id
                        ? "bg-white/[0.08] border-white/[0.15]"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.05] hover:border-white/[0.10]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-white/60 group-hover:text-white/80 transition-colors truncate">
                        {t.title}
                      </p>
                      <p className="text-[10px] text-white/20 truncate">
                        {t.brand || "Creative Treatment"}
                        {t.pageCount ? ` \u00B7 ${t.pageCount} pages` : ""}
                        {t.isRedacted ? " \u00B7 Redacted" : ""}
                      </p>
                    </div>
                    <ChevronUp
                      size={12}
                      className={`text-white/20 transition-transform flex-shrink-0 ${
                        previewTreatment?.id === t.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Preview peek — slides open */}
                  {previewTreatment?.id === t.id && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                      <div className="relative" style={{ maxHeight: "40vh" }}>
                        <iframe
                          src={t.previewUrl}
                          className="w-full border-0"
                          style={{ height: "40vh" }}
                          title={`Treatment preview: ${t.title}`}
                        />
                        {/* Fade overlay at bottom to hint there's more */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between bg-black/80">
                        <p className="text-[10px] text-white/25">
                          {t.isRedacted ? "Client details redacted" : "Treatment preview"}
                        </p>
                        <a
                          href={t.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink size={9} />
                          Full treatment
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {treatmentSamples.length === 0 && (
              <p className="text-[13px] text-white/20 text-center py-12">
                No treatment examples available for this director yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
