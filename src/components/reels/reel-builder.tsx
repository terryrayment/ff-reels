"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Film, X, ChevronDown, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  year: number | null;
  category: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: string | Date;
  viewCount?: number;
}

interface Director {
  id: string;
  name: string;
  rosterStatus: string;
  projects: Project[];
}

interface ReelBuilderProps {
  directors: Director[];
}

type SortMode = "default" | "newest" | "most-watched" | "brand" | "category" | "shortest";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "default", label: "All" },
  { value: "newest", label: "Newest" },
  { value: "most-watched", label: "Most Watched" },
  { value: "brand", label: "By Brand" },
  { value: "category", label: "By Category" },
  { value: "shortest", label: "Shortest" },
];

function DirectorRow({
  director,
  isSelected,
  onSelect,
}: {
  director: Director;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const hero = director.projects[0];
  const thumbSrc = hero?.muxPlaybackId
    ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=80&height=45&fit_mode=smartcrop`
    : hero?.thumbnailUrl || null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F7F6F3]/80 transition-colors ${
        isSelected ? "bg-[#F7F6F3]" : ""
      }`}
    >
      <div className="w-10 h-6 bg-[#EEEDEA] rounded-[2px] overflow-hidden flex-shrink-0">
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={10} className="text-[#ccc]" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-[#1A1A1A] font-medium truncate">
          {director.name}
        </p>
        <p className="text-[10px] text-[#999]">
          {director.projects.length} spot{director.projects.length !== 1 ? "s" : ""}
        </p>
      </div>
    </button>
  );
}

