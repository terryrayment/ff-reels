"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Film,
  Loader2,
  Search,
  Share2,
  X,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { hapticImpact, hapticSelection, hapticNotification, nativeShare } from "@/lib/native";

/* ──────────────────────────────────────────────── Types ─── */

interface Project {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  category: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
}

interface Director {
  id: string;
  name: string;
  rosterStatus: string;
  headshotUrl: string | null;
  projects: Project[];
}

interface QuickReelBuilderProps {
  directors: Director[];
}

type Step = "director" | "spots" | "details" | "done";

/* ──────────────────────────────────────────────── Main ─── */

export function QuickReelBuilder({ directors }: QuickReelBuilderProps) {
  const router = useRouter();

  // Step machine
  const [step, setStep] = useState<Step>("director");

  // Director selection
  const [selectedDirectorId, setSelectedDirectorId] = useState("");
  const [directorSearch, setDirectorSearch] = useState("");
  const directorSearchRef = useRef<HTMLInputElement>(null);

  // Spot selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [spotSearch, setSpotSearch] = useState("");

  // Reel details
  const [brand, setBrand] = useState("");
  const [agencyName, setAgencyName] = useState("");

  // Creation state
  const [saving, setSaving] = useState(false);
  const [screeningUrl, setScreeningUrl] = useState("");
  const [reelId, setReelId] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedDirector = directors.find((d) => d.id === selectedDirectorId);
  const projects = selectedDirector?.projects || [];

  // Step progress
  const allSteps: Step[] = ["director", "spots", "details", "done"];
  const stepIndex = allSteps.indexOf(step);

  const stepDots = (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {allSteps.slice(0, 3).map((s, i) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            i <= stepIndex ? "bg-[#1A1A1A] w-5" : "bg-[#E8E7E3] w-1.5"
          }`}
        />
      ))}
    </div>
  );

  // Focus search on step change
  useEffect(() => {
    if (step === "director") {
      setTimeout(() => directorSearchRef.current?.focus(), 100);
    }
  }, [step]);

  /* ── Director list ── */
  const filteredDirectors = useMemo(() => {
    const q = directorSearch.toLowerCase().trim();
    const filtered = q
      ? directors.filter((d) => d.name.toLowerCase().includes(q))
      : directors;

    // Roster first, then off-roster
    return filtered.sort((a, b) => {
      if (a.rosterStatus === "ROSTER" && b.rosterStatus !== "ROSTER") return -1;
      if (a.rosterStatus !== "ROSTER" && b.rosterStatus === "ROSTER") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [directors, directorSearch]);

  /* ── Spot list ── */
  const filteredProjects = useMemo(() => {
    const q = spotSearch.toLowerCase().trim();
    return q
      ? projects.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        )
      : projects;
  }, [projects, spotSearch]);

  const selectedProjects = useMemo(() => {
    const list = selectedIds
      .map((id) => projects.find((p) => p.id === id))
      .filter(Boolean) as Project[];
    // Slate always first
    return list.sort((a, b) => {
      const aSlate = a.title.toLowerCase().includes("slate") ? 0 : 1;
      const bSlate = b.title.toLowerCase().includes("slate") ? 0 : 1;
      return aSlate - bSlate;
    });
  }, [selectedIds, projects]);

  const totalDuration = selectedProjects.reduce(
    (sum, p) => sum + (p.duration || 0),
    0
  );

  /* ── Actions ── */
  const selectDirector = (id: string) => {
    hapticImpact("medium");
    setSelectedDirectorId(id);
    setSelectedIds([]);
    setSpotSearch("");
    setStep("spots");
  };

  const toggleSpot = (id: string) => {
    hapticSelection();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeSpot = (id: string) => {
    hapticImpact("light");
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleCreate = async () => {
    if (!selectedDirectorId || selectedIds.length === 0) return;
    setSaving(true);

    const title =
      brand.trim() && selectedDirector
        ? `${selectedDirector.name} for ${brand.trim()}`
        : selectedDirector
          ? `${selectedDirector.name} Reel`
          : "New Reel";

    const orderedIds = selectedProjects.map((p) => p.id);

    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId: selectedDirectorId,
          title,
          brand: brand.trim() || undefined,
          agencyName: agencyName.trim() || undefined,
          reelType: "CUSTOM",
          projectIds: orderedIds,
        }),
      });

      if (res.ok) {
        const reel = await res.json();
        setScreeningUrl(reel.screeningUrl);
        setReelId(reel.id);
        setStep("done");
        hapticNotification("success");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(screeningUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    hapticImpact("medium");
    const shared = await nativeShare({
      title: `${selectedDirector?.name} Reel`,
      text: `Check out this director reel from Friends & Family`,
      url: screeningUrl,
    });
    if (shared) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ──────────────────────────────────── Step 1: Director ─── */
  if (step === "director") {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-[#F7F6F3] -mx-5 -mt-16 md:-mx-16 md:-mt-14">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F7F6F3]/95 backdrop-blur-lg border-b border-[#E8E7E3]/60 px-5 pt-14 md:pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-[#999] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider">
              Quick Reel
            </h1>
            <div className="w-8" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]"
            />
            <input
              ref={directorSearchRef}
              type="text"
              value={directorSearch}
              onChange={(e) => setDirectorSearch(e.target.value)}
              placeholder="Search directors..."
              className="w-full pl-10 pr-4 py-3 text-[15px] bg-white/70 rounded-xl border border-[#E8E7E3]/60 text-[#1A1A1A] placeholder-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
            />
          </div>

          <p className="text-[10px] text-[#bbb] uppercase tracking-[0.12em] mt-3">
            Select Director
          </p>
          {stepDots}
        </div>

        {/* Director list */}
        <div className="flex-1 overflow-y-auto">
          {filteredDirectors.map((director) => {
            const hero = director.projects[0];
            const hasHeadshot = !!director.headshotUrl;
            const thumbSrc = director.headshotUrl
              ? director.headshotUrl
              : hero?.muxPlaybackId
                ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=96&height=96&fit_mode=smartcrop`
                : null;

            return (
              <button
                key={director.id}
                onClick={() => selectDirector(director.id)}
                className="w-full flex items-center gap-4 px-5 py-4 border-b border-[#E8E7E3]/40 active:bg-[#EEEDEA]/60 transition-colors"
              >
                <div className={`w-12 h-12 bg-[#EEEDEA] overflow-hidden flex-shrink-0 ${hasHeadshot ? "rounded-full" : "rounded-lg"}`}>
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={16} className="text-[#ccc]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[15px] text-[#1A1A1A] font-medium truncate">
                    {director.name}
                  </p>
                  <p className="text-[12px] text-[#999]">
                    {director.projects.length} spot
                    {director.projects.length !== 1 ? "s" : ""}
                    {director.rosterStatus === "OFF_ROSTER" && (
                      <span className="text-[#ccc]"> · Off-Roster</span>
                    )}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#ccc] flex-shrink-0" />
              </button>
            );
          })}

          {filteredDirectors.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[14px] text-[#999]">
                No directors matching &ldquo;{directorSearch}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────── Step 2: Spots ─── */
  if (step === "spots") {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-[#F7F6F3] -mx-5 -mt-16 md:-mx-16 md:-mt-14">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F7F6F3]/95 backdrop-blur-lg border-b border-[#E8E7E3]/60 px-5 pt-14 md:pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                setStep("director");
                setSelectedDirectorId("");
                setSelectedIds([]);
              }}
              className="p-2 -ml-2 text-[#999] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#1A1A1A]">
                {selectedDirector?.name}
              </p>
              <p className="text-[10px] text-[#999]">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected · ${formatDuration(totalDuration)}`
                  : `${projects.length} spots available`}
              </p>
            </div>
            <div className="w-8" />
          </div>

          {/* Search spots + Select All */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]"
              />
              <input
                type="text"
                value={spotSearch}
                onChange={(e) => setSpotSearch(e.target.value)}
                placeholder="Search spots..."
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white/70 rounded-xl border border-[#E8E7E3]/60 text-[#1A1A1A] placeholder-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (selectedIds.length === projects.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(projects.map((p) => p.id));
                }
              }}
              className="px-3 py-2.5 text-[11px] font-medium text-[#999] hover:text-[#1A1A1A] bg-white/70 rounded-xl border border-[#E8E7E3]/60 whitespace-nowrap transition-colors active:bg-[#EEEDEA]"
            >
              {selectedIds.length === projects.length ? "None" : "All"}
            </button>
          </div>
          {stepDots}
        </div>

        {/* Spot grid — 2 columns on mobile, 3 on wider screens */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProjects.map((project) => {
              const isSelected = selectedIds.includes(project.id);
              const selectionIndex = selectedIds.indexOf(project.id);
              const thumbSrc = project.muxPlaybackId
                ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
                : project.thumbnailUrl || null;

              return (
                <button
                  key={project.id}
                  onClick={() => toggleSpot(project.id)}
                  className={`text-left rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? "ring-2 ring-[#1A1A1A] shadow-md scale-[0.98]"
                      : "border border-[#E8E7E3]/60 active:scale-[0.97]"
                  }`}
                >
                  <div className="aspect-video bg-[#EEEDEA] relative overflow-hidden">
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={16} className="text-[#ccc]" />
                      </div>
                    )}
                    {/* Selection badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                        <span className="text-[11px] font-bold text-white">
                          {selectionIndex + 1}
                        </span>
                      </div>
                    )}
                    {/* Duration pill */}
                    {project.duration && (
                      <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-white/90">
                        {formatDuration(project.duration)}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-[12px] font-medium text-[#1A1A1A] truncate">
                      {project.title}
                    </p>
                    <p className="text-[10px] text-[#999] truncate">
                      {project.brand || "\u2014"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom action bar — fixed */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-t border-[#E8E7E3] px-5 py-4 safe-area-bottom">
            {/* Selected spots strip */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {selectedProjects.map((p, i) => {
                const thumb = p.muxPlaybackId
                  ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=64&height=36&fit_mode=smartcrop`
                  : null;
                return (
                  <div key={p.id} className="flex-shrink-0 relative group">
                    <div className="w-14 h-9 bg-[#EEEDEA] rounded overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={8} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#1A1A1A] text-[8px] font-bold text-white flex items-center justify-center">
                      {i + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSpot(p.id);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X size={8} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep("details")}
              className="w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white text-[14px] font-medium active:bg-[#333] transition-colors flex items-center justify-center gap-2"
            >
              Continue with {selectedIds.length} spot
              {selectedIds.length !== 1 ? "s" : ""}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────── Step 3: Details ─── */
  if (step === "details") {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-[#F7F6F3] -mx-5 -mt-16 md:-mx-16 md:-mt-14">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F7F6F3]/95 backdrop-blur-lg border-b border-[#E8E7E3]/60 px-5 pt-14 md:pt-6 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("spots")}
              className="p-2 -ml-2 text-[#999] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <p className="text-[13px] font-medium text-[#1A1A1A]">
              Reel Details
            </p>
            <div className="w-8" />
          </div>
          {stepDots}
        </div>

        <div className="flex-1 px-5 pt-6 pb-28">
          {/* Summary card */}
          <div className="rounded-2xl bg-white/70 border border-[#E8E7E3]/60 p-5 mb-6">
            <p className="text-[15px] font-medium text-[#1A1A1A]">
              {selectedDirector?.name}
            </p>
            <p className="text-[12px] text-[#999] mt-1">
              {selectedIds.length} spot{selectedIds.length !== 1 ? "s" : ""} ·{" "}
              {formatDuration(totalDuration)}
            </p>

            {/* Spot thumbnails */}
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
              {selectedProjects.map((p) => {
                const thumb = p.muxPlaybackId
                  ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=80&height=45&fit_mode=smartcrop`
                  : null;
                return (
                  <div
                    key={p.id}
                    className="w-16 h-10 bg-[#EEEDEA] rounded flex-shrink-0 overflow-hidden"
                  >
                    {thumb && (
                      <img
                        src={thumb}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form — minimal fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Brand *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Cheerios, Nike, Apple..."
                className="w-full px-4 py-3.5 text-[15px] bg-white/70 rounded-xl border border-[#E8E7E3]/60 text-[#1A1A1A] placeholder-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Agency
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Optional — Wieden+Kennedy, BBDO..."
                className="w-full px-4 py-3.5 text-[15px] bg-white/70 rounded-xl border border-[#E8E7E3]/60 text-[#1A1A1A] placeholder-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
              />
            </div>
          </div>

          {/* Auto-title preview */}
          {brand.trim() && selectedDirector && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-[#EEEDEA]/50">
              <p className="text-[10px] text-[#bbb] uppercase tracking-[0.1em] mb-1">
                Reel title
              </p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">
                {selectedDirector.name} for {brand.trim()}
              </p>
            </div>
          )}
        </div>

        {/* Bottom action */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-t border-[#E8E7E3] px-5 py-4 safe-area-bottom">
          <button
            onClick={handleCreate}
            disabled={saving || !brand.trim()}
            className="w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#333] transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create & Share
                <Share2 size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────── Step 4: Done ─── */
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F7F6F3] -mx-5 -mt-16 md:-mx-16 md:-mt-14 px-6">
      {/* Success */}
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-emerald-500" />
        </div>

        <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">
          Reel Created
        </h2>
        <p className="text-[13px] text-[#999] mb-8">
          {selectedDirector?.name}
          {brand.trim() && ` for ${brand.trim()}`} ·{" "}
          {selectedIds.length} spot{selectedIds.length !== 1 ? "s" : ""}
        </p>

        {/* Screening URL */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 px-4 py-3 bg-white/70 rounded-xl border border-[#E8E7E3]/60 text-[12px] text-[#1A1A1A] truncate font-mono text-left">
            {screeningUrl}
          </div>
          <button
            onClick={handleCopy}
            className="p-3 bg-white/70 rounded-xl border border-[#E8E7E3]/60 flex-shrink-0 active:bg-[#EEEDEA] transition-colors"
          >
            {copied ? (
              <Check size={18} className="text-emerald-500" />
            ) : (
              <Copy size={18} className="text-[#999]" />
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {/* Native share — primary on mobile */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white text-[14px] font-medium active:bg-[#333] transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            Share Reel
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                // Reset everything for another reel
                setStep("director");
                setSelectedDirectorId("");
                setSelectedIds([]);
                setBrand("");
                setAgencyName("");
                setScreeningUrl("");
                setReelId("");
              }}
              className="flex-1 py-3 rounded-xl bg-white/70 border border-[#E8E7E3]/60 text-[13px] text-[#666] active:bg-[#EEEDEA] transition-colors"
            >
              New Reel
            </button>
            <button
              onClick={() => router.push(`/reels/${reelId}`)}
              className="flex-1 py-3 rounded-xl bg-white/70 border border-[#E8E7E3]/60 text-[13px] text-[#666] active:bg-[#EEEDEA] transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
