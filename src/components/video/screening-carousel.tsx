"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useViewContext } from "./screening-tracker";
import { formatDuration } from "@/lib/utils";
import React from "react";
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
  Image as ImageIcon,
  Palette,
  Play,
  Film,
  Globe,
} from "lucide-react";

interface SpotDirectorInfo {
  id: string;
  name: string;
  slug: string;
  headshotUrl: string | null;
  bio: string | null;
  statement: string | null;
  websiteUrl: string | null;
}

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
    director: SpotDirectorInfo;
  };
}

interface DirectorInfo {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  statement: string | null;
  headshotUrl: string | null;
  websiteUrl: string | null;
}

interface DirectorVideoItem {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  year: number | null;
  duration: number | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
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

interface FrameGrabInfo {
  id: string;
  projectId: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

interface LookbookItemInfo {
  id: string;
  imageUrl: string;
  caption: string | null;
  source: string | null;
  sortOrder: number;
}

interface GalleryImageInfo {
  id: string;
  projectId: string;
  projectTitle: string;
  projectBrand: string | null;
  timeOffset: number;
  aiScore: number | null;
  width: number;
  height: number;
  sortOrder: number;
  imageUrl: string;
  thumbnailUrl: string;
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
  frameGrabsMap?: Record<string, FrameGrabInfo[]>;
  lookbookItems?: LookbookItemInfo[];
  caseStudies?: DirectorVideoItem[];
  shortFilms?: DirectorVideoItem[];
  galleryImages?: GalleryImageInfo[];
  reelId?: string;
  directorsData?: Record<string, {
    portfolioStills: PortfolioStill[];
    clientBrands: string[];
    treatmentSamples: TreatmentSampleInfo[];
    lookbookItems: LookbookItemInfo[];
    caseStudies: DirectorVideoItem[];
    shortFilms: DirectorVideoItem[];
  }>;
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
  frameGrabsMap = {},
  lookbookItems = [],
  caseStudies = [],
  shortFilms = [],
  // galleryImages — removed (AI Gallery feature removed)
  // reelId — removed (was only used by gallery)
  directorsData,
}: ScreeningCarouselProps) {
  const { viewId } = useViewContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "bio" | "share" | "company" | "download" | "treatments" | "framegrabs" | "lookbook" | "casestudies" | "shortfilms" | "gallery" | null
  >(null);
  const [showInfo, setShowInfo] = useState(true);
  const [bgStillIndex, setBgStillIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState<string | null>(null);
  const [previewTreatment, setPreviewTreatment] = useState<TreatmentSampleInfo | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<{ text: string; x: number; y: number } | null>(null);
  const [playingPanelVideo, setPlayingPanelVideo] = useState<DirectorVideoItem | null>(null);
  const [showDirectorCard, setShowDirectorCard] = useState(false);
  const [transitionDirector, setTransitionDirector] = useState<SpotDirectorInfo | null>(null);
  const [pendingSpotIndex, setPendingSpotIndex] = useState<number | null>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  // ── Multi-director detection ──
  const isMultiDirector = useMemo(() => {
    const ids = new Set(items.map((item) => item.project.director.id));
    return ids.size > 1;
  }, [items]);

  const directorTransitions = useMemo(() => {
    const transitions = new Set<number>();
    for (let i = 1; i < items.length; i++) {
      if (items[i].project.director.id !== items[i - 1].project.director.id) {
        transitions.add(i);
      }
    }
    return transitions;
  }, [items]);

  const currentDirector = isMultiDirector
    ? items[currentIndex]?.project.director ?? director
    : director;

  // Get the active director's secondary data (bio panel content)
  const activeClientBrands = directorsData?.[currentDirector.id]?.clientBrands ?? clientBrands;
  const activeTreatmentSamples = directorsData?.[currentDirector.id]?.treatmentSamples ?? treatmentSamples;
  const activeLookbookItems = directorsData?.[currentDirector.id]?.lookbookItems ?? lookbookItems;
  const activeCaseStudies = directorsData?.[currentDirector.id]?.caseStudies ?? caseStudies;
  const activeShortFilms = directorsData?.[currentDirector.id]?.shortFilms ?? shortFilms;

  // Auto-play first spot after 3 seconds
  useEffect(() => {
    if (currentIndex === 0) {
      const timer = setTimeout(() => {
        if (playerRef.current) {
          playerRef.current?.play?.()?.catch?.(() => {});
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Check if any project in the reel has frame grabs
  const hasFrameGrabs = Object.values(frameGrabsMap).some((grabs) => grabs.length > 0);
  const totalFrameGrabs = Object.values(frameGrabsMap).reduce((sum, grabs) => sum + grabs.length, 0);

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

  // Director card auto-dismiss
  const handleDirectorCardComplete = useCallback(() => {
    if (pendingSpotIndex !== null) {
      setCurrentIndex(pendingSpotIndex);
      setPendingSpotIndex(null);
    }
    setShowDirectorCard(false);
    setTransitionDirector(null);
  }, [pendingSpotIndex]);

  useEffect(() => {
    if (!showDirectorCard) return;
    const timer = setTimeout(handleDirectorCardComplete, 2800);
    return () => clearTimeout(timer);
  }, [showDirectorCard, handleDirectorCardComplete]);

  // Navigate to a specific spot
  const goToSpot = useCallback(
    (index: number) => {
      if (index === currentIndex || index < 0 || index >= items.length) return;
      if (isTransitioning || showDirectorCard) return;

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

      const needsDirectorCard = isMultiDirector && directorTransitions.has(index);

      setTimeout(() => {
        if (needsDirectorCard) {
          setTransitionDirector(items[index].project.director);
          setPendingSpotIndex(index);
          setShowDirectorCard(true);
          setIsTransitioning(false);
        } else {
          setCurrentIndex(index);
          setIsTransitioning(false);
        }
      }, 400);
    },
    [currentIndex, items, isTransitioning, showDirectorCard, isMultiDirector, directorTransitions, currentProject, sendSpotData, resetTracking]
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

  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern clipboard API first
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to fallback
      }
    }
    // Fallback: textarea + execCommand for iOS Safari / older browsers
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopyReelLink = async () => {
    const { dirName, reelDesc, agency } = getShareContext();
    const text = `${dirName} — ${reelDesc}${agency}\nFriends & Family\n${getReelUrl()}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied("reel");
      setTimeout(() => setShareCopied(null), 2000);
    }
  };

  const handleCopySpotLink = async () => {
    const { dirName, spotName } = getShareContext();
    const text = `"${spotName}" — Dir. ${dirName}\nSpot ${
      currentIndex + 1
    } of ${items.length}\n${getReelUrl()}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied("spot");
      setTimeout(() => setShareCopied(null), 2000);
    }
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
    setPlayingPanelVideo(null);
  };
  const openPanel = (panel: "bio" | "share" | "company" | "download" | "treatments" | "framegrabs" | "lookbook" | "casestudies" | "shortfilms" | "gallery") => {
    // Pause main reel player when opening any panel
    playerRef.current?.pause?.();
    setPlayingPanelVideo(null);
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

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
          <div className="w-full bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent px-4 md:px-8 pb-6 pt-24">
            <div className="max-w-3xl mx-auto">
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
          className={`absolute top-4 left-4 md:top-6 md:left-8 z-10 pointer-events-none transition-opacity duration-500 ${
            !showInfo ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2 className="text-xl font-medium text-white/80 tracking-tight drop-shadow-lg">
            {currentProject.title}
          </h2>
          <p className="text-sm text-white/40 mt-1 drop-shadow-md">
            {isMultiDirector && (
              <span className="text-white/50">{currentDirector.name} &middot; </span>
            )}
            {[currentProject.brand, currentProject.agency, currentProject.year]
              .filter(Boolean)
              .join(" \u00B7 ")}
          </p>
        </div>

        {/* Spot counter — top right */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-10 pointer-events-none">
          <span className="text-xs text-white/30 tabular-nums font-medium drop-shadow-lg">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Video player — cinema-style framing, NOT full-screen */}
        <div
          className={`w-full h-full flex items-center justify-center px-3 md:px-8 py-6 transition-opacity duration-400 relative z-[1] ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-2xl shadow-black/50 relative">
            {currentProject.muxPlaybackId ? (
              <MuxPlayer
                ref={playerRef}
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
                  Video processing
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <p className="text-xs text-white/15">Processing...</p>
              </div>
            )}
          </div>
        </div>

        {/* Director transition card — between spots from different directors */}
        {showDirectorCard && transitionDirector && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0e0e0e]"
            style={{ animation: "fadeIn 300ms ease-out" }}
          >
            {transitionDirector.headshotUrl && (
              <div className="mb-6 w-20 h-20 rounded-full overflow-hidden ring-1 ring-white/10">
                <img
                  src={transitionDirector.headshotUrl}
                  alt={transitionDirector.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white/90">
              {transitionDirector.name}
            </h2>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/25">
              Director
            </p>
            {pendingSpotIndex !== null && items[pendingSpotIndex] && (
              <p className="mt-6 text-xs text-white/20">
                Up next: {items[pendingSpotIndex].project.title}
              </p>
            )}
            {/* Auto-dismiss progress bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/30"
                style={{ animation: "expandWidth 2.5s linear forwards" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating thumbnail tooltip — rendered outside overflow container */}
      {hoveredThumb && (
        <div
          className="fixed z-50 whitespace-nowrap bg-black/95 px-3 py-1.5 rounded-md text-[10px] text-white/80 pointer-events-none shadow-lg backdrop-blur-sm border border-white/10"
          style={{
            left: hoveredThumb.x,
            top: hoveredThumb.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          {hoveredThumb.text}
        </div>
      )}

      {/* Bottom bar: thumbnails + action buttons */}
      <div className="relative z-20 border-t border-white/[0.06] bg-[#080808] flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          {/* Thumbnail strip */}
          <div
            ref={thumbStripRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto py-1 pl-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item, i) => {
              const thumb = getThumbUrl(item);
              const isActive = i === currentIndex;
              const isPast = i < currentIndex;
              const isTransitionPoint = isMultiDirector && directorTransitions.has(i);

              return (
                <React.Fragment key={item.id}>
                  {/* Director group separator */}
                  {isTransitionPoint && (
                    <div className="flex-shrink-0 w-px h-[40px] bg-white/10 mx-1" />
                  )}
                  <button
                    onClick={() => goToSpot(i)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const label = (isMultiDirector ? `${item.project.director.name} · ` : "") + item.project.title + (item.project.duration ? ` · ${formatDuration(item.project.duration)}` : "");
                      setHoveredThumb({ text: label, x: rect.left + rect.width / 2, y: rect.top });
                    }}
                    onMouseLeave={() => setHoveredThumb(null)}
                    title={item.project.title}
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

                    {/* Active dot */}
                    {isActive && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                    )}
                  </button>
                </React.Fragment>
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

            {/* Frame Grabs button — only if any project has frame grabs */}
            {hasFrameGrabs && (
              <button
                onClick={() => openPanel("framegrabs")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                  activePanel === "framegrabs"
                    ? "bg-white/10 border-white/20 text-white/60"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
                }`}
              >
                <ImageIcon size={10} />
                Stills
              </button>
            )}

            {/* AI Gallery removed */}

            {/* Lookbook / Mood Board button — only if director has lookbook items */}
            {activeLookbookItems.length > 0 && (
              <button
                onClick={() => openPanel("lookbook")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                  activePanel === "lookbook"
                    ? "bg-white/10 border-white/20 text-white/60"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
                }`}
              >
                <Palette size={10} />
                Lookbook
              </button>
            )}

            {/* Treatment Examples button */}
            {activeTreatmentSamples.length > 0 && (
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

            {/* Case Studies button — only if director has case studies */}
            {activeCaseStudies.length > 0 && (
              <button
                onClick={() => openPanel("casestudies")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                  activePanel === "casestudies"
                    ? "bg-white/10 border-white/20 text-white/60"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
                }`}
              >
                <Play size={10} />
                Case Studies
              </button>
            )}

            {/* Short Films button — only if director has short films */}
            {activeShortFilms.length > 0 && (
              <button
                onClick={() => openPanel("shortfilms")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-[9px] uppercase tracking-[0.15em] ${
                  activePanel === "shortfilms"
                    ? "bg-white/10 border-white/20 text-white/60"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12] text-white/30 hover:text-white/50"
                }`}
              >
                <Film size={10} />
                Short Films
              </button>
            )}
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
            className="max-w-xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
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
            className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
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
              {currentDirector.headshotUrl && (
                <img
                  src={currentDirector.headshotUrl}
                  alt={currentDirector.name}
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                />
              )}
              <div>
                <h3 className="text-xl font-light text-white/90 tracking-tight">
                  {currentDirector.name}
                </h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">
                  Director
                </p>
                {currentDirector.websiteUrl && (
                  <a
                    href={currentDirector.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors mt-2"
                  >
                    <Globe size={10} />
                    {currentDirector.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>
            </div>

            {/* Bio text */}
            {currentDirector.bio && (
              <div className="mb-8">
                <p className="text-[13px] text-white/50 leading-[1.8] whitespace-pre-line">
                  {currentDirector.bio}
                </p>
              </div>
            )}

            {/* Client List */}
            {activeClientBrands.length > 0 && (
              <div className="border-t border-white/5 pt-6 mb-8">
                <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                  Client List
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {activeClientBrands.map((brand) => (
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
            {currentDirector.statement && (
              <div className="border-t border-white/5 pt-6 mb-8">
                <p className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-4">
                  Statement
                </p>
                <p className="text-[13px] text-white/35 leading-[1.8] italic whitespace-pre-line">
                  {currentDirector.statement}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

        {/* ─── ABOUT F&F PANEL — buck.co-inspired minimal ────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/[0.06] rounded-t-[20px] transition-transform duration-500 ease-out ${
            activePanel === "company" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "80vh" }}
        >
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "80vh" }}
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

            <div className="max-w-2xl mx-auto px-10 pb-16">

              {/* ─── Company name — large, airy ─── */}
              <div className="pt-8 pb-16">
                <h3 className="text-[42px] font-extralight text-white/90 tracking-tight leading-[1.1]">
                  Friends &amp; Family
                </h3>
              </div>

              {/* ─── About — narrative, generous spacing ─── */}
              <div className="pb-16">
                <p className="text-[15px] text-white/40 leading-[2] font-light">
                  Friends &amp; Family is a creative production company developing and producing
                  work across commercial, branded content, music, and entertainment. Founded by
                  industry veteran Scott Kaplan &mdash; the producer behind Old Spice&apos;s
                  Emmy-winning, Cannes Grand Prix &amp; D&amp;AD Black Pencil &ldquo;The Man Your
                  Man Could Smell Like,&rdquo; Apple&apos;s iconic iPod campaigns, and
                  collaborations with directors including Tom Kuntz, Mark Romanek, and Gus Van
                  Sant &mdash; the company represents a curated roster of visionary directors
                  who bring intelligence, craft, and distinctive voice to every project.
                </p>
                <p className="text-[15px] text-white/40 leading-[2] font-light mt-6">
                  With offices in New York and Los Angeles, Friends &amp; Family partners
                  with the world&apos;s top agencies and brands to create work that is smart,
                  honest, and unforgettable.
                </p>
              </div>

              {/* ─── Team — clean, stacked ─── */}
              <div className="pb-16">
                <p className="text-[11px] text-white/15 uppercase tracking-[0.25em] mb-10">
                  Team
                </p>

                <div className="space-y-10">
                  <div>
                    <p className="text-[17px] text-white/70 font-light tracking-tight">Scott Kaplan</p>
                    <p className="text-[12px] text-white/25 mt-1">Managing Director / EP</p>
                    <p className="text-[13px] text-white/30 leading-[1.9] mt-3 font-light">
                      A 25-year advertising production veteran and the creative engine behind
                      Friends &amp; Family. Scott has produced landmark campaigns for Tom Kuntz,
                      Mark Romanek, Gus Van Sant, Noam Murro, and Malcolm Venville. His
                      credits include Old Spice&apos;s &ldquo;The Man Your Man Could Smell
                      Like&rdquo; (Emmy, Cannes Grand Prix, D&amp;AD Black Pencil), Apple&apos;s
                      iPod series featuring Paul McCartney, Eminem, and Bob Dylan, and work
                      for Nike, Google, and Coca-Cola.
                    </p>
                    <a href="mailto:scott@friendsandfamily.tv" className="text-[12px] text-white/20 hover:text-white/50 transition-colors mt-2 inline-block">
                      scott@friendsandfamily.tv
                    </a>
                  </div>

                  <div>
                    <p className="text-[17px] text-white/70 font-light tracking-tight">Jed Herold</p>
                    <p className="text-[12px] text-white/25 mt-1">Executive Producer</p>
                    <p className="text-[13px] text-white/30 leading-[1.9] mt-3 font-light">
                      An integrated executive producer and project management leader with
                      20+ years across video, digital, social, and print production. Jed has
                      held senior roles at BBDO, McCann, Grey, and Johannes Leonardo, bringing
                      deep agency-side insight to every production. He leads client partnerships
                      and draws on one of the widest collaborator networks in the business.
                    </p>
                    <a href="mailto:jed@friendsandfamily.tv" className="text-[12px] text-white/20 hover:text-white/50 transition-colors mt-2 inline-block">
                      jed@friendsandfamily.tv
                    </a>
                  </div>

                  <div>
                    <p className="text-[17px] text-white/70 font-light tracking-tight">Alana Hearn</p>
                    <p className="text-[12px] text-white/25 mt-1">Executive Producer</p>
                    <p className="text-[13px] text-white/30 leading-[1.9] mt-3 font-light">
                      Alana began her production career at Lighthouse alongside legendary
                      photographer Peter Lindbergh before rising to EP at Identity and
                      Triptent, where she led content production for major brand campaigns.
                      Her client roster spans Nike, Pepsi, Samsung, L&apos;Or&eacute;al,
                      and Maybelline, with expertise across commercial, fashion, and
                      branded entertainment.
                    </p>
                    <a href="mailto:alana@friendsandfamily.tv" className="text-[12px] text-white/20 hover:text-white/50 transition-colors mt-2 inline-block">
                      alana@friendsandfamily.tv
                    </a>
                  </div>
                </div>
              </div>

              {/* ─── Directors — minimal list ─── */}
              {rosterHighlights.length > 0 && (
                <div className="pb-16">
                  <p className="text-[11px] text-white/15 uppercase tracking-[0.25em] mb-10">
                    Roster
                  </p>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-4">
                    {rosterHighlights.map((d) => (
                      <div key={d.id} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/[0.04] flex-shrink-0">
                          {d.headshotUrl ? (
                            <img
                              src={d.headshotUrl}
                              alt={d.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[13px] text-white/15 font-light">
                                {d.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] text-white/50 group-hover:text-white/70 transition-colors font-light tracking-tight">
                            {d.name}
                          </p>
                          {d.categories.length > 0 && (
                            <p className="text-[10px] text-white/15 mt-0.5">
                              {d.categories.slice(0, 2).join(" \u00B7 ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Sales — inline, understated ─── */}
              <div className="pb-16">
                <p className="text-[11px] text-white/15 uppercase tracking-[0.25em] mb-10">
                  Sales
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
                  <div>
                    <p className="text-[14px] text-white/50 font-light tracking-tight">West Coast</p>
                    <p className="text-[12px] text-white/20 mt-2">Uncle Lefty</p>
                    <a href="mailto:james@unclelefty.com" className="text-[11px] text-white/15 hover:text-white/40 transition-colors block mt-1">
                      james@unclelefty.com
                    </a>
                    <a href="mailto:laurel-ann@unclelefty.com" className="text-[11px] text-white/15 hover:text-white/40 transition-colors block">
                      laurel-ann@unclelefty.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[14px] text-white/50 font-light tracking-tight">Midwest</p>
                    <p className="text-[12px] text-white/20 mt-2">CCCo</p>
                    <a href="mailto:chiara@chiarachung.com" className="text-[11px] text-white/15 hover:text-white/40 transition-colors block mt-1">
                      chiara@chiarachung.com
                    </a>
                    <a href="mailto:gunder@chiarachung.com" className="text-[11px] text-white/15 hover:text-white/40 transition-colors block">
                      gunder@chiarachung.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[14px] text-white/50 font-light tracking-tight">East Coast</p>
                    <p className="text-[12px] text-white/20 mt-2">Talk Shop</p>
                    <a href="mailto:katie.northy@talk-shop.tv" className="text-[11px] text-white/15 hover:text-white/40 transition-colors block mt-1">
                      katie.northy@talk-shop.tv
                    </a>
                    <a href="mailto:kenard.jackson@talk-shop.tv" className="text-[11px] text-white/15 hover:text-white/40 transition-colors block">
                      kenard.jackson@talk-shop.tv
                    </a>
                  </div>
                </div>
              </div>

              {/* ─── Contact — quiet, confident ─── */}
              <div className="flex items-center gap-6 pb-4">
                <a
                  href="https://www.friendsandfamily.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-white/40 hover:text-white/70 transition-colors font-light underline underline-offset-4 decoration-white/10 hover:decoration-white/30"
                >
                  friendsandfamily.tv
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
            className="max-w-xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
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
            className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
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
              {activeTreatmentSamples.map((t) => (
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

            {activeTreatmentSamples.length === 0 && (
              <p className="text-[13px] text-white/20 text-center py-12">
                No treatment examples available for this director yet.
              </p>
            )}
          </div>
        </div>

        {/* ─── FRAME GRABS PANEL ─────────────────────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0e0e0e] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
            activePanel === "framegrabs" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "80vh" }}
        >
          <div
            className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
            style={{ maxHeight: "80vh" }}
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

            <div className="mb-8">
              <p className="text-[10px] text-white/15 uppercase tracking-[0.25em] mb-2">
                {director.name}
              </p>
              <h3 className="text-xl font-light text-white/80 tracking-tight">
                Frame Grabs
              </h3>
              <p className="text-[12px] text-white/25 mt-1.5">
                {totalFrameGrabs} curated stills across {Object.keys(frameGrabsMap).filter(k => frameGrabsMap[k].length > 0).length} projects
              </p>
            </div>

            {/* Frame grabs grouped by project */}
            <div className="space-y-10">
              {items.map((item) => {
                const grabs = frameGrabsMap[item.project.id];
                if (!grabs || grabs.length === 0) return null;
                return (
                  <div key={item.project.id}>
                    {/* Project label */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <p className="text-[13px] text-white/50 font-light">
                        {item.project.title}
                      </p>
                      {item.project.brand && (
                        <p className="text-[10px] text-white/20">
                          {item.project.brand}
                        </p>
                      )}
                    </div>

                    {/* Stills grid — 3 columns, cinematic ratio */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {grabs.map((fg) => (
                        <button
                          key={fg.id}
                          onClick={() => setLightboxImage(fg.imageUrl)}
                          className="group relative aspect-[16/9] rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.12] transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fg.imageUrl}
                            alt={fg.caption || `Frame grab from ${item.project.title}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                          {/* Hover overlay with caption */}
                          {fg.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] text-white/70 leading-relaxed">
                                {fg.caption}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── LOOKBOOK / MOOD BOARD PANEL ────────────────── */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-2xl transition-transform duration-500 ease-out ${
            activePanel === "lookbook" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "85vh" }}
        >
          <div
            className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
            style={{ maxHeight: "85vh" }}
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

            <div className="mb-8">
              <p className="text-[10px] text-white/15 uppercase tracking-[0.25em] mb-2">
                {director.name}
              </p>
              <h3 className="text-xl font-light text-white/80 tracking-tight">
                Visual World
              </h3>
              <p className="text-[12px] text-white/25 mt-1.5 max-w-lg">
                Influences, references, and aesthetic thinking beyond personal work
              </p>
            </div>

            {/* Masonry-style lookbook grid */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {activeLookbookItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLightboxImage(item.imageUrl)}
                  className="group relative w-full rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.12] transition-all break-inside-avoid block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.caption || "Lookbook reference"}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  {/* Hover overlay with caption + source */}
                  {(item.caption || item.source) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.caption && (
                        <p className="text-[11px] text-white/70 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                      {item.source && (
                        <p className="text-[9px] text-white/30 mt-1 italic">
                          {item.source}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {activeLookbookItems.length === 0 && (
              <p className="text-[13px] text-white/20 text-center py-12">
                No lookbook items available for this director yet.
              </p>
            )}
          </div>
        </div>

        {/* AI Gallery panel removed */}

        {/* ─── CASE STUDIES PANEL ────────────────────────── */}
        {activeCaseStudies.length > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-2xl transition-all duration-500 ease-out ${
            activePanel === "casestudies" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ height: playingPanelVideo && activePanel === "casestudies" ? "75vh" : "auto", maxHeight: "85vh" }}
        >
          <div
            className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
            style={{ maxHeight: "85vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close — PROMINENT */}
            <button
              onClick={() => {
                if (playingPanelVideo) {
                  setPlayingPanelVideo(null);
                } else {
                  closePanel();
                }
              }}
              className="absolute top-4 right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              <X size={20} className="text-white/70" />
            </button>

            {playingPanelVideo && activePanel === "casestudies" ? (
              /* ─── EXPANDED PLAYER ─── */
              <div>
                <button
                  onClick={() => setPlayingPanelVideo(null)}
                  className="text-[10px] text-white/30 uppercase tracking-[0.15em] hover:text-white/50 transition-colors mb-4"
                >
                  ← Back to Case Studies
                </button>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
                  {playingPanelVideo.muxPlaybackId && (
                    <MuxPlayer
                      key={playingPanelVideo.id}
                      playbackId={playingPanelVideo.muxPlaybackId}
                      streamType="on-demand"
                      autoPlay={"any" as const}
                      muted={false}
                      style={{ width: "100%", height: "100%" }}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[14px] text-white/70 font-medium">{playingPanelVideo.title}</p>
                  <p className="text-[11px] text-white/30 mt-1">
                    {[playingPanelVideo.brand, playingPanelVideo.year, playingPanelVideo.duration ? formatDuration(playingPanelVideo.duration) : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ) : (
              /* ─── BROWSE GRID ─── */
              <>
                <div className="mb-8">
                  <p className="text-[10px] text-white/15 uppercase tracking-[0.25em] mb-2">
                    {director.name}
                  </p>
                  <h3 className="text-xl font-light text-white/80 tracking-tight">
                    Case Studies
                  </h3>
                  <p className="text-[12px] text-white/25 mt-1.5 max-w-lg">
                    Director commentary and behind-the-scenes breakdowns
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCaseStudies.map((cs) => (
                    <button
                      key={cs.id}
                      onClick={() => cs.muxPlaybackId ? setPlayingPanelVideo(cs) : null}
                      className="group text-left"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/[0.06] group-hover:border-white/20 transition-all">
                        {cs.muxPlaybackId ? (
                          <img
                            src={`https://image.mux.com/${cs.muxPlaybackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`}
                            alt={cs.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : cs.thumbnailUrl ? (
                          <img src={cs.thumbnailUrl} alt={cs.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={24} className="text-white/15" />
                          </div>
                        )}
                        {/* Play overlay */}
                        {cs.muxPlaybackId && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/25 group-hover:scale-110 transition-all">
                              <Play size={18} fill="white" className="text-white ml-0.5" />
                            </div>
                          </div>
                        )}
                        {cs.duration && (
                          <span className="absolute bottom-2 right-2 text-[9px] bg-black/70 px-1.5 py-0.5 text-white/70 rounded">
                            {formatDuration(cs.duration)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-[12px] text-white/60 leading-tight group-hover:text-white/80 transition-colors">{cs.title}</p>
                        {cs.brand && (
                          <p className="text-[10px] text-white/25 mt-0.5">{cs.brand}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* ─── SHORT FILMS PANEL ─────────────────────────── */}
        {activeShortFilms.length > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-2xl transition-all duration-500 ease-out ${
            activePanel === "shortfilms" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ height: playingPanelVideo && activePanel === "shortfilms" ? "75vh" : "auto", maxHeight: "85vh" }}
        >
          <div
            className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 overflow-y-auto"
            style={{ maxHeight: "85vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Close — PROMINENT */}
            <button
              onClick={() => {
                if (playingPanelVideo) {
                  setPlayingPanelVideo(null);
                } else {
                  closePanel();
                }
              }}
              className="absolute top-4 right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              <X size={20} className="text-white/70" />
            </button>

            {playingPanelVideo && activePanel === "shortfilms" ? (
              /* ─── EXPANDED PLAYER ─── */
              <div>
                <button
                  onClick={() => setPlayingPanelVideo(null)}
                  className="text-[10px] text-white/30 uppercase tracking-[0.15em] hover:text-white/50 transition-colors mb-4"
                >
                  ← Back to Short Films
                </button>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
                  {playingPanelVideo.muxPlaybackId && (
                    <MuxPlayer
                      key={playingPanelVideo.id}
                      playbackId={playingPanelVideo.muxPlaybackId}
                      streamType="on-demand"
                      autoPlay={"any" as const}
                      muted={false}
                      style={{ width: "100%", height: "100%" }}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[14px] text-white/70 font-medium">{playingPanelVideo.title}</p>
                  <p className="text-[11px] text-white/30 mt-1">
                    {[playingPanelVideo.brand, playingPanelVideo.year, playingPanelVideo.duration ? formatDuration(playingPanelVideo.duration) : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ) : (
              /* ─── BROWSE GRID ─── */
              <>
                <div className="mb-8">
                  <p className="text-[10px] text-white/15 uppercase tracking-[0.25em] mb-2">
                    {director.name}
                  </p>
                  <h3 className="text-xl font-light text-white/80 tracking-tight">
                    Short Films
                  </h3>
                  <p className="text-[12px] text-white/25 mt-1.5 max-w-lg">
                    Narrative and personal filmmaking
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeShortFilms.map((sf) => (
                    <button
                      key={sf.id}
                      onClick={() => sf.muxPlaybackId ? setPlayingPanelVideo(sf) : null}
                      className="group text-left"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/[0.06] group-hover:border-white/20 transition-all">
                        {sf.muxPlaybackId ? (
                          <img
                            src={`https://image.mux.com/${sf.muxPlaybackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`}
                            alt={sf.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : sf.thumbnailUrl ? (
                          <img src={sf.thumbnailUrl} alt={sf.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={24} className="text-white/15" />
                          </div>
                        )}
                        {/* Play overlay */}
                        {sf.muxPlaybackId && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/25 group-hover:scale-110 transition-all">
                              <Play size={18} fill="white" className="text-white ml-0.5" />
                            </div>
                          </div>
                        )}
                        {sf.duration && (
                          <span className="absolute bottom-2 right-2 text-[9px] bg-black/70 px-1.5 py-0.5 text-white/70 rounded">
                            {formatDuration(sf.duration)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-[12px] text-white/60 leading-tight group-hover:text-white/80 transition-colors">{sf.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {sf.year && (
                            <p className="text-[10px] text-white/25">{sf.year}</p>
                          )}
                          {sf.duration && (
                            <p className="text-[10px] text-white/25">{formatDuration(sf.duration)}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          IMAGE LIGHTBOX — Full-screen view for frame grabs & lookbook
         ═══════════════════════════════════════════════════════ */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full hover:bg-white/5 transition-colors z-10"
          >
            <X size={20} className="text-white/40" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