function DirectorDropdown({
  directors,
  selectedId,
  onSelect,
}: {
  directors: Director[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showOffRoster, setShowOffRoster] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
      setShowOffRoster(false);
    }
  }, [open]);

  const selected = directors.find((d) => d.id === selectedId);

  const rosterDirectors = directors.filter((d) => d.rosterStatus === "ROSTER");
  const offRosterDirectors = directors.filter((d) => d.rosterStatus === "OFF_ROSTER");

  const query = search.toLowerCase().trim();
  const filteredRoster = query
    ? rosterDirectors.filter((d) => d.name.toLowerCase().includes(query))
    : rosterDirectors;
  const filteredOffRoster = query
    ? offRosterDirectors.filter((d) => d.name.toLowerCase().includes(query))
    : offRosterDirectors;

  // Auto-show off-roster section when search matches off-roster directors
  const showOffRosterSection = showOffRoster || (query.length > 0 && filteredOffRoster.length > 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/60 backdrop-blur-md border border-[#E8E7E3]/50 text-left hover:border-[#ccc] transition-colors ring-1 ring-inset ring-white/50"
      >
        <span className={selected ? "text-[#1A1A1A] text-sm" : "text-[#999] text-sm"}>
          {selected
            ? `${selected.name} — ${selected.projects.length} spot${selected.projects.length !== 1 ? "s" : ""}`
            : "Select a director…"}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#999] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white/90 backdrop-blur-lg border border-[#E8E7E3]/60 shadow-lg ring-1 ring-inset ring-white/60 max-h-[400px] overflow-y-auto">
          {/* Search input */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-3 pt-3 pb-2 border-b border-[#E8E7E3]/40 z-10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search directors…"
              className="w-full px-3 py-1.5 text-[13px] bg-[#F7F6F3]/80 rounded-lg border border-[#E8E7E3]/50 focus:outline-none focus:border-[#ccc] placeholder:text-[#bbb]"
            />
          </div>

          {/* Roster directors */}
          {filteredRoster.length > 0 && (
            <div>
              {filteredRoster.map((director) => (
                <DirectorRow
                  key={director.id}
                  director={director}
                  isSelected={selectedId === director.id}
                  onSelect={() => {
                    onSelect(director.id);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          )}

          {/* Off-roster section */}
          {offRosterDirectors.length > 0 && (
            <div className="border-t border-[#E8E7E3]/40">
              {!showOffRosterSection ? (
                <button
                  type="button"
                  onClick={() => setShowOffRoster(true)}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[#F7F6F3]/60 transition-colors"
                >
                  <ChevronDown size={11} className="text-[#bbb]" />
                  <span className="text-[11px] text-[#999] uppercase tracking-[0.1em]">
                    Off-Roster Talent
                  </span>
                  <span className="text-[10px] text-[#ccc]">
                    ({offRosterDirectors.length})
                  </span>
                </button>
              ) : (
                <>
                  <div className="px-4 py-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-[#bbb] uppercase tracking-[0.1em]">
                      Off-Roster Talent
                    </span>
                  </div>
                  {filteredOffRoster.length > 0 ? (
                    filteredOffRoster.map((director) => (
                      <DirectorRow
                        key={director.id}
                        director={director}
                        isSelected={selectedId === director.id}
                        onSelect={() => {
                          onSelect(director.id);
                          setOpen(false);
                        }}
                      />
                    ))
                  ) : (
                    <p className="px-4 py-2 text-[11px] text-[#ccc]">
                      No off-roster matches
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* No results */}
          {filteredRoster.length === 0 && filteredOffRoster.length === 0 && query && (
            <p className="px-4 py-6 text-center text-[12px] text-[#999]">
              No directors matching &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ReelBuilder({ directors }: ReelBuilderProps) {
  const [selectedDirectorId, setSelectedDirectorId] = useState("");
  const [title, setTitle] = useState("");
  const [curatorialNote, setCuratorialNote] = useState("");
  const [brand, setBrand] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [producer, setProducer] = useState("");
  const [titleManuallyEdited] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [createdReelId, setCreatedReelId] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const selectedDirector = directors.find((d) => d.id === selectedDirectorId);
  const availableProjects = selectedDirector?.projects || [];

  // Master lookup: all projects across all directors (for the spot order panel)
  const allProjectsMap = useMemo(() => {
    const map = new Map<string, Project & { directorId: string; directorName: string }>();
    for (const d of directors) {
      for (const p of d.projects) {
        map.set(p.id, { ...p, directorId: d.id, directorName: d.name });
      }
    }
    return map;
  }, [directors]);

  // Which directors have selected spots (for multi-director reels)
  const selectedDirectorIds = useMemo(() => {
    const ids = new Set<string>();
    for (const pid of selectedProjectIds) {
      const p = allProjectsMap.get(pid);
      if (p) ids.add(p.directorId);
    }
    return ids;
  }, [selectedProjectIds, allProjectsMap]);

  const isMultiDirector = selectedDirectorIds.size > 1;
  const primaryDirectorId = selectedProjectIds.length > 0
    ? allProjectsMap.get(selectedProjectIds[0])?.directorId || selectedDirectorId
    : selectedDirectorId;

  // Auto-title: "{Director} for {Brand}" or "Multi-Director Reel for {Brand}"
  useEffect(() => {
    if (titleManuallyEdited) return;
    if (isMultiDirector && brand.trim()) {
      setTitle(`Multi-Director Reel for ${brand.trim()}`);
    } else if (isMultiDirector && !brand.trim()) {
      setTitle("");
    } else {
      const director = directors.find((d) => d.id === selectedDirectorId);
      if (director && brand.trim()) {
        setTitle(`${director.name} for ${brand.trim()}`);
      } else if (director && !brand.trim()) {
        setTitle("");
      }
    }
  }, [selectedDirectorId, brand, titleManuallyEdited, directors, isMultiDirector]);

  // Sorted/filtered projects for current director view
  const sortedProjects = useMemo(() => {
    const projects = [...availableProjects];
    switch (sortMode) {
      case "newest":
        return projects.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "brand":
        return projects.sort((a, b) =>
          (a.brand || "zzz").localeCompare(b.brand || "zzz")
        );
      case "category":
        return projects.sort((a, b) =>
          (a.category || "zzz").localeCompare(b.category || "zzz")
        );
      case "most-watched":
        return projects.sort(
          (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
        );
      case "shortest":
        return projects.sort(
          (a, b) => (a.duration || 999) - (b.duration || 999)
        );
      default:
        return projects;
    }
  }, [availableProjects, sortMode]);

  // Selected projects resolved from all directors (not just current one)
  // Slate always first
  const selectedProjects = useMemo(() => {
    const projects = selectedProjectIds
      .map((id) => allProjectsMap.get(id))
      .filter(Boolean) as (Project & { directorId: string; directorName: string })[];
    return projects.sort((a, b) => {
      const aSlate = a.title.toLowerCase().includes("slate") ? 0 : 1;
      const bSlate = b.title.toLowerCase().includes("slate") ? 0 : 1;
      return aSlate - bSlate;
    });
  }, [selectedProjectIds, allProjectsMap]);

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const removeProject = (projectId: string) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const handleSelectDirector = (id: string) => {
    setSelectedDirectorId(id);
    // Don't clear selections — allow multi-director reels
    setSortMode("default");
  };

  const handleSave = async () => {
    if (!primaryDirectorId || !title || selectedProjectIds.length === 0) return;
    setSaving(true);

    // Send project IDs in display order (slate first)
    const orderedIds = selectedProjects.map((p) => p.id);

    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId: primaryDirectorId,
          title,
          curatorialNote: curatorialNote || undefined,
          brand: brand || undefined,
          agencyName: agencyName || undefined,
          campaignName: campaignName || undefined,
          producer: producer || undefined,
          reelType: "CUSTOM",
          projectIds: orderedIds,
        }),
      });

      if (res.ok) {
        const reel = await res.json();
        setCreatedUrl(reel.screeningUrl);
        setCreatedReelId(reel.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalDuration = selectedProjects.reduce(
    (sum, p) => sum + (p.duration || 0),
    0
  );

  // Lightbox after reel creation
  if (createdUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-8">
          <h2 className="text-lg font-medium text-[#1A1A1A] mb-1">
            Reel Created
          </h2>
          <p className="text-[13px] text-[#999] mb-6">
            Share this screening link with the recipient.
          </p>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 px-4 py-3 bg-[#F7F6F3] rounded-lg text-[13px] text-[#1A1A1A] truncate font-mono">
              {createdUrl}
            </div>
            <button
              onClick={handleCopy}
              className="p-3 bg-[#F7F6F3] rounded-lg hover:bg-[#EEEDEA] transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Copy size={16} className="text-[#999]" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <a
              href={createdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#999] hover:text-[#1A1A1A] transition-colors"
            >
              <ExternalLink size={12} />
              Preview
            </a>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/reels/${createdReelId}`)}
              >
                View Reel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleCopy();
                  setTimeout(() => router.push(`/reels/${createdReelId}`), 300);
                }}
              >
                {copied ? "Copied!" : "Copy & Done"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_340px] gap-6">
      {/* Left — director select + spot grid */}
      <div>
        <DirectorDropdown
          directors={directors}
          selectedId={selectedDirectorId}
          onSelect={handleSelectDirector}
        />

        {selectedDirector && (
          <div className="mt-5">
            {/* Cross-director selection indicator */}
            {selectedProjectIds.length > 0 && (() => {
              const otherDirSpots = selectedProjectIds.filter((id) => {
                const p = allProjectsMap.get(id);
                return p && p.directorId !== selectedDirectorId;
              });
              const thisDirSpots = selectedProjectIds.filter((id) => {
                const p = allProjectsMap.get(id);
                return p && p.directorId === selectedDirectorId;
              });
              if (otherDirSpots.length > 0) {
                const otherDirs = new Set(otherDirSpots.map((id) => allProjectsMap.get(id)!.directorName));
                return (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50/80 border border-amber-200/50 text-[11px] text-amber-700">
                    {thisDirSpots.length} spot{thisDirSpots.length !== 1 ? "s" : ""} from {selectedDirector.name}
                    {" + "}
                    {otherDirSpots.length} from {Array.from(otherDirs).join(", ")}
                  </div>
                );
              }
              return null;
            })()}

            {/* Filter bar */}
            <div className="flex items-center gap-1.5 mb-4">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortMode(opt.value)}
                  className={`px-3 py-1 rounded-full text-[11px] transition-all duration-200 ${
                    sortMode === opt.value
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white/60 text-[#999] hover:text-[#666] hover:bg-white/80 border border-[#E8E7E3]/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-[#ccc]">
                {availableProjects.length} spot{availableProjects.length !== 1 ? "s" : ""}
              </span>
            </div>

            {sortedProjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {sortedProjects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project.id);
                  const thumbSrc = project.muxPlaybackId
                    ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
                    : project.thumbnailUrl || null;

                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={`text-left overflow-hidden rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-[#1A1A1A] shadow-sm"
                          : "border border-[#E8E7E3]/60 hover:border-[#ccc] hover:shadow-sm"
                      }`}
                    >
                      <div className="aspect-video bg-[#EEEDEA] relative rounded-t-[3px] overflow-hidden">
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
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-sm bg-[#1A1A1A] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {selectedProjectIds.indexOf(project.id) + 1}
                            </span>
                          </div>
                        )}
                        {project.duration && (
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 px-1 py-0.5 rounded-sm text-white/90">
                            {formatDuration(project.duration)}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 bg-white">
                        <p className="text-xs font-medium text-[#1A1A1A] truncate">
                          {project.title}
                        </p>
                        <p className="text-[10px] text-[#999] truncate mt-0.5">
                          {project.brand || "\u2014"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center rounded-xl border border-dashed border-[#E8E7E3]">
                <Film size={20} className="text-[#ddd] mx-auto mb-2" />
                <p className="text-sm text-[#999]">
                  No published spots for this director.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — reel details + spot order */}
      <div className="space-y-3 sticky top-8 self-start">
        <div className="rounded-xl bg-white/60 backdrop-blur-md border border-[#E8E7E3]/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-white/50 p-5 space-y-3">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
            Reel Details
          </h3>

          <Input
            id="brand"
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Cheerios"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <Input
              id="agencyName"
              label="Agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Optional"
            />
            <Input
              id="campaignName"
              label="Campaign"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <Input
            id="producer"
            label="Producer"
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            placeholder="Optional"
          />

          <Textarea
            id="note"
            label="Curatorial Note"
            value={curatorialNote}
            onChange={(e) => setCuratorialNote(e.target.value)}
            placeholder="Note for the recipient"
            rows={2}
          />

          {/* Create Reel — under curatorial note */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!primaryDirectorId || !title || selectedProjectIds.length === 0}
              className="w-full"
              size="lg"
            >
              Create Reel ({selectedProjects.length} spot{selectedProjects.length !== 1 ? "s" : ""})
            </Button>
          </div>
        </div>

        {/* Spot order */}
        <div className="rounded-xl bg-white/60 backdrop-blur-md border border-[#E8E7E3]/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-white/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Spot Order
            </h3>
            {selectedProjects.length > 0 && (
              <span className="text-[10px] text-[#ccc]">
                {selectedProjects.length} spot{selectedProjects.length !== 1 ? "s" : ""}
                {totalDuration > 0 && ` · ${formatDuration(totalDuration)}`}
              </span>
            )}
          </div>

          {selectedProjects.length > 0 ? (
            <div className="space-y-1.5">
              {isMultiDirector && (
                <p className="text-[9px] text-amber-600 uppercase tracking-wider mb-1">
                  Multi-Director Reel · {selectedDirectorIds.size} directors
                </p>
              )}
              {selectedProjects.map((project, i) => {
                const thumbSrc = project.muxPlaybackId
                  ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=64&height=36&fit_mode=smartcrop`
                  : project.thumbnailUrl || null;

                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F7F6F3]/60 group"
                  >
                    <span className="text-[10px] text-[#ccc] w-3 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <div className="w-8 h-5 bg-[#EEEDEA] rounded-[2px] overflow-hidden flex-shrink-0">
                      {thumbSrc ? (
                        <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={8} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-[#1A1A1A] truncate block">
                        {project.title}
                      </span>
                      {isMultiDirector && (project as Project & { directorName: string }).directorName && (
                        <span className="text-[9px] text-[#bbb] truncate block">
                          {(project as Project & { directorName: string }).directorName}
                        </span>
                      )}
                    </div>
                    {project.duration && (
                      <span className="text-[10px] text-[#ccc] tabular-nums flex-shrink-0">
                        {formatDuration(project.duration)}
                      </span>
                    )}
                    <button
                      onClick={() => removeProject(project.id)}
                      className="text-[#ddd] hover:text-[#999] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-4 text-center">
              Select spots from the left to build your reel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
